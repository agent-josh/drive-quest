import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchKoroadQuestions } from '@/lib/koroadApi';
import { loadQuestionsCache, saveQuestionsCache } from '@/lib/questionsCache';
import type { AppQuestion, QuestionSource } from '@/types/koroad';

interface QuestionsContextValue {
  questions: AppQuestion[];
  source: QuestionSource | null;
  totalCount: number;
  isLoading: boolean;
  statusMessage: string | null;
  reload: () => Promise<void>;
}

const QuestionsContext = createContext<QuestionsContextValue | null>(null);

export function QuestionsProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<AppQuestion[]>([]);
  const [source, setSource] = useState<QuestionSource | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const applyResult = useCallback(
    async (
      result: Awaited<ReturnType<typeof fetchKoroadQuestions>>,
      fromCache = false,
    ) => {
      setQuestions(result.questions);
      setSource(result.source);
      setTotalCount(result.totalCount);
      setStatusMessage(
        fromCache
          ? '저장된 문제로 빠르게 시작했습니다. 최신 목록을 확인하는 중…'
          : (result.error ?? null),
      );
      if (result.source === 'api' && result.questions.length > 50) {
        await saveQuestionsCache(result.questions, result.source);
      }
    },
    [],
  );

  const reload = useCallback(async () => {
    const cached = await loadQuestionsCache();
    if (cached && cached.questions.length >= 50) {
      await applyResult(
        {
          questions: cached.questions,
          source: cached.source,
          totalCount: cached.questions.length,
          error: null,
        },
        true,
      );
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    const result = await fetchKoroadQuestions({ maxItems: 1000 });
    await applyResult(result);
    setIsLoading(false);
  }, [applyResult]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo(
    () => ({
      questions,
      source,
      totalCount,
      isLoading,
      statusMessage,
      reload,
    }),
    [questions, source, totalCount, isLoading, statusMessage, reload],
  );

  return (
    <QuestionsContext.Provider value={value}>{children}</QuestionsContext.Provider>
  );
}

export function useQuestions() {
  const ctx = useContext(QuestionsContext);
  if (!ctx) throw new Error('useQuestions must be used within QuestionsProvider');
  return ctx;
}
