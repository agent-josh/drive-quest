import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppQuestion } from '@/types/koroad';

const CACHE_KEY = 'drive-quest-questions-cache-v2';

interface QuestionsCachePayload {
  questions: AppQuestion[];
  savedAt: string;
  source: 'api' | 'fallback';
}

export async function loadQuestionsCache(): Promise<QuestionsCachePayload | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuestionsCachePayload;
    if (!parsed?.questions?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveQuestionsCache(
  questions: AppQuestion[],
  source: 'api' | 'fallback',
): Promise<void> {
  const payload: QuestionsCachePayload = {
    questions,
    savedAt: new Date().toISOString(),
    source,
  };
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}
