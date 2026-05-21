import { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  showFeedback?: boolean;
  reviewMode?: boolean;
}

const FOOTER_HEIGHT = 76;
const QUESTION_MAX_H = Math.min(200, Dimensions.get('window').height * 0.3);

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
    if (!reviewMode && !answered) return;

    if (isLast) {
      finish();
      return;
    }
    const nextIndex = index + 1;
    const nextQ = questions[nextIndex];
    setIndex(nextIndex);
    setSelected(answers.get(nextQ.id) ?? null);
    setAnswered(false);
  }, [index, isLast, finish, reviewMode, selected, answered, questions, answers]);

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
  const canProceed = reviewMode ? selected !== null : answered;
  const nextLabel = isLast
    ? reviewMode
      ? '결과 보기'
      : '결과 보기'
    : '다음';

  const feedbackLine =
    !reviewMode && answered && showFeedback
      ? isCorrect
        ? '정답이에요'
        : `오답 · 정답 ${current.correctAnswer}번`
      : null;

  return (
    <View style={styles.root}>
      <View style={styles.progressRow}>
        <View style={styles.progressBarWrap}>
          <ProgressBar progress={Math.min(1, progress)} height={6} />
        </View>
        <Text style={styles.progressText}>
          {reviewMode
            ? `${answeredCount}/${questions.length}`
            : `${Math.min(index + (answered ? 1 : 0), questions.length)}/${questions.length}`}
        </Text>
      </View>

      <View style={styles.body}>
        <ScrollView
          style={styles.questionScroll}
          contentContainerStyle={styles.questionScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          nestedScrollEnabled
        >
          <Text style={styles.category}>{current.category}</Text>
          <Text style={styles.questionText}>{current.content}</Text>
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
      </View>

      <View style={styles.footer}>
        <Text
          style={[
            styles.feedbackLine,
            !feedbackLine && styles.feedbackLineHidden,
            feedbackLine && (isCorrect ? styles.feedbackOk : styles.feedbackNg),
          ]}
        >
          {feedbackLine ?? ' '}
        </Text>
        <Button
          title={canProceed ? nextLabel : reviewMode ? '보기를 선택하세요' : '보기를 선택하세요'}
          onPress={goNext}
          disabled={!canProceed}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
    marginBottom: spacing.sm,
  },
  progressBarWrap: { flex: 1 },
  progressText: {
    ...typography.small,
    color: colors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  body: {
    flex: 1,
    minHeight: 0,
    gap: spacing.sm,
  },
  questionScroll: {
    flexGrow: 0,
    flexShrink: 1,
    maxHeight: QUESTION_MAX_H,
  },
  questionScrollContent: {
    paddingVertical: spacing.xs,
    gap: spacing.xs,
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
    fontSize: 15,
  },
  options: {
    flex: 1,
    minHeight: 0,
    gap: spacing.xs,
    justifyContent: 'flex-start',
  },
  footer: {
    height: FOOTER_HEIGHT,
    justifyContent: 'flex-end',
    gap: spacing.xs,
    flexShrink: 0,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  feedbackLine: {
    ...typography.small,
    fontWeight: '700',
    textAlign: 'center',
    height: 18,
  },
  feedbackLineHidden: {
    opacity: 0,
  },
  feedbackOk: { color: colors.success },
  feedbackNg: { color: colors.error },
});
