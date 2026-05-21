import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NicknameWelcome } from '@/components/NicknameWelcome';
import { ProgressBridge } from '@/components/ProgressBridge';
import { AuthSplashGate, SplashGate } from '@/components/SplashGate';
import { DEMO_MODE } from '@/constants/config';
import { AuthProvider } from '@/context/AuthContext';
import { DemoProvider } from '@/context/DemoContext';
import { QuestionsProvider } from '@/context/QuestionsContext';
import { colors } from '@/theme/colors';

function AppProviders({ children }: { children: React.ReactNode }) {
  if (DEMO_MODE) {
    return (
      <DemoProvider>
        <QuestionsProvider>
          <SplashGate>
            <NicknameWelcome />
            {children}
          </SplashGate>
        </QuestionsProvider>
      </DemoProvider>
    );
  }
  return (
    <AuthProvider>
      <ProgressBridge>{children}</ProgressBridge>
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          {!DEMO_MODE && (
            <>
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(auth)" />
            </>
          )}
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="questions/index" />
        </Stack>
      </AppProviders>
    </SafeAreaProvider>
  );
}
