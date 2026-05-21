import { Redirect } from 'expo-router';
import { DEMO_MODE } from '@/constants/config';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  if (DEMO_MODE) {
    return <Redirect href="/(tabs)/learning" />;
  }
  return <AuthRedirect />;
}

function AuthRedirect() {
  const { session, profile, isLoading } = useAuth();

  if (isLoading) return null;

  if (!session) return <Redirect href="/(onboarding)" />;
  if (!profile?.onboarding_completed) return <Redirect href="/(onboarding)" />;

  return <Redirect href="/(tabs)/learning" />;
}
