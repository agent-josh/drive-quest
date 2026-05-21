import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ScreenHeader';
import { DATA_GO_KR_SERVICE_KEY } from '@/constants/config';
import { useQuestions } from '@/context/QuestionsContext';
import type { AppQuestion } from '@/types/koroad';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function QuestionsBrowseScreen() {
  const router = useRouter();
  const { questions, source, totalCount, isLoading, statusMessage, reload } = useQuestions();

  const renderItem = ({ item }: { item: AppQuestion }) => (
    <Card style={styles.item}>
      <View style={styles.itemHeader}>
        <Badge label={`#${item.questionNumber}`} variant="muted" />
        <Badge label={item.category} variant="primary" />
      </View>
      <Text style={styles.content} numberOfLines={3}>
        {item.content}
      </Text>
      <Text style={styles.meta}>
        보기 {item.options.length}개 · 정답 {item.correctAnswer}번
      </Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </Pressable>
      </View>

      <ScreenHeader
        title="문제 은행"
        subtitle="한국도로교통공단 공공데이터 (15100163)"
      />

      <Card style={styles.statusCard}>
        <Text style={styles.statusTitle}>
          데이터 출처:{' '}
          {source === 'api' ? '🟢 공단 API 연결됨' : source === 'fallback' ? '🟡 샘플 데이터' : '…'}
        </Text>
        <Text style={styles.statusDesc}>
          {isLoading
            ? '불러오는 중…'
            : `표시 ${questions.length}문항 · 전체 약 ${totalCount}문항`}
        </Text>
        {!DATA_GO_KR_SERVICE_KEY && (
          <Text style={styles.hint}>
            실제 1,000문항 API를 쓰려면 .env에 EXPO_PUBLIC_DATA_GO_KR_SERVICE_KEY를 추가하세요.
            (공공데이터포털 무료 발급)
          </Text>
        )}
        {statusMessage ? <Text style={styles.warn}>{statusMessage}</Text> : null}
      </Card>

      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={reload} />}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
          ) : (
            <Text style={styles.empty}>문제가 없습니다.</Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg },
  back: { ...typography.bodyBold, color: colors.primary },
  statusCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.xs },
  statusTitle: { ...typography.bodyBold, color: colors.text },
  statusDesc: { ...typography.caption, color: colors.textSecondary },
  hint: { ...typography.small, color: colors.primary, lineHeight: 18, marginTop: spacing.xs },
  warn: { ...typography.small, color: colors.warning, lineHeight: 18 },
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  item: { gap: spacing.sm },
  itemHeader: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  content: { ...typography.body, color: colors.text, lineHeight: 22 },
  meta: { ...typography.small, color: colors.textMuted },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
