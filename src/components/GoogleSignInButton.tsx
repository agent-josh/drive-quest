import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface GoogleSignInButtonProps {
  onPress: () => Promise<{ error: string | null }>;
  label?: string;
}

export function GoogleSignInButton({
  onPress,
  label = 'Google로 시작하기',
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePress = async () => {
    setError('');
    setLoading(true);
    const { error: err } = await onPress();
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <>
            <Text style={styles.icon}>G</Text>
            <Text style={styles.label}>{label}</Text>
          </>
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  buttonDisabled: { opacity: 0.7 },
  icon: {
    width: 28,
    height: 28,
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 16,
    color: '#4285F4',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
  },
  label: { ...typography.bodyBold, color: colors.text },
  error: { ...typography.caption, color: colors.error, textAlign: 'center' },
});
