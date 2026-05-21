import type { AppQuestion } from '@/types/koroad';

export interface WrongAnswerEntry {
  questionId: string;
  question: AppQuestion;
  wrongCount: number;
  lastWrongAt: string;
}

export interface MockExamRecord {
  id: string;
  score: number;
  correctCount: number;
  totalCount: number;
  passed: boolean;
  completedAt: string;
  durationSeconds: number;
}

export interface QuizAnswerRecord {
  questionId: string;
  selected: number;
  correct: boolean;
}

export type StageResumePhase = 'cards' | 'ready';

export interface StageResumeState {
  cardIndex: number;
  phase: StageResumePhase;
}
