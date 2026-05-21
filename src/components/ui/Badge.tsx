import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles] as object]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: { ...typography.small },
  primary: { backgroundColor: '#EEF2FF' },
  primaryText: { color: colors.primary },
  secondary: { backgroundColor: colors.successBg },
  secondaryText: { color: colors.secondary },
  accent: { backgroundColor: '#FEF3C7' },
  accentText: { color: '#B45309' },
  muted: { backgroundColor: colors.surfaceMuted },
  mutedText: { color: colors.textSecondary },
});
