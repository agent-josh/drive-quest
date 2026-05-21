import type { AppQuestion } from '@/types/koroad';

/** 도로교통공단 문제은행 전체 (공공데이터 기준 1,000문항) */
export const LEARNING_TOTAL_QUESTIONS = 1000;
/** 코스(스테이지) 수 — 각 20문항 */
export const LEARNING_STAGE_COUNT = 50;
export const QUESTIONS_PER_STAGE = 20;

export interface LearningStage {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  carEmoji: string;
  roadColor: string;
  questionStart: number;
  questionEnd: number;
  chapterId: number;
}

export interface LearningChapter {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  themeColor: string;
  stageStart: number;
  stageEnd: number;
}

const STAGE_COLORS = ['#58CC02', '#1CB0F6', '#FF9600', '#CE82FF', '#FF4B4B'];
const STAGE_CARS = ['🚙', '🚕', '🚗', '🏎️', '🛻', '🚐', '🚓', '🚘'];

/** 50코스를 5챕터 × 10코스로 묶어 표시 */
export const LEARNING_CHAPTERS: LearningChapter[] = [
  { id: 1, title: '1교시 출발', subtitle: '문항 1~200', emoji: '🌱', themeColor: '#58CC02', stageStart: 1, stageEnd: 10 },
  { id: 2, title: '2교시 시내', subtitle: '문항 201~400', emoji: '🏙️', themeColor: '#1CB0F6', stageStart: 11, stageEnd: 20 },
  { id: 3, title: '3교시 고속', subtitle: '문항 401~600', emoji: '🛣️', themeColor: '#FF9600', stageStart: 21, stageEnd: 30 },
  { id: 4, title: '4교시 종합', subtitle: '문항 601~800', emoji: '⛽', themeColor: '#CE82FF', stageStart: 31, stageEnd: 40 },
  { id: 5, title: '5교시 결승', subtitle: '문항 801~1000', emoji: '🏁', themeColor: '#FF4B4B', stageStart: 41, stageEnd: 50 },
];

export function getStageMeta(stageId: number): LearningStage {
  const chapter = LEARNING_CHAPTERS.find(
    (c) => stageId >= c.stageStart && stageId <= c.stageEnd,
  ) ?? LEARNING_CHAPTERS[0];
  const questionStart = (stageId - 1) * QUESTIONS_PER_STAGE + 1;
  const questionEnd = stageId * QUESTIONS_PER_STAGE;
  return {
    id: stageId,
    title: `코스 ${stageId}`,
    subtitle: `문항 ${questionStart}~${questionEnd}번`,
    emoji: chapter.emoji,
    carEmoji: STAGE_CARS[(stageId - 1) % STAGE_CARS.length],
    roadColor: STAGE_COLORS[(stageId - 1) % STAGE_COLORS.length],
    questionStart,
    questionEnd,
    chapterId: chapter.id,
  };
}

/** 1~1000번 순서 고정, 중복 문항번호 제거 */
export function buildSequentialCurriculum(
  all: AppQuestion[],
  max = LEARNING_TOTAL_QUESTIONS,
): AppQuestion[] {
  const sorted = [...all].sort((a, b) => a.questionNumber - b.questionNumber);
  const seen = new Set<number>();
  const unique: AppQuestion[] = [];
  for (const q of sorted) {
    if (seen.has(q.questionNumber)) continue;
    seen.add(q.questionNumber);
    unique.push(q);
    if (unique.length >= max) break;
  }
  return unique;
}

export function getStageCount(curriculum: AppQuestion[]): number {
  return Math.min(
    LEARNING_STAGE_COUNT,
    Math.ceil(curriculum.length / QUESTIONS_PER_STAGE),
  );
}

export function getStageSlice(curriculum: AppQuestion[], stageId: number): AppQuestion[] {
  if (stageId < 1 || stageId > LEARNING_STAGE_COUNT) return [];
  const start = (stageId - 1) * QUESTIONS_PER_STAGE;
  return curriculum.slice(start, start + QUESTIONS_PER_STAGE);
}

export function countSeenInList(ids: string[], seen: string[]): number {
  const set = new Set(seen);
  return ids.filter((id) => set.has(id)).length;
}

export function isStageUnlocked(stageId: number, completedStageIds: number[]): boolean {
  if (stageId === 1) return true;
  return completedStageIds.includes(stageId - 1);
}

export function isStageCompleted(stageId: number, completedStageIds: number[]): boolean {
  return completedStageIds.includes(stageId);
}

export function getChapterProgress(
  chapter: LearningChapter,
  curriculum: AppQuestion[],
  completedStageIds: number[],
): number {
  let done = 0;
  for (let s = chapter.stageStart; s <= chapter.stageEnd; s += 1) {
    if (getStageSlice(curriculum, s).length === 0) continue;
    if (completedStageIds.includes(s)) done += 1;
  }
  const total = chapter.stageEnd - chapter.stageStart + 1;
  return total > 0 ? done / total : 0;
}
