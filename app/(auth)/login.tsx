import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { APP_NAME } from '@/constants/config';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (!error) router.replace('/');
    return { error };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.logo}>🛣️</Text>
        <ScreenHeader
          title={APP_NAME}
          subtitle="Google 계정으로 로그인하면 학습 기록이 클라우드에 저장됩니다."
        />
        <GoogleSignInButton onPress={handleGoogle} label="Google로 시작하기" />
        <Text style={styles.hint}>
          첫 로그인 시 자동으로 가입됩니다.{'\n'}이메일·비밀번호 가입은 지원하지 않습니다.
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← 돌아가기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  logo: { fontSize: 56, textAlign: 'center' },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  back: {
    ...typography.caption,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
});
