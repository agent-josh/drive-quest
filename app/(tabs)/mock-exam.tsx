import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QuizRunner, type QuizResult } from '@/components/quiz/QuizRunner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  MOCK_EXAM_DEFAULT_SIZE,
  MOCK_EXAM_PASS_SCORE,
  MOCK_EXAM_TIME_SECONDS,
} from '@/constants/config';
import { useDemo } from '@/context/DemoContext';
import { useQuestions } from '@/context/QuestionsContext';
import { pickSessionQuestions } from '@/lib/koroadApi';
import type { AppQuestion } from '@/types/koroad';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type Phase = 'idle' | 'active' | 'finished';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MockExamTab() {
  const { questions } = useQuestions();
  const { mockExamHistory, recordMockExam, recordWrongAnswers } = useDemo();

  const [phase, setPhase] = useState<Phase>('idle');
  const [examQuestions, setExamQuestions] = useState<AppQuestion[]>([]);
  const [timeLeft, setTimeLeft] = useState(MOCK_EXAM_TIME_SECONDS);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const startedAt = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const submitExam = useCallback(
    (result: QuizResult) => {
      clearTimer();
      const total = examQuestions.length;
      const score = Math.round((result.correctCount / total) * 100);
      const durationSeconds = Math.round((Date.now() - startedAt.current) / 1000);
      setFinalScore(score);
      recordMockExam({
        score,
        correctCount: result.correctCount,
        totalCount: total,
        passed: score >= MOCK_EXAM_PASS_SCORE,
        completedAt: new Date().toISOString(),
        durationSeconds,
      });
      recordWrongAnswers(examQuestions, result.answers);
      setPhase('finished');
    },
    [examQuestions, clearTimer, recordMockExam, recordWrongAnswers],
  );

  const startExam = useCallback(() => {
    if (questions.length === 0) return;
    const picked = pickSessionQuestions(questions, MOCK_EXAM_DEFAULT_SIZE);
    setExamQuestions(picked);
    setTimeLeft(MOCK_EXAM_TIME_SECONDS);
    setFinalScore(null);
    startedAt.current = Date.now();
    setPhase('active');
  }, [questions]);

  useEffect(() => {
    if (phase !== 'active') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
  }, [phase, clearTimer]);

  const timeUpSubmit = useRef(false);
  useEffect(() => {
    if (phase === 'active' && timeLeft === 0 && !timeUpSubmit.current) {
      timeUpSubmit.current = true;
      submitExam({ correctCount: 0, answers: new Map() });
    }
    if (phase !== 'active') timeUpSubmit.current = false;
  }, [phase, timeLeft, submitExam]);

  const lastRecord = mockExamHistory[0];

  const historyPreview = useMemo(
    () => mockExamHistory.slice(0, 5),
    [mockExamHistory],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {phase === 'idle' && (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ScreenHeader
            title="모의고사"
            subtitle={`${MOCK_EXAM_DEFAULT_SIZE}문항 · ${MOCK_EXAM_TIME_SECONDS / 60}분 · 합격 ${MOCK_EXAM_PASS_SCORE}점`}
          />

          <Card variant="highlight" style={styles.infoCard}>
            <Text style={styles.infoEmoji}>⏱️</Text>
            <Text style={styles.infoTitle}>실전과 동일한 조건</Text>
            <Text style={styles.infoDesc}>
              제한 시간 내 4지선다로 풀고, 점수는 기록에 저장됩니다.
            </Text>
            <Badge label={`합격 기준 ${MOCK_EXAM_PASS_SCORE}점`} variant="primary" />
          </Card>

          <Button title="모의고사 시작" onPress={startExam} fullWidth disabled={questions.length === 0} />

          {historyPreview.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>최근 기록</Text>
              {historyPreview.map((h) => (
                <Card key={h.id} style={styles.historyItem}>
                  <View style={styles.historyRow}>
                    <Text style={[styles.historyScore, h.passed && styles.passed]}>
                      {h.score}점
                    </Text>
                    <Text style={styles.historyMeta}>
                      {h.correctCount}/{h.totalCount} · {formatTime(h.durationSeconds)}
                    </Text>
                  </View>
                  <Text style={styles.historyDate}>
                    {new Date(h.completedAt).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {h.passed ? ' · 합격' : ' · 불합격'}
                  </Text>
                </Card>
              ))}
            </>
          )}
        </ScrollView>
      )}

      {phase === 'active' && (
        <View style={styles.activeWrap}>
          <View style={styles.timerBar}>
            <Text style={[styles.timer, timeLeft < 300 && styles.timerWarn]}>
              {formatTime(timeLeft)}
            </Text>
            <Button title="포기" variant="ghost" onPress={() => setPhase('idle')} />
          </View>
          <View style={styles.quizSlot}>
            <QuizRunner
              questions={examQuestions}
              onComplete={submitExam}
              showFeedback={false}
            />
          </View>
        </View>
      )}

      {phase === 'finished' && finalScore !== null && (
        <View style={styles.inner}>
          <Card variant="highlight" style={styles.resultCard}>
            <Text style={styles.resultEmoji}>{finalScore >= MOCK_EXAM_PASS_SCORE ? '🎉' : '📋'}</Text>
            <Text style={styles.resultTitle}>
              {finalScore >= MOCK_EXAM_PASS_SCORE ? '합격!' : '불합격'}
            </Text>
            <Text style={styles.resultScore}>{finalScore}점</Text>
            {lastRecord && (
              <Text style={styles.resultDetail}>
                {lastRecord.correctCount} / {lastRecord.totalCount} 정답
              </Text>
            )}
            <Button title="다시 응시" onPress={startExam} fullWidth />
            <Button title="기록 보기" variant="outline" onPress={() => setPhase('idle')} fullWidth />
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  inner: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  activeWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    minHeight: 0,
  },
  quizSlot: { flex: 1, minHeight: 0 },
  timerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timer: { ...typography.h2, color: colors.text, fontVariant: ['tabular-nums'] },
  timerWarn: { color: colors.error },
  infoCard: { alignItems: 'center', gap: spacing.sm },
  infoEmoji: { fontSize: 40 },
  infoTitle: { ...typography.h2, color: colors.text },
  infoDesc: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.sm },
  historyItem: { gap: spacing.xs },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyScore: { ...typography.h3, color: colors.text },
  passed: { color: colors.success },
  historyMeta: { ...typography.caption, color: colors.textSecondary },
  historyDate: { ...typography.small, color: colors.textMuted },
  resultCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  resultEmoji: { fontSize: 48 },
  resultTitle: { ...typography.h2, color: colors.text },
  resultScore: { ...typography.h1, color: colors.primary },
  resultDetail: { ...typography.body, color: colors.textSecondary },
});
