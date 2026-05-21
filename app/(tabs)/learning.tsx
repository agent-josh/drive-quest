import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashCard } from '@/components/learning/FlashCard';
import { LearningCourseMap } from '@/components/learning/LearningCourseMap';
import { LearningHero } from '@/components/learning/LearningHero';
import { StageCompleteCelebration } from '@/components/learning/StageCompleteCelebration';
import { QuizRunner, type QuizResult } from '@/components/quiz/QuizRunner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  LEARNING_TOTAL_QUESTIONS,
  buildSequentialCurriculum,
  getStageMeta,
  getStageSlice,
  isStageUnlocked,
} from '@/constants/learningCourse';
import { LEARNING_POINTS_PER_CORRECT } from '@/constants/config';
import { useDemo } from '@/context/DemoContext';
import { useQuestions } from '@/context/QuestionsContext';
import type { StageResumePhase } from '@/types/progress';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type Phase = 'map' | 'cards' | 'ready' | 'quiz' | 'finished';

export default function LearningScreen() {
  const router = useRouter();
  const { questions } = useQuestions();
  const {
    seenQuestionIds,
    completedStageIds,
    stageResume,
    markQuestionsSeen,
    getStageResume,
    saveStageResume,
    clearStageResume,
    finishLearningQuiz,
  } = useDemo();

  const [phase, setPhase] = useState<Phase>('map');
  const [activeStageId, setActiveStageId] = useState<number | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<typeof questions>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [lastQuizPassed, setLastQuizPassed] = useState(false);
  const [quizAttemptKey, setQuizAttemptKey] = useState(0);
  const [resumedSession, setResumedSession] = useState(false);

  const curriculum = useMemo(
    () => buildSequentialCurriculum(questions, LEARNING_TOTAL_QUESTIONS),
    [questions],
  );

  const activeStage = activeStageId ? getStageMeta(activeStageId) : null;

  const persistStageProgress = useCallback(
    (
      stageId: number,
      slice: typeof sessionQuestions,
      index: number,
      currentPhase: 'cards' | 'ready',
    ) => {
      if (slice.length === 0) return;
      const state =
        currentPhase === 'ready'
          ? { cardIndex: slice.length - 1, phase: 'ready' as StageResumePhase }
          : { cardIndex: index, phase: 'cards' as StageResumePhase };
      saveStageResume(stageId, state);
    },
    [saveStageResume],
  );

  const startStage = useCallback(
    (stageId: number, restart = false) => {
      const slice = getStageSlice(curriculum, stageId);
      if (slice.length === 0) return;

      setActiveStageId(stageId);
      setSessionQuestions(slice);
      setQuizResult(null);

      if (restart) {
        clearStageResume(stageId);
        setCardIndex(0);
        setResumedSession(false);
        setPhase('cards');
        return;
      }

      const saved = getStageResume(stageId);
      if (saved) {
        const idx = Math.max(0, Math.min(saved.cardIndex, slice.length - 1));
        setCardIndex(idx);
        setResumedSession(true);
        if (saved.phase === 'ready') {
          const seenIds = slice.map((q) => q.id);
          markQuestionsSeen(seenIds);
          setPhase('ready');
        } else {
          setPhase('cards');
        }
        return;
      }

      setCardIndex(0);
      setResumedSession(false);
      setPhase('cards');
    },
    [curriculum, getStageResume, clearStageResume, markQuestionsSeen],
  );

  const onCardNext = useCallback(() => {
    const current = sessionQuestions[cardIndex];
    if (current) markQuestionsSeen([current.id]);

    if (cardIndex + 1 >= sessionQuestions.length) {
      markQuestionsSeen(sessionQuestions.map((q) => q.id));
      if (activeStageId != null) {
        persistStageProgress(
          activeStageId,
          sessionQuestions,
          sessionQuestions.length - 1,
          'ready',
        );
      }
      setPhase('ready');
      return;
    }
    const nextIndex = cardIndex + 1;
    if (activeStageId != null) {
      persistStageProgress(activeStageId, sessionQuestions, nextIndex, 'cards');
    }
    setCardIndex(nextIndex);
  }, [cardIndex, sessionQuestions, markQuestionsSeen, activeStageId, persistStageProgress]);

  const onCardPrevious = useCallback(() => {
    if (cardIndex <= 0) return;
    const nextIndex = cardIndex - 1;
    if (activeStageId != null) {
      persistStageProgress(activeStageId, sessionQuestions, nextIndex, 'cards');
    }
    setCardIndex(nextIndex);
  }, [cardIndex, activeStageId, sessionQuestions, persistStageProgress]);

  const onQuizComplete = useCallback(
    (result: QuizResult) => {
      const threshold = Math.ceil(sessionQuestions.length * 0.6);
      const passed = result.correctCount >= threshold;
      setQuizResult(result);
      setLastQuizPassed(passed);
      if (activeStageId != null) {
        finishLearningQuiz(
          activeStageId,
          sessionQuestions,
          result.answers,
          result.correctCount,
          passed,
        );
      }
      setPhase('finished');
    },
    [sessionQuestions, activeStageId, finishLearningQuiz],
  );

  const backToMap = useCallback(() => {
    if (activeStageId != null && sessionQuestions.length > 0) {
      if (phase === 'cards' || phase === 'ready') {
        persistStageProgress(activeStageId, sessionQuestions, cardIndex, phase);
      }
    }
    setPhase('map');
    setActiveStageId(null);
    setSessionQuestions([]);
    setCardIndex(0);
    setQuizResult(null);
    setResumedSession(false);
  }, [activeStageId, sessionQuestions, cardIndex, phase, persistStageProgress]);

  const retryQuiz = useCallback(() => {
    setQuizResult(null);
    setQuizAttemptKey((k) => k + 1);
    setPhase('quiz');
  }, []);

  const startNextStage = useCallback(() => {
    if (activeStageId == null) {
      backToMap();
      return;
    }
    const nextId = activeStageId + 1;
    const slice = getStageSlice(curriculum, nextId);
    const unlockIds =
      lastQuizPassed && !completedStageIds.includes(activeStageId)
        ? [...completedStageIds, activeStageId]
        : completedStageIds;
    if (slice.length > 0 && isStageUnlocked(nextId, unlockIds)) {
      setQuizResult(null);
      setLastQuizPassed(false);
      startStage(nextId);
      return;
    }
    backToMap();
  }, [
    activeStageId,
    curriculum,
    completedStageIds,
    lastQuizPassed,
    startStage,
    backToMap,
  ]);

  const totalSeen = useMemo(
    () => curriculum.filter((q) => seenQuestionIds.includes(q.id)).length,
    [curriculum, seenQuestionIds],
  );

  const totalTarget = Math.min(curriculum.length, LEARNING_TOTAL_QUESTIONS);

  const currentQuestion = sessionQuestions[cardIndex];

  const quizPassThreshold = Math.ceil(sessionQuestions.length * 0.6);
  const quizPassed = phase === 'finished' && lastQuizPassed;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.inner}>
        {phase === 'map' ? (
          <>
            <LearningHero totalSeen={totalSeen} totalTarget={totalTarget} />
            {curriculum.length > 0 ? (
              <LearningCourseMap
                curriculum={curriculum}
                completedStageIds={completedStageIds}
                stageResume={stageResume}
                onSelectStage={(id) => startStage(id)}
              />
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>문제를 불러오는 중이에요…</Text>
              </Card>
            )}
          </>
        ) : (
          <>
            <Pressable onPress={backToMap} style={styles.backRow}>
              <Text style={styles.backText}>← 코스 선택</Text>
            </Pressable>
            {activeStage && currentQuestion && (
              <Badge
                label={
                  resumedSession
                    ? `이어하기 · 코스 ${activeStageId} · ${currentQuestion.questionNumber}번`
                    : `코스 ${activeStageId} · ${currentQuestion.questionNumber}번`
                }
                variant="primary"
              />
            )}

            {phase === 'cards' && currentQuestion && (
              <FlashCard
                key={`${activeStageId}-${currentQuestion.id}`}
                question={currentQuestion}
                index={cardIndex}
                total={sessionQuestions.length}
                canGoBack={cardIndex > 0}
                showSwipeCoach={cardIndex === 0 && !resumedSession}
                onNext={onCardNext}
                onPrevious={onCardPrevious}
              />
            )}

            {phase === 'ready' && (
              <StageCompleteCelebration
                questionCount={sessionQuestions.length}
                onStartQuiz={() => setPhase('quiz')}
                onBack={backToMap}
              />
            )}

            {phase === 'quiz' && (
              <View style={styles.quizWrap}>
                <QuizRunner
                  key={`quiz-${activeStageId}-${quizAttemptKey}`}
                  questions={sessionQuestions}
                  onComplete={onQuizComplete}
                />
              </View>
            )}

            {phase === 'finished' && quizResult && (
              <Card variant="highlight" style={styles.resultCard}>
                <Text style={styles.resultEmoji}>{quizPassed ? '🎉' : '💪'}</Text>
                <Text style={styles.resultTitle}>
                  {quizPassed ? '코스 클리어!' : '아쉬워요'}
                </Text>
                <Text style={styles.resultScore}>
                  {quizResult.correctCount} / {sessionQuestions.length} 정답
                </Text>
                <Text style={quizPassed ? styles.passHint : styles.failHint}>
                  {quizPassed
                    ? '다음 코스가 열렸어요. 계속 학습해 보세요!'
                    : `${quizPassThreshold}문항 이상(60%) 맞히면 다음 코스가 열려요.`}
                </Text>
                <Text style={styles.resultPoints}>
                  +{quizResult.correctCount * LEARNING_POINTS_PER_CORRECT} 학습 포인트
                </Text>
                {quizResult.correctCount < sessionQuestions.length && (
                  <Text style={styles.wrongHint}>틀린 문제는 오답노트에 저장되었습니다.</Text>
                )}
                {quizPassed ? (
                  <>
                    <Button title="다음 코스 학습하기" onPress={startNextStage} fullWidth />
                    <Button
                      title="코스 목록으로"
                      variant="outline"
                      onPress={backToMap}
                      fullWidth
                    />
                  </>
                ) : (
                  <>
                    <Button title="다시 퀴즈 보기" onPress={retryQuiz} fullWidth />
                    <Button
                      title="오답노트 보기"
                      variant="outline"
                      onPress={() => router.push('/(tabs)/wrong-answers')}
                      fullWidth
                    />
                    <Button title="다른 코스 학습" variant="ghost" onPress={backToMap} fullWidth />
                  </>
                )}
              </Card>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, padding: spacing.lg, gap: spacing.sm, minHeight: 0 },
  quizWrap: { flex: 1, minHeight: 0 },
  backRow: { marginBottom: spacing.xs },
  backText: { ...typography.bodyBold, color: colors.primary },
  emptyCard: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary },
  resultCard: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  resultEmoji: { fontSize: 48 },
  resultTitle: { ...typography.h2, color: colors.text },
  resultScore: { ...typography.h1, color: colors.primary },
  resultPoints: { ...typography.caption, color: colors.textSecondary },
  wrongHint: { ...typography.small, color: colors.error, textAlign: 'center' },
  passHint: { ...typography.caption, color: colors.success, textAlign: 'center' },
  failHint: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});
