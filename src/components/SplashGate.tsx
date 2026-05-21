import { useEffect, useRef, useState } from 'react';
import { SplashScreen } from '@/components/SplashScreen';
import { useQuestions } from '@/context/QuestionsContext';

const MIN_SPLASH_MS = 1600;

export function SplashGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useQuestions();
  const [visible, setVisible] = useState(true);
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    if (isLoading) return;
    const elapsed = Date.now() - mountedAt.current;
    const t = setTimeout(() => setVisible(false), Math.max(0, MIN_SPLASH_MS - elapsed));
    return () => clearTimeout(t);
  }, [isLoading]);

  if (visible) return <SplashScreen />;
  return children;
}

export function AuthSplashGate({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    const elapsed = Date.now() - mountedAt.current;
    const t = setTimeout(() => setVisible(false), Math.max(0, MIN_SPLASH_MS - elapsed));
    return () => clearTimeout(t);
  }, []);

  if (visible) return <SplashScreen subtitle="운전면허 필기 준비" />;
  return children;
}
