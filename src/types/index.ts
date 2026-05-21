import type { Database } from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Question = Database['public']['Tables']['questions']['Row'];
export type LearningSession = Database['public']['Tables']['learning_sessions']['Row'];
export type MockExam = Database['public']['Tables']['mock_exams']['Row'];
export type UserQuestionAttempt = Database['public']['Tables']['user_question_attempts']['Row'];
export type WrongAnswer = Database['public']['Tables']['wrong_answers']['Row'];
export type LeaderboardEntry = Database['public']['Views']['leaderboard']['Row'];

export type AnswerOption = 1 | 2 | 3 | 4;

export interface QuestionWithOptions extends Question {
  options: [string, string, string, string];
}

export function toQuestionWithOptions(q: Question): QuestionWithOptions {
  return {
    ...q,
    options: [q.option_1, q.option_2, q.option_3, q.option_4],
  };
}

export interface LearningSessionState {
  sessionId: string | null;
  questions: QuestionWithOptions[];
  currentIndex: number;
  correctCount: number;
  pointsEarned: number;
  answered: boolean;
  lastResult: 'correct' | 'wrong' | null;
}

export interface MockExamState {
  examId: string | null;
  questions: QuestionWithOptions[];
  currentIndex: number;
  correctCount: number;
  answers: Record<string, AnswerOption>;
  completed: boolean;
}

export interface AuthState {
  session: { user: { id: string; email?: string } } | null;
  profile: Profile | null;
  isLoading: boolean;
}
