import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatCard } from '@/components/StatCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { DEMO_MODE, DATA_GO_KR_SERVICE_KEY } from '@/constants/config';
import { useAuth } from '@/context/AuthContext';
import { useDemo } from '@/context/DemoContext';
import { formatDeviceIdShort, getOrCreateDeviceId } from '@/lib/deviceId';
import { Input } from '@/components/ui/Input';
import { useQuestions } from '@/context/QuestionsContext';
import type { MockExamRecord } from '@/types/progress';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}분 ${s}초`;
}
import { levelProgress } from '@/constants/levels';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

function ProfileView({
  nickname,
  level,
  totalPoints,
  wrongCount,
  mockCount,
  lastExam,
  source,
  onReload,
  onSignOut,
  subtitle,
  deviceShort,
  nicknameDraft,
  onNicknameChange,
  onSaveNickname,
}: {
  nickname: string;
  level: number;
  totalPoints: number;
  wrongCount: number;
  mockCount: number;
  lastExam?: MockExamRecord;
  source: string | null;
  onReload: () => void;
  onSignOut?: () => void;
  subtitle: string;
  deviceShort?: string;
  nicknameDraft?: string;
  onNicknameChange?: (v: string) => void;
  onSaveNickname?: () => void;
}) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="프로필" subtitle={subtitle} />

        <Card style={styles.profileCard}>
          <Text style={styles.avatar}>🚗</Text>
          <Text style={styles.nickname}>{nickname}</Text>
          {onNicknameChange && onSaveNickname ? (
            <View style={styles.nicknameEdit}>
              <Input
                label="닉네임"
                value={nicknameDraft ?? nickname}
                onChangeText={onNicknameChange}
                maxLength={20}
                placeholder="이름"
              />
              <Button title="닉네임 저장" variant="outline" onPress={onSaveNickname} fullWidth />
            </View>
          ) : null}
          {deviceShort ? (
            <Text style={styles.deviceId}>기기 ID ···{deviceShort} (이 브라우저에만 저장)</Text>
          ) : null}
          <Badge label={`레벨 ${level}`} variant="accent" />
          <ProgressBar progress={levelProgress(totalPoints)} />
          <Text style={styles.totalLabel}>총 {totalPoints} 포인트</Text>
        </Card>

        <View style={styles.statsGrid}>
          <StatCard label="오답 보관" value={wrongCount} icon="❌" accent={colors.error} />
          <StatCard label="모의고사" value={mockCount} icon="📝" accent={colors.accent} />
        </View>

        {lastExam && (
          <Card style={styles.lastExam}>
            <Text style={styles.infoTitle}>최근 모의고사</Text>
            <Text style={styles.infoLine}>
              {lastExam.score}점 ({lastExam.passed ? '합격' : '불합격'}) ·{' '}
              {formatDuration(lastExam.durationSeconds)}
            </Text>
          </Card>
        )}

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>데이터 연결</Text>
          <Text style={styles.infoLine}>
            API 키: {DATA_GO_KR_SERVICE_KEY ? '설정됨 ✅' : '미설정 (샘플 문제 사용)'}
          </Text>
          <Text style={styles.infoLine}>
            문제 출처: {source === 'api' ? '도로교통공단 API' : '내장 샘플'}
          </Text>
          <Button title="문제 다시 불러오기" variant="outline" onPress={onReload} fullWidth />
        </Card>

        {onSignOut && (
          <Button title="로그아웃" variant="ghost" onPress={onSignOut} fullWidth />
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileDemo() {
  const { profile, wrongAnswers, mockExamHistory, setNickname } = useDemo();
  const { source, reload } = useQuestions();
  const [deviceShort, setDeviceShort] = useState<string>();
  const [nicknameDraft, setNicknameDraft] = useState(profile.nickname);

  useEffect(() => {
    void getOrCreateDeviceId().then((id) => setDeviceShort(formatDeviceIdShort(id)));
  }, []);

  useEffect(() => {
    setNicknameDraft(profile.nickname);
  }, [profile.nickname]);

  return (
    <ProfileView
      nickname={profile.nickname}
      level={profile.level}
      totalPoints={profile.total_points}
      wrongCount={wrongAnswers.length}
      mockCount={mockExamHistory.length}
      lastExam={mockExamHistory[0]}
      source={source}
      onReload={() => reload()}
      subtitle="개인 학습 모드 · 로그인 없이 이 기기에 자동 저장"
      deviceShort={deviceShort}
      nicknameDraft={nicknameDraft}
      onNicknameChange={setNicknameDraft}
      onSaveNickname={() => setNickname(nicknameDraft)}
    />
  );
}

function ProfileAuth() {
  const { profile: authProfile, signOut } = useAuth();
  const { profile: demoProfile, wrongAnswers, mockExamHistory } = useDemo();
  const { source, reload } = useQuestions();
  return (
    <ProfileView
      nickname={authProfile?.nickname ?? demoProfile.nickname}
      level={authProfile?.level ?? demoProfile.level}
      totalPoints={authProfile?.total_points ?? demoProfile.total_points}
      wrongCount={wrongAnswers.length}
      mockCount={mockExamHistory.length}
      lastExam={mockExamHistory[0]}
      source={source}
      onReload={() => reload()}
      onSignOut={() => signOut()}
      subtitle="Google 계정 · 클라우드 저장"
    />
  );
}

export default function ProfileScreen() {
  if (DEMO_MODE) return <ProfileDemo />;
  return <ProfileAuth />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  profileCard: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  avatar: { fontSize: 56 },
  nickname: { ...typography.h1, color: colors.text },
  nicknameEdit: { width: '100%', gap: spacing.sm },
  deviceId: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
  totalLabel: { ...typography.caption, color: colors.textSecondary },
  statsGrid: { flexDirection: 'row', gap: spacing.sm },
  infoCard: { gap: spacing.sm },
  lastExam: { gap: spacing.xs },
  infoTitle: { ...typography.bodyBold, color: colors.text },
  infoLine: { ...typography.caption, color: colors.textSecondary },
});
