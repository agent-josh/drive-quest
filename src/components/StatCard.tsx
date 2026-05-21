import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  accent?: string;
}

export function StatCard({ label, value, icon, accent = colors.primary }: StatCardProps) {
  return (
    <Card style={styles.card}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, alignItems: 'center', gap: spacing.xs, minWidth: 100 },
  icon: { fontSize: 24 },
  value: { ...typography.h2 },
  label: { ...typography.small, color: colors.textSecondary, textAlign: 'center' },
});
