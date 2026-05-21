import { Redirect } from 'expo-router';

/** 홈 탭 비활성 — 기본 진입은 오늘의 학습 */
export default function HomeRedirect() {
  return <Redirect href="/(tabs)/learning" />;
}
