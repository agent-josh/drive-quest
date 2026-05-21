import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import { fetchKoroadQuestions, getFallbackQuestions } from '@/lib/koroadApi';
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

  const reload = useCallback(async () => {
    setIsLoading(true);

    if (Platform.OS === 'web') {
      const fallback = getFallbackQuestions();
      setQuestions(fallback);
      setSource('fallback');
      setTotalCount(fallback.length);
      setStatusMessage(
        '웹에서는 빠른 실행을 위해 샘플 문제로 시작합니다. (전체 1,000문항은 앱·API 연동 시)',
      );
      setIsLoading(false);

      void fetchKoroadQuestions({ maxItems: 1000 }).then((result) => {
        if (result.questions.length > fallback.length) {
          setQuestions(result.questions);
          setSource(result.source);
          setTotalCount(result.totalCount);
          setStatusMessage(result.error ?? null);
        }
      });
      return;
    }

    const result = await fetchKoroadQuestions({ maxItems: 1000 });
    setQuestions(result.questions);
    setSource(result.source);
    setTotalCount(result.totalCount);
    setStatusMessage(result.error ?? null);
    setIsLoading(false);
  }, []);

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
