import type { DemoStorage } from '@/context/DemoContext';
import { supabase } from '@/lib/supabase';

const DEFAULT_PROFILE = {
  nickname: '학습자',
  learning_points: 0,
  mock_exam_points: 0,
  total_points: 0,
  level: 1,
  best_mock_exam_score: 0,
};

export async function loadCloudProgress(userId: string): Promise<DemoStorage | null> {
  const { data, error } = await supabase
    .from('user_learning_progress')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data?.data) return null;

  const raw = data.data as Partial<DemoStorage>;
  return {
    profile: { ...DEFAULT_PROFILE, ...raw.profile },
    seenQuestionIds: raw.seenQuestionIds ?? [],
    curriculumQuestionIds: raw.curriculumQuestionIds ?? [],
    completedStageIds: raw.completedStageIds ?? [],
    wrongAnswers: raw.wrongAnswers ?? [],
    mockExamHistory: raw.mockExamHistory ?? [],
    stageResume: raw.stageResume ?? {},
  };
}

export async function saveCloudProgress(userId: string, storage: DemoStorage): Promise<void> {
  const { error } = await supabase.from('user_learning_progress').upsert(
    {
      user_id: userId,
      data: storage as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.warn('[progressSync] save failed', error.message);
  }
}

export async function syncProfilePointsFromProgress(
  userId: string,
  storage: DemoStorage,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      learning_points: storage.profile.learning_points,
      mock_exam_points: storage.profile.mock_exam_points,
      best_mock_exam_score: storage.profile.best_mock_exam_score,
      nickname: storage.profile.nickname,
    })
    .eq('id', userId);

  if (error) {
    console.warn('[progressSync] profile sync failed', error.message);
  }
}
