import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

interface CardProps extends ViewProps {
  variant?: 'default' | 'highlight' | 'success' | 'error';
}

export function Card({ children, variant = 'default', style, ...props }: CardProps) {
  return (
    <View style={[styles.card, styles[variant], style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  default: {},
  highlight: {
    borderColor: colors.primaryLight,
    backgroundColor: '#EEF2FF',
  },
  success: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  error: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
});
