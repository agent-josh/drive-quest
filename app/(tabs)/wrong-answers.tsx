import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QuizRunner, type QuizResult } from '@/components/quiz/QuizRunner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useDemo } from '@/context/DemoContext';
import type { WrongAnswerEntry } from '@/types/progress';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type Mode = 'list' | 'review' | 'done';

export default function WrongAnswersTab() {
  const { wrongAnswers, recordWrongAnswers, removeWrongAnswer } = useDemo();
  const [mode, setMode] = useState<Mode>('list');
  const [reviewItems, setReviewItems] = useState<WrongAnswerEntry[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);

  const startReview = useCallback((items: WrongAnswerEntry[]) => {
    setReviewItems(items);
    setResult(null);
    setMode('review');
  }, []);

  const onComplete = useCallback(
    (quizResult: QuizResult) => {
      const questions = reviewItems.map((w) => w.question);
      recordWrongAnswers(questions, quizResult.answers);
      for (const q of questions) {
        const selected = quizResult.answers.get(q.id);
        if (selected === q.correctAnswer) {
          removeWrongAnswer(q.id);
        }
      }
      setResult(quizResult);
      setMode('done');
    },
    [reviewItems, recordWrongAnswers, removeWrongAnswer],
  );

  if (mode === 'review') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.reviewWrap}>
          <Pressable onPress={() => setMode('list')}>
            <Text style={styles.back}>← 목록</Text>
          </Pressable>
          <ScreenHeader title="오답 다시 풀기" subtitle={`${reviewItems.length}문제`} />
          <View style={styles.quizSlot}>
            <QuizRunner
              questions={reviewItems.map((w) => w.question)}
              onComplete={onComplete}
              reviewMode
              showFeedback={false}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (mode === 'done' && result) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.inner}>
          <Card variant="highlight" style={styles.doneCard}>
            <Text style={styles.doneTitle}>복습 완료</Text>
            <Text style={styles.doneScore}>
              {result.correctCount} / {reviewItems.length} 정답
            </Text>
            <Text style={styles.doneHint}>
              {result.correctCount === reviewItems.length
                ? '모두 맞혔어요! 오답노트에서 제거되었습니다.'
                : `맞힌 ${result.correctCount}문항은 오답노트에서 제거되었어요.`}
            </Text>
            <Button title="오답노트로" onPress={() => setMode('list')} fullWidth />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.inner}>
        <ScreenHeader title="오답노트" subtitle="틀린 문제만 모아 복습합니다" />

        {wrongAnswers.length > 0 && (
          <Button
            title={`전체 복습 (${wrongAnswers.length}문제)`}
            onPress={() => startReview(wrongAnswers)}
            fullWidth
          />
        )}

        <FlatList
          data={wrongAnswers}
          keyExtractor={(item) => item.questionId}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Card style={styles.empty}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyTitle}>오답이 없어요</Text>
              <Text style={styles.emptyDesc}>오늘의 학습 퀴즈에서 틀린 문제가 여기에 쌓입니다.</Text>
            </Card>
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => startReview([item])}>
              <Card style={styles.item}>
                <View style={styles.itemHeader}>
                  <Badge label={item.question.category} variant="muted" />
                  <Text style={styles.attemptCount}>×{item.wrongCount}</Text>
                </View>
                <Text style={styles.preview} numberOfLines={2}>
                  {item.question.content}
                </Text>
                <Text style={styles.reviewHint}>다시 풀기 →</Text>
              </Card>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, padding: spacing.lg, gap: spacing.md },
  reviewWrap: { flex: 1, padding: spacing.lg, gap: spacing.sm, minHeight: 0 },
  quizSlot: { flex: 1, minHeight: 0 },
  back: { ...typography.bodyBold, color: colors.primary },
  list: { gap: spacing.sm, paddingBottom: spacing.xxl },
  item: { gap: spacing.sm },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attemptCount: { ...typography.caption, color: colors.error, fontWeight: '700' },
  preview: { ...typography.body, color: colors.text },
  reviewHint: { ...typography.small, color: colors.primary },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl, marginTop: spacing.xl },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...typography.h3, color: colors.text },
  emptyDesc: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  doneCard: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  doneTitle: { ...typography.h2, color: colors.text },
  doneScore: { ...typography.h1, color: colors.primary },
  doneHint: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});
