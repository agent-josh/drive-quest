import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { playStageCompleteFeedback } from '@/lib/feedbackSounds';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface StageCompleteCelebrationProps {
  questionCount: number;
  onStartQuiz: () => void;
  onBack: () => void;
}

export function StageCompleteCelebration({
  questionCount,
  onStartQuiz,
  onBack,
}: StageCompleteCelebrationProps) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    void playStageCompleteFeedback();
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -8, duration: 400, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      { iterations: 3 },
    ).start();
  }, [scale, opacity, bounce]);

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.card,
          { opacity, transform: [{ scale }, { translateY: bounce }] },
        ]}
      >
        <Text style={styles.burst}>✨</Text>
        <Text style={styles.ding}>따란!</Text>
        <Text style={styles.car}>🚗💨</Text>
        <Text style={styles.title}>카드 완료!</Text>
        <Text style={styles.desc}>
          {questionCount}장을 모두 넘겼어요.{'\n'}확인 퀴즈에서 12문항 이상(60%) 맞히면 다음 코스가 열려요.
        </Text>
        <Button title="퀴즈 시작!" onPress={onStartQuiz} fullWidth />
        <Button title="코스로 돌아가기" variant="ghost" onPress={onBack} fullWidth />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: '#58CC02',
  },
  burst: { fontSize: 40 },
  ding: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FF9600',
    letterSpacing: 2,
  },
  car: { fontSize: 48 },
  title: { ...typography.h2, color: colors.text },
  desc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
