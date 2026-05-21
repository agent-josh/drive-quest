export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          avatar_url: string | null;
          learning_points: number;
          mock_exam_points: number;
          total_points: number;
          level: number;
          best_mock_exam_score: number;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nickname: string;
          avatar_url?: string | null;
          learning_points?: number;
          mock_exam_points?: number;
          total_points?: number;
          level?: number;
          best_mock_exam_score?: number;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nickname?: string;
          avatar_url?: string | null;
          learning_points?: number;
          mock_exam_points?: number;
          total_points?: number;
          level?: number;
          best_mock_exam_score?: number;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          question_number: number;
          category: string;
          content: string;
          image_url: string | null;
          option_1: string;
          option_2: string;
          option_3: string;
          option_4: string;
          correct_answer: 1 | 2 | 3 | 4;
          explanation: string;
          difficulty: 1 | 2 | 3;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_number: number;
          category: string;
          content: string;
          image_url?: string | null;
          option_1: string;
          option_2: string;
          option_3: string;
          option_4: string;
          correct_answer: 1 | 2 | 3 | 4;
          explanation: string;
          difficulty?: 1 | 2 | 3;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_number?: number;
          category?: string;
          content?: string;
          image_url?: string | null;
          option_1?: string;
          option_2?: string;
          option_3?: string;
          option_4?: string;
          correct_answer?: 1 | 2 | 3 | 4;
          explanation?: string;
          difficulty?: 1 | 2 | 3;
          is_active?: boolean;
          created_at?: string;
        };
      };
      learning_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_date: string;
          questions_count: number;
          correct_count: number;
          points_earned: number;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_date?: string;
          questions_count?: number;
          correct_count?: number;
          points_earned?: number;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_date?: string;
          questions_count?: number;
          correct_count?: number;
          points_earned?: number;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      mock_exams: {
        Row: {
          id: string;
          user_id: string;
          total_questions: number;
          correct_count: number;
          score_percent: number;
          points_earned: number;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_questions: number;
          correct_count?: number;
          score_percent?: number;
          points_earned?: number;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_questions?: number;
          correct_count?: number;
          score_percent?: number;
          points_earned?: number;
          started_at?: string;
          completed_at?: string | null;
        };
      };
      user_question_attempts: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          learning_session_id: string | null;
          mock_exam_id: string | null;
          selected_answer: 1 | 2 | 3 | 4;
          is_correct: boolean;
          points_earned: number;
          attempted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          learning_session_id?: string | null;
          mock_exam_id?: string | null;
          selected_answer: 1 | 2 | 3 | 4;
          is_correct: boolean;
          points_earned?: number;
          attempted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          learning_session_id?: string | null;
          mock_exam_id?: string | null;
          selected_answer?: 1 | 2 | 3 | 4;
          is_correct?: boolean;
          points_earned?: number;
          attempted_at?: string;
        };
      };
      wrong_answers: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          selected_answer: 1 | 2 | 3 | 4;
          attempt_count: number;
          last_wrong_at: string;
          is_resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          selected_answer: 1 | 2 | 3 | 4;
          attempt_count?: number;
          last_wrong_at?: string;
          is_resolved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          selected_answer?: 1 | 2 | 3 | 4;
          attempt_count?: number;
          last_wrong_at?: string;
          is_resolved?: boolean;
          created_at?: string;
        };
      };
      user_learning_progress: {
        Row: {
          user_id: string;
          data: Json;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          data?: Json;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          data?: Json;
          updated_at?: string;
        };
      };
    };
    Views: {
      leaderboard: {
        Row: {
          id: string;
          nickname: string;
          avatar_url: string | null;
          total_points: number;
          level: number;
          learning_points: number;
          mock_exam_points: number;
          best_mock_exam_score: number;
          rank: number;
        };
      };
    };
  };
}
