import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuth } from '@/context/AuthContext';
import { APP_NAME } from '@/constants/config';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const STEPS = [
  { title: '운전면허 필기,\n게임처럼 공부하세요', desc: '코스별 20문항 · 확인 퀴즈로 실력을 쌓아보세요.' },
  { title: '포인트를 모아\n레벨업하세요', desc: '학습·모의고사 포인트로 성장합니다.' },
  { title: '오답노트로\n약점만 복습하세요', desc: '틀린 문제는 자동 저장됩니다.' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { session, profile, signInWithGoogle } = useAuth();

  const completeOnboarding = async () => {
    if (session?.user?.id) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', session.user.id);
    }
    router.replace('/(tabs)/learning');
  };

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (!error) router.replace('/');
    return { error };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>🛣️</Text>
        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.tagline}>운전면허 필기 퀘스트</Text>
      </View>

      <View style={styles.steps}>
        {STEPS.map((step, i) => (
          <View key={step.title} style={styles.stepCard}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <ProgressBar progress={1} />
        {session && profile ? (
          <Button title="시작하기" onPress={completeOnboarding} fullWidth />
        ) : (
          <GoogleSignInButton onPress={handleGoogle} label="Google로 시작하기" />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  hero: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl },
  logo: { fontSize: 64 },
  appName: { ...typography.hero, color: colors.primary },
  tagline: { ...typography.body, color: colors.textSecondary },
  steps: { gap: spacing.md },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { ...typography.bodyBold, color: colors.primary, fontSize: 14 },
  stepText: { flex: 1, gap: spacing.xs },
  stepTitle: { ...typography.bodyBold, color: colors.text },
  stepDesc: { ...typography.caption, color: colors.textSecondary },
  footer: { gap: spacing.md, paddingBottom: spacing.md },
});
