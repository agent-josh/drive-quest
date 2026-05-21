import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  LEARNING_CHAPTERS,
  getStageSlice,
  isStageUnlocked,
} from '@/constants/learningCourse';
import type { StageResumeState } from '@/types/progress';
import type { AppQuestion } from '@/types/koroad';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const STAGES_PER_ROW = 5;

interface LearningCourseMapProps {
  curriculum: AppQuestion[];
  completedStageIds: number[];
  stageResume: Record<string, StageResumeState>;
  onSelectStage: (stageId: number) => void;
}

function chunkStages<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

function getStageStatusLabel(
  stageId: number,
  slice: AppQuestion[],
  completedStageIds: number[],
  stageResume: Record<string, StageResumeState>,
  unlocked: boolean,
): string {
  if (!unlocked) return '잠금';
  if (completedStageIds.includes(stageId)) return '완료';
  const resume = stageResume[String(stageId)];
  if (resume && slice[resume.cardIndex]) {
    return `${slice[resume.cardIndex].questionNumber}번까지`;
  }
  return '';
}

export function LearningCourseMap({
  curriculum,
  completedStageIds,
  stageResume,
  onSelectStage,
}: LearningCourseMapProps) {
  const [openChapterId, setOpenChapterId] = useState(1);

  const chapterRows = useMemo(
    () =>
      LEARNING_CHAPTERS.map((chapter) => {
        const stagesInChapter = Array.from(
          { length: chapter.stageEnd - chapter.stageStart + 1 },
          (_, i) => chapter.stageStart + i,
        ).filter((id) => getStageSlice(curriculum, id).length > 0);
        return { chapter, stagesInChapter, rows: chunkStages(stagesInChapter, STAGES_PER_ROW) };
      }).filter((c) => c.stagesInChapter.length > 0),
    [curriculum],
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.mapLabel}>코스 선택</Text>

      {chapterRows.map(({ chapter, rows }) => {
        const open = openChapterId === chapter.id;

        return (
          <View key={chapter.id} style={styles.chapterBlock}>
            <Pressable
              style={[styles.chapterHeader, open && styles.chapterHeaderOpen]}
              onPress={() => setOpenChapterId(open ? -1 : chapter.id)}
            >
              <View style={[styles.chapterAccent, { backgroundColor: chapter.themeColor }]} />
              <View style={styles.chapterInfo}>
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
                <Text style={styles.chapterSub}>{chapter.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>{open ? '−' : '+'}</Text>
            </Pressable>

            {open && (
              <View style={styles.stageArea}>
                {rows.map((row, rowIndex) => (
                  <View key={`${chapter.id}-row-${rowIndex}`} style={styles.stageRow}>
                    {row.map((stageId) => {
                      const slice = getStageSlice(curriculum, stageId);
                      const start = slice[0]?.questionNumber ?? (stageId - 1) * 20 + 1;
                      const end = slice[slice.length - 1]?.questionNumber ?? stageId * 20;
                      const done = completedStageIds.includes(stageId);
                      const unlocked = isStageUnlocked(stageId, completedStageIds);
                      const status = getStageStatusLabel(
                        stageId,
                        slice,
                        completedStageIds,
                        stageResume,
                        unlocked,
                      );

                      return (
                        <Pressable
                          key={stageId}
                          style={[
                            styles.stageTile,
                            !unlocked && styles.stageLocked,
                            done && styles.stageDone,
                          ]}
                          onPress={() => unlocked && onSelectStage(stageId)}
                          disabled={!unlocked}
                        >
                          <Text style={[styles.tileNum, !unlocked && styles.tileTextMuted]}>
                            {stageId}
                          </Text>
                          <Text style={[styles.tileRange, !unlocked && styles.tileTextMuted]}>
                            {start}~{end}
                          </Text>
                          {status ? (
                            <Text
                              style={[
                                styles.tileStatus,
                                done && styles.tileStatusDone,
                                !unlocked && styles.tileTextMuted,
                                status.includes('번까지') && styles.tileStatusResume,
                              ]}
                              numberOfLines={1}
                            >
                              {status}
                            </Text>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxl, gap: spacing.md },
  mapLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chapterBlock: { gap: spacing.sm },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  chapterHeaderOpen: {
    borderColor: colors.primaryLight,
  },
  chapterAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: radius.full,
  },
  chapterInfo: { flex: 1, gap: 2 },
  chapterTitle: { ...typography.bodyBold, color: colors.text },
  chapterSub: { ...typography.small, color: colors.textSecondary },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
    color: colors.textMuted,
    width: 24,
    textAlign: 'center',
  },
  stageArea: { gap: spacing.sm },
  stageRow: { flexDirection: 'row', gap: spacing.sm },
  stageTile: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 2,
  },
  stageLocked: {
    backgroundColor: colors.surfaceMuted,
    opacity: 0.7,
  },
  stageDone: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
  },
  tileNum: { ...typography.bodyBold, color: colors.text, fontSize: 15 },
  tileRange: { ...typography.small, color: colors.textSecondary, fontSize: 10 },
  tileStatus: { ...typography.small, color: colors.textMuted, fontSize: 9, marginTop: 2 },
  tileStatusResume: { color: colors.primary, fontWeight: '700' },
  tileStatusDone: { color: colors.success, fontWeight: '700' },
  tileTextMuted: { color: colors.textMuted },
});
