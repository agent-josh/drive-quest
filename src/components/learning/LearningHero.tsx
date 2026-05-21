import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface LearningHeroProps {
  totalSeen: number;
  totalTarget: number;
}

export function LearningHero({ totalSeen, totalTarget }: LearningHeroProps) {
  const progress = totalTarget > 0 ? totalSeen / totalTarget : 0;
  const pct = Math.round(progress * 100);

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>DRIVE QUEST</Text>
      <Text style={styles.title}>필기시험 준비하기</Text>
      <Text style={styles.tagline}>
        하루 20문항만 가볍게 달려도, 1종 필기 완주 코스가 눈앞에!
      </Text>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressLabel}>전체 학습 진행</Text>
            <Text style={styles.progressMeta}>
              {totalSeen.toLocaleString()} / {totalTarget.toLocaleString()} 문항
            </Text>
          </View>
          <View style={styles.pctRing}>
            <Text style={styles.pctValue}>{pct}</Text>
            <Text style={styles.pctUnit}>%</Text>
          </View>
        </View>
        <ProgressBar progress={progress} color={colors.primary} height={10} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.primary,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  progressMeta: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pctRing: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#EEF2FF',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  pctValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    lineHeight: 30,
  },
  pctUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
    marginBottom: 4,
    marginLeft: 1,
  },
});
