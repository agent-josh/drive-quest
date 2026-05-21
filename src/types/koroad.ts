export type QuestionSource = 'api' | 'fallback';

/** 앱에서 사용하는 통일된 문제 형식 */
export interface AppQuestion {
  id: string;
  questionNumber: number;
  category: string;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface KoroadFetchResult {
  questions: AppQuestion[];
  source: QuestionSource;
  totalCount: number;
  error?: string;
}
