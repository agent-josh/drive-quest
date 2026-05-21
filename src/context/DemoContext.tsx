import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  loadCloudProgress,
  saveCloudProgress,
  syncProfilePointsFromProgress,
} from '@/lib/progressSync';
import {
  LEARNING_POINTS_PER_CORRECT,
  MOCK_EXAM_PASS_SCORE,
} from '@/constants/config';
import { calculateLevel } from '@/constants/levels';
import type { AppQuestion } from '@/types/koroad';
import type { MockExamRecord, StageResumeState, WrongAnswerEntry } from '@/types/progress';

export interface DemoProfile {
  nickname: string;
  learning_points: number;
  mock_exam_points: number;
  total_points: number;
  level: number;
  best_mock_exam_score: number;
}

export interface DemoStorage {
  profile: DemoProfile;
  seenQuestionIds: string[];
  curriculumQuestionIds: string[];
  completedStageIds: number[];
  wrongAnswers: WrongAnswerEntry[];
  mockExamHistory: MockExamRecord[];
  stageResume: Record<string, StageResumeState>;
}

interface DemoContextValue {
  profile: DemoProfile;
  seenQuestionIds: string[];
  curriculumQuestionIds: string[];
  completedStageIds: number[];
  wrongAnswers: WrongAnswerEntry[];
  mockExamHistory: MockExamRecord[];
  addLearningPoints: (correctDelta: number) => void;
  markQuestionsSeen: (ids: string[]) => void;
  markStageCompleted: (stageId: number) => void;
  setCurriculumIds: (ids: string[]) => void;
  recordWrongAnswers: (questions: AppQuestion[], answers: Map<string, number>) => void;
  /** 퀴즈 종료 시 오답·포인트·코스 완료를 한 번에 저장 (연속 persist 덮어쓰기 방지) */
  finishLearningQuiz: (
    stageId: number,
    questions: AppQuestion[],
    answers: Map<string, number>,
    correctCount: number,
    passed: boolean,
  ) => void;
  recordMockExam: (record: Omit<MockExamRecord, 'id'>) => void;
  removeWrongAnswer: (questionId: string) => void;
  setNickname: (nickname: string) => void;
  stageResume: Record<string, StageResumeState>;
  getStageResume: (stageId: number) => StageResumeState | undefined;
  saveStageResume: (stageId: number, state: StageResumeState) => void;
  clearStageResume: (stageId: number) => void;
  resetProgress: () => Promise<void>;
}

const STORAGE_KEY = 'drive-quest-demo-progress';

const DEFAULT_PROFILE: DemoProfile = {
  nickname: '학습자',
  learning_points: 0,
  mock_exam_points: 0,
  total_points: 0,
  level: 1,
  best_mock_exam_score: 0,
};

const DEFAULT_STORAGE: DemoStorage = {
  profile: DEFAULT_PROFILE,
  seenQuestionIds: [],
  curriculumQuestionIds: [],
  completedStageIds: [],
  wrongAnswers: [],
  mockExamHistory: [],
  stageResume: {},
};

