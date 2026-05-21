import { useAuth } from '@/context/AuthContext';
import { DemoProvider } from '@/context/DemoContext';
import { QuestionsProvider } from '@/context/QuestionsContext';
import { SplashGate } from '@/components/SplashGate';

/** 로그인 사용자 학습 데이터를 Supabase와 동기화 */
export function ProgressBridge({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  return (
    <DemoProvider userId={userId}>
      <QuestionsProvider>
        <SplashGate>{children}</SplashGate>
      </QuestionsProvider>
    </DemoProvider>
  );
}
