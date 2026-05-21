import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_NAME } from '@/constants/config';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface SplashScreenProps {
  subtitle?: string;
}

export function SplashScreen({ subtitle = '운전면허 필기, 게임처럼!' }: SplashScreenProps) {
  const bounce = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bounce, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 280, useNativeDriver: true }),
        ]),
      );

    const a1 = pulse(dot1, 0);
    const a2 = pulse(dot2, 160);
    const a3 = pulse(dot3, 320);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [bounce, fade, dot1, dot2, dot3]);

  const mascotScale = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <View style={styles.root}>
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View style={[styles.center, { opacity: fade }]}>
          <Animated.View style={[styles.mascotWrap, { transform: [{ scale: mascotScale }] }]}>
            <View style={styles.mascotCircle}>
              <Text style={styles.mascot}>🚗</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>필기</Text>
            </View>
          </Animated.View>

          <Text style={styles.title}>{APP_NAME}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.card}>
            <Text style={styles.cardEmoji}>📇</Text>
            <Text style={styles.cardText}>플래시카드 · 퀴즈 · 모의고사</Text>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            <Animated.View style={[styles.dot, { opacity: dot1 }]} />
            <Animated.View style={[styles.dot, { opacity: dot2 }]} />
            <Animated.View style={[styles.dot, { opacity: dot3 }]} />
          </View>
          <Text style={styles.loadingLabel}>불러오는 중…</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#58CC02',
  },
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: '#58CC02',
  },
  bgBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: '#89E219',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  safe: { flex: 1, justifyContent: 'space-between' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  mascotWrap: { alignItems: 'center', marginBottom: spacing.sm },
  mascotCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#46A302',
    shadowColor: '#2d6a0a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  mascot: { fontSize: 56 },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: '#fff',
  },
  badgeText: { ...typography.small, color: '#fff', fontWeight: '800' },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(45, 106, 10, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    marginTop: spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  cardEmoji: { fontSize: 22 },
  cardText: { ...typography.bodyBold, color: '#fff' },
  footer: { alignItems: 'center', gap: spacing.sm, paddingBottom: spacing.xl },
  dots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  loadingLabel: { ...typography.caption, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
});
