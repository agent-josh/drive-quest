import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type OptionState = 'default' | 'selected' | 'correct' | 'wrong';

interface OptionButtonProps {
  number: number;
  text: string;
  state: OptionState;
  disabled?: boolean;
  compact?: boolean;
  onPress: () => void;
}

export function OptionButton({
  number,
  text,
  state,
  disabled,
  compact,
  onPress,
}: OptionButtonProps) {
  return (
    <Pressable
      style={[
        styles.option,
        compact && styles.optionCompact,
        state === 'selected' && styles.selected,
        state === 'correct' && styles.correct,
        state === 'wrong' && styles.wrong,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.num,
          state === 'correct' && styles.numCorrect,
          state === 'wrong' && styles.numWrong,
        ]}
      >
        <Text style={styles.numText}>{number}</Text>
      </View>
      <Text style={styles.text} selectable>
        {text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionCompact: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  selected: { borderColor: colors.primary, backgroundColor: '#EEF2FF' },
  correct: { borderColor: colors.success, backgroundColor: '#ECFDF5' },
  wrong: { borderColor: colors.error, backgroundColor: '#FEF2F2' },
  num: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numCorrect: { backgroundColor: '#D1FAE5' },
  numWrong: { backgroundColor: '#FEE2E2' },
  numText: { ...typography.bodyBold, color: colors.primary },
  text: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    flexShrink: 1,
    lineHeight: 20,
    fontSize: 14,
    paddingTop: 2,
  },
});
