import { Redirect } from 'expo-router';

/** Google 단일 로그인 — 회원가입 화면은 로그인으로 통합 */
export default function SignupScreen() {
  return <Redirect href="/(auth)/login" />;
}
