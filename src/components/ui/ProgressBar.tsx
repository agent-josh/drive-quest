import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color = colors.primary, height = 8 }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: { borderRadius: radius.full },
});
