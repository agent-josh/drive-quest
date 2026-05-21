import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useDemo } from '@/context/DemoContext';
import type { LeaderboardEntry } from '@/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const PLACEHOLDER_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', nickname: '운전왕김씨', avatar_url: null, total_points: 1250, level: 13, learning_points: 800, mock_exam_points: 450, best_mock_exam_score: 95, rank: 1 },
  { id: '2', nickname: '필기마스터', avatar_url: null, total_points: 980, level: 10, learning_points: 600, mock_exam_points: 380, best_mock_exam_score: 88, rank: 2 },
  { id: '3', nickname: '초보탈출', avatar_url: null, total_points: 720, level: 8, learning_points: 500, mock_exam_points: 220, best_mock_exam_score: 75, rank: 3 },
  { id: '4', nickname: '도로위히어로', avatar_url: null, total_points: 450, level: 5, learning_points: 300, mock_exam_points: 150, best_mock_exam_score: 70, rank: 4 },
];

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <Text style={styles.medal}>🥇</Text>;
  if (rank === 2) return <Text style={styles.medal}>🥈</Text>;
  if (rank === 3) return <Text style={styles.medal}>🥉</Text>;
  return <Text style={styles.rankNum}>{rank}</Text>;
}

export default function RankingScreen() {
  const { profile } = useDemo();

  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isMe = false;
    return (
      <Card style={[styles.row, isMe && styles.rowMe]}>
        <RankMedal rank={item.rank} />
        <View style={styles.userInfo}>
          <Text style={styles.nickname}>
            {item.nickname}
            {isMe ? ' (나)' : ''}
          </Text>
          <Badge label={`Lv.${item.level}`} variant="muted" />
        </View>
        <Text style={styles.points}>{item.total_points}P</Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <ScreenHeader
          title="랭킹"
          subtitle="데모 · 샘플 순위 (로그인·서버 연동 전)"
        />
        <FlatList
          data={PLACEHOLDER_LEADERBOARD}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Card variant="highlight" style={styles.myRank}>
              <Text style={styles.myRankLabel}>내 순위 (placeholder)</Text>
              <Text style={styles.myRankValue}>
                {profile.nickname} · {profile.total_points}P
              </Text>
            </Card>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  list: { gap: spacing.sm, paddingBottom: spacing.xxl },
  myRank: { marginBottom: spacing.md, alignItems: 'center', gap: spacing.xs },
  myRankLabel: { ...typography.caption, color: colors.textSecondary },
  myRankValue: { ...typography.h3, color: colors.primary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowMe: { borderColor: colors.primary, borderWidth: 2 },
  medal: { fontSize: 24, width: 32, textAlign: 'center' },
  rankNum: { ...typography.bodyBold, color: colors.textMuted, width: 32, textAlign: 'center' },
  userInfo: { flex: 1, gap: spacing.xs },
  nickname: { ...typography.bodyBold, color: colors.text },
  points: { ...typography.h3, color: colors.primary },
});