function mergeWrongAnswers(
  prev: WrongAnswerEntry[],
  questions: AppQuestion[],
  answers: Map<string, number>,
): WrongAnswerEntry[] {
  const map = new Map(prev.map((w) => [w.questionId, w]));
  const now = new Date().toISOString();

  for (const q of questions) {
    const selected = answers.get(q.id);
    if (selected === undefined) continue;
    if (Number(selected) === Number(q.correctAnswer)) continue;

    const existing = map.get(q.id);
    if (existing) {
      map.set(q.id, {
        ...existing,
        question: q,
        wrongCount: existing.wrongCount + 1,
        lastWrongAt: now,
      });
    } else {
      map.set(q.id, {
        questionId: q.id,
        question: q,
        wrongCount: 1,
        lastWrongAt: now,
      });
    }
  }

  return [...map.values()];
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({
  children,
  userId = null,
}: {
  children: React.ReactNode;
  /** 로그인 사용자 ID — 설정 시 Supabase에 학습 진행 동기화 */
  userId?: string | null;
}) {
  const [storage, setStorage] = useState<DemoStorage>(DEFAULT_STORAGE);
  const [cloudReady, setCloudReady] = useState(!userId);

  const cloudSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleCloudSave = useCallback(
    (next: DemoStorage) => {
      if (!userId) return;
      if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current);
      cloudSaveTimer.current = setTimeout(() => {
        void saveCloudProgress(userId, next);
        void syncProfilePointsFromProgress(userId, next);
      }, 700);
    },
    [userId],
  );

  useEffect(() => {
    if (userId) {
      let cancelled = false;
      void loadCloudProgress(userId).then((cloud) => {
        if (cancelled) return;
        if (cloud) setStorage(cloud);
        setCloudReady(true);
      });
      return () => {
        cancelled = true;
      };
    }

    void AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (userId || !raw) return;
      try {
        const parsed = JSON.parse(raw) as Partial<DemoStorage> & { profile?: DemoProfile };
        setStorage({
          profile: { ...DEFAULT_PROFILE, ...parsed.profile },
          seenQuestionIds: parsed.seenQuestionIds ?? [],
          curriculumQuestionIds: parsed.curriculumQuestionIds ?? [],
          completedStageIds: parsed.completedStageIds ?? [],
          wrongAnswers: parsed.wrongAnswers ?? [],
          mockExamHistory: parsed.mockExamHistory ?? [],
          stageResume: parsed.stageResume ?? {},
        });
      } catch {
        /* ignore */
      }
    });
    if (!userId) setCloudReady(true);
  }, [userId]);

  const persist = useCallback(
    async (next: DemoStorage) => {
      setStorage(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      scheduleCloudSave(next);
    },
    [scheduleCloudSave],
  );

  const commitStorage = useCallback(
    (updater: (prev: DemoStorage) => DemoStorage) => {
      setStorage((prev) => {
        const next = updater(prev);
        void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        scheduleCloudSave(next);
        return next;
      });
    },
    [scheduleCloudSave],
  );

  const addLearningPoints = useCallback(
    (correctDelta: number) => {
      commitStorage((prev) => {
        const earned = correctDelta * LEARNING_POINTS_PER_CORRECT;
        const learning_points = prev.profile.learning_points + earned;
        const total_points = learning_points + prev.profile.mock_exam_points;
        return {
          ...prev,
          profile: {
            ...prev.profile,
            learning_points,
            total_points,
            level: calculateLevel(total_points),
          },
        };
      });
    },
    [commitStorage],
  );

  const markQuestionsSeen = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setStorage((prev) => {
      const merged = [...new Set([...prev.seenQuestionIds, ...ids])];
      if (merged.length === prev.seenQuestionIds.length) return prev;
      const next = { ...prev, seenQuestionIds: merged };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setCurriculumIds = useCallback(
    (ids: string[]) => {
      commitStorage((prev) => {
        if (
          ids.length === prev.curriculumQuestionIds.length &&
          ids.every((id, i) => id === prev.curriculumQuestionIds[i])
        ) {
          return prev;
        }
        return { ...prev, curriculumQuestionIds: ids };
      });
    },
    [commitStorage],
  );

  const markStageCompleted = useCallback(
    (stageId: number) => {
      commitStorage((prev) => {
        if (prev.completedStageIds.includes(stageId)) return prev;
        const { [String(stageId)]: _, ...restResume } = prev.stageResume;
        return {
          ...prev,
          completedStageIds: [...prev.completedStageIds, stageId].sort((a, b) => a - b),
          stageResume: restResume,
        };
      });
    },
    [commitStorage],
  );

  const getStageResume = useCallback(
    (stageId: number) => storage.stageResume[String(stageId)],
    [storage.stageResume],
  );

  const saveStageResume = useCallback((stageId: number, state: StageResumeState) => {
    setStorage((prev) => {
      const key = String(stageId);
      const existing = prev.stageResume[key];
      if (existing?.cardIndex === state.cardIndex && existing?.phase === state.phase) {
        return prev;
      }
      const next = {
        ...prev,
        stageResume: { ...prev.stageResume, [key]: state },
      };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearStageResume = useCallback(
    (stageId: number) => {
      commitStorage((prev) => {
        const { [String(stageId)]: _, ...rest } = prev.stageResume;
        return { ...prev, stageResume: rest };
      });
    },
    [commitStorage],
  );

  const recordWrongAnswers = useCallback(
    (questions: AppQuestion[], answers: Map<string, number>) => {
      commitStorage((prev) => ({
        ...prev,
        wrongAnswers: mergeWrongAnswers(prev.wrongAnswers, questions, answers),
      }));
    },
    [commitStorage],
  );

  const finishLearningQuiz = useCallback(
    (
      stageId: number,
      questions: AppQuestion[],
      answers: Map<string, number>,
      correctCount: number,
      passed: boolean,
    ) => {
      commitStorage((prev) => {
        const earned = correctCount * LEARNING_POINTS_PER_CORRECT;
        const learning_points = prev.profile.learning_points + earned;
        const total_points = learning_points + prev.profile.mock_exam_points;

        let completedStageIds = prev.completedStageIds;
        const stageResume = { ...prev.stageResume };

        if (passed) {
          if (!completedStageIds.includes(stageId)) {
            completedStageIds = [...completedStageIds, stageId].sort((a, b) => a - b);
          }
          delete stageResume[String(stageId)];
        } else {
          stageResume[String(stageId)] = {
            cardIndex: Math.max(0, questions.length - 1),
            phase: 'ready',
          };
        }

        return {
          ...prev,
          wrongAnswers: mergeWrongAnswers(prev.wrongAnswers, questions, answers),
          profile: {
            ...prev.profile,
            learning_points,
            total_points,
            level: calculateLevel(total_points),
          },
          completedStageIds,
          stageResume,
        };
      });
    },
    [commitStorage],
  );

  const recordMockExam = useCallback(
    (record: Omit<MockExamRecord, 'id'>) => {
      commitStorage((prev) => {
        const id = `mock-${Date.now()}`;
        const mockPoints = Math.round(record.score / 2);
        const mock_exam_points = prev.profile.mock_exam_points + mockPoints;
        const total_points = prev.profile.learning_points + mock_exam_points;
        const best = Math.max(prev.profile.best_mock_exam_score, record.score);

        return {
          ...prev,
          profile: {
            ...prev.profile,
            mock_exam_points,
            total_points,
            level: calculateLevel(total_points),
            best_mock_exam_score: best,
          },
          mockExamHistory: [{ ...record, id }, ...prev.mockExamHistory].slice(0, 30),
        };
      });
    },
    [commitStorage],
  );

  const removeWrongAnswer = useCallback(
    (questionId: string) => {
      commitStorage((prev) => ({
        ...prev,
        wrongAnswers: prev.wrongAnswers.filter((w) => w.questionId !== questionId),
      }));
    },
    [commitStorage],
  );

  const setNickname = useCallback(
    (nickname: string) => {
      const trimmed = nickname.trim().slice(0, 20) || DEFAULT_PROFILE.nickname;
      commitStorage((prev) => ({
        ...prev,
        profile: { ...prev.profile, nickname: trimmed },
      }));
    },
    [commitStorage],
  );

  const resetProgress = useCallback(async () => {
    await persist(DEFAULT_STORAGE);
  }, [persist]);

  const value = useMemo(
    () => ({
      profile: storage.profile,
      seenQuestionIds: storage.seenQuestionIds,
      curriculumQuestionIds: storage.curriculumQuestionIds,
      completedStageIds: storage.completedStageIds,
      wrongAnswers: storage.wrongAnswers,
      mockExamHistory: storage.mockExamHistory,
      addLearningPoints,
      markQuestionsSeen,
      markStageCompleted,
      setCurriculumIds,
      recordWrongAnswers,
      finishLearningQuiz,
      recordMockExam,
      stageResume: storage.stageResume,
      getStageResume,
      saveStageResume,
      clearStageResume,
      removeWrongAnswer,
      setNickname,
      resetProgress,
    }),
    [
      storage,
      addLearningPoints,
      markQuestionsSeen,
      markStageCompleted,
      setCurriculumIds,
      recordWrongAnswers,
      finishLearningQuiz,
      recordMockExam,
      getStageResume,
      saveStageResume,
      clearStageResume,
      removeWrongAnswer,
      setNickname,
      resetProgress,
    ],
  );

  if (!cloudReady) return null;

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}
