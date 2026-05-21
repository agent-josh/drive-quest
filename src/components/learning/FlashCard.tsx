import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { playCardSwipeFeedback } from '@/lib/feedbackSounds';
import { stripOptionPrefix } from '@/lib/questionText';
import type { AppQuestion } from '@/types/koroad';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const SWIPE_THRESHOLD = 72;
const ANIM_MS = 100;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const EXIT_X = SCREEN_W * 0.55;
const CARD_MAX_H = Math.min(SCREEN_H * 0.58, 460);

interface FlashCardProps {
  question: AppQuestion;
  index: number;
  total: number;
  canGoBack: boolean;
  showSwipeCoach: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export function FlashCard({
  question,
  index,
  total,
  canGoBack,
  showSwipeCoach,
  onNext,
  onPrevious,
}: FlashCardProps) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const coachOpacity = useRef(new Animated.Value(showSwipeCoach ? 1 : 0)).current;
  const [coachVisible, setCoachVisible] = useState(showSwipeCoach);

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_W, 0, SCREEN_W],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (!showSwipeCoach) {
      setCoachVisible(false);
      return;
    }
    setCoachVisible(true);
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(coachOpacity, { toValue: 0.55, duration: 600, useNativeDriver: true }),
        Animated.timing(coachOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [showSwipeCoach, coachOpacity]);

  const resetCard = () => pan.setValue({ x: 0, y: 0 });

  const animateOut = (toX: number, onDone: () => void) => {
    void playCardSwipeFeedback();
    Animated.timing(pan, {
      toValue: { x: toX, y: 0 },
      duration: ANIM_MS,
      useNativeDriver: true,
    }).start(() => {
      resetCard();
      onDone();
    });
  };

  const goNext = () => {
    setCoachVisible(false);
    animateOut(-EXIT_X, onNext);
  };

  const goPrevious = () => {
    setCoachVisible(false);
    animateOut(EXIT_X, onPrevious);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,
      onPanResponderMove: (_, g) => {
        const clamped = !canGoBack && g.dx > 0 ? g.dx * 0.25 : g.dx;
        pan.setValue({ x: clamped, y: 0 });
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD) {
          goNext();
          return;
        }
        if (g.dx > SWIPE_THRESHOLD && canGoBack) {
          goPrevious();
          return;
        }
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          speed: 28,
          bounciness: 6,
        }).start();
      },
    }),
  ).current;

  return (
    <View style={styles.wrap}>
      <Text style={styles.counter}>
        {index + 1} / {total}
      </Text>

      {coachVisible && (
        <Animated.View style={[styles.coachBanner, { opacity: coachOpacity }]}>
          <Text style={styles.coachText}>👆 카드를 손가락으로 ← 밀면 다음 · → 밀면 이전</Text>
        </Animated.View>
      )}

      <Animated.View
        style={[styles.card, { maxHeight: CARD_MAX_H, transform: [{ translateX: pan.x }, { rotate }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.cardBody}>
          <Text style={styles.label}>문제</Text>
          <Text style={styles.content} numberOfLines={4}>
            {question.content}
          </Text>
          <View style={styles.options}>
            {question.options.map((opt, i) => {
              const num = i + 1;
              const isCorrect = num === question.correctAnswer;
              const label = stripOptionPrefix(opt);
              return (
                <View
                  key={num}
                  style={[styles.option, isCorrect && styles.optionCorrect]}
                >
                  <View style={[styles.optionNum, isCorrect && styles.optionNumCorrect]}>
                    <Text style={[styles.optionNumText, isCorrect && styles.optionNumTextCorrect]}>
                      {num}
                    </Text>
                  </View>
                  <Text
                    style={[styles.optionText, isCorrect && styles.optionTextCorrect]}
                    numberOfLines={2}
                  >
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.swipeHint}>
          <Text style={styles.swipeArrow}>←</Text>
          <Text style={styles.swipeLabel}>밀어서 넘기기</Text>
          <Text style={styles.swipeArrow}>→</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: spacing.xs, minHeight: 0 },
  counter: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 13,
  },
  coachBanner: {
    backgroundColor: '#EEF2FF',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  coachText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 19,
  },
  card: {
    flexGrow: 1,
    flexShrink: 1,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    elevation: 4,
  },
  cardBody: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
    justifyContent: 'flex-start',
  },
  label: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  content: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.text,
    fontWeight: '600',
  },
  options: { gap: 7 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 9,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  optionNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionNumCorrect: { backgroundColor: colors.success },
  optionNumText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  optionNumTextCorrect: { color: '#fff' },
  optionText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 19,
    color: colors.text,
  },
  optionTextCorrect: { color: '#166534', fontWeight: '600' },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  swipeArrow: { fontSize: 20, color: colors.primary, fontWeight: '800' },
  swipeLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '700' },
});
