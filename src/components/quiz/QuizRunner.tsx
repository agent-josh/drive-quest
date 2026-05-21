import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { OptionButton } from '@/components/quiz/OptionButton';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { stripOptionPrefix } from '@/lib/questionText';
import type { AppQuestion } from '@/types/koroad';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export interface QuizResult {
  correctCount: number;
  answers: Map<string, number>;
}

interface QuizRunnerProps {
  questions: AppQuestion[];
  onComplete: (result: QuizResult) => void;
  /** 문항마다 정답/오답 즉시 표시 (학습 확인 퀴즈) */
  showFeedback?: boolean;
  /** 오답노트: 선택만 하고 마지막에 일괄 채점 */
  reviewMode?: boolean;
}

function countCorrect(questions: AppQuestion[], answers: Map<string, number>): number {
  let count = 0;
  for (const q of questions) {
    const selected = answers.get(q.id);
    if (selected !== undefined && Number(selected) === Number(q.correctAnswer)) {
      count += 1;
    }
  }
  return count;
}

export function QuizRunner({
  questions,
  onComplete,
  showFeedback = true,
  reviewMode = false,
}: QuizRunnerProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers] = useState(() => new Map<string, number>());

  const current = questions[index];
  const isLast = index + 1 >= questions.length;

  const answeredCount = questions.filter((q) => answers.has(q.id)).length;
  const progress = reviewMode
    ? answeredCount / questions.length
    : (index + (answered ? 1 : 0)) / questions.length;

  const finish = useCallback(() => {
    const count = reviewMode ? countCorrect(questions, answers) : correctCount;
    onComplete({ correctCount: count, answers: new Map(answers) });
  }, [correctCount, answers, onComplete, reviewMode, questions]);

  const goNext = useCallback(() => {
    if (reviewMode && selected === null) return;

    if (isLast) {
      finish();
      return;
    }
    const nextIndex = index + 1;
    const nextQ = questions[nextIndex];
    setIndex(nextIndex);
    setSelected(answers.get(nextQ.id) ?? null);
    setAnswered(false);
  }, [index, isLast, finish, reviewMode, selected, questions, answers]);

  const handleSelect = (optionNum: number) => {
    if (!current) return;
    if (!reviewMode && answered) return;

    setSelected(optionNum);
    answers.set(current.id, optionNum);

    if (reviewMode) return;

    setAnswered(true);
    if (optionNum === current.correctAnswer) {
      setCorrectCount((c) => c + 1);
    }
  };

  if (!current) return null;

  const isCorrect = selected === current.correctAnswer;
  const showFooter = reviewMode ? selected !== null : answered;
  const nextLabel = isLast
    ? reviewMode
      ? '결과 보기'
      : showFeedback
        ? '결과 보기'
        : '제출'
    : '다음';

  return (
    <View style={styles.root}>
      <View style={styles.progressRow}>
        <View style={styles.progressBarWrap}>
          <ProgressBar progress={Math.min(1, progress)} height={6} />
        </View>
        <Text style={styles.progressText}>
          {reviewMode ? `${answeredCount}/${questions.length}` : `${Math.min(index + (answered ? 1 : 0), questions.length)}/${questions.length}`}
        </Text>
      </View>

      <ScrollView
        style={styles.questionScroll}
        contentContainerStyle={styles.questionScrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Text style={styles.category}>{current.category}</Text>
        <Text style={styles.questionText}>{current.content}</Text>
        {reviewMode && (
          <Text style={styles.reviewHint}>보기를 고른 뒤 다음으로 넘기세요</Text>
        )}
      </ScrollView>

      <View style={styles.options}>
        {current.options.map((opt, i) => {
          const num = (i + 1) as 1 | 2 | 3 | 4;
          let state: 'default' | 'selected' | 'correct' | 'wrong' = 'default';
          if (!reviewMode && answered && showFeedback) {
            if (num === current.correctAnswer) state = 'correct';
            else if (num === selected) state = 'wrong';
          } else if (num === selected) {
            state = 'selected';
          }
          return (
            <OptionButton
              key={num}
              number={num}
              text={stripOptionPrefix(opt)}
              state={state}
              disabled={!reviewMode && answered}
              compact
              onPress={() => handleSelect(num)}
            />
          );
        })}
      </View>

      {showFooter && (
        <View style={styles.footer}>
          {!reviewMode && showFeedback && (
            <View
              style={[
                styles.feedbackBanner,
                isCorrect ? styles.feedbackOk : styles.feedbackNg,
              ]}
            >
              <Text
                style={[
                  styles.feedbackTitle,
                  isCorrect ? styles.feedbackOkText : styles.feedbackNgText,
                ]}
              >
                {isCorrect ? '정답이에요' : '오답이에요'}
              </Text>
              {!isCorrect && (
                <Text style={styles.feedbackAnswer} numberOfLines={2}>
                  정답 {current.correctAnswer}번 ·{' '}
                  {stripOptionPrefix(current.options[current.correctAnswer - 1] ?? '')}
                </Text>
              )}
            </View>
          )}
          <Button title={nextLabel} onPress={goNext} fullWidth />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
    gap: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  },
  progressBarWrap: { flex: 1 },
  progressText: {
    ...typography.small,
    color: colors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  questionScroll: {
    flex: 1,
    minHeight: 0,
    flexShrink: 1,
  },
  questionScrollContent: {
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  category: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  questionText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  reviewHint: {
    ...typography.small,
    color: colors.textMuted,
  },
  options: {
    gap: spacing.xs,
    flexShrink: 0,
  },
  footer: {
    gap: spacing.sm,
    flexShrink: 0,
    paddingTop: spacing.xs,
  },
  feedbackBanner: {
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  feedbackOk: { backgroundColor: colors.successBg },
  feedbackNg: { backgroundColor: colors.errorBg },
  feedbackTitle: { ...typography.bodyBold },
  feedbackOkText: { color: colors.success },
  feedbackNgText: { color: colors.error },
  feedbackAnswer: { ...typography.small, color: colors.textSecondary },
});
