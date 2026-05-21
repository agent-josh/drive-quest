import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles] as object]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  fullWidth: { width: '100%' },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  ghost: { backgroundColor: colors.surfaceMuted },
  danger: { backgroundColor: colors.error },
  text: { ...typography.bodyBold },
  primaryText: { color: '#fff' },
  secondaryText: { color: '#fff' },
  outlineText: { color: colors.primary },
  ghostText: { color: colors.text },
  dangerText: { color: '#fff' },
});
