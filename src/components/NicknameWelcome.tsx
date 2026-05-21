import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DEMO_MODE } from '@/constants/config';
import { useDemo } from '@/context/DemoContext';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const WELCOME_KEY = 'drive-quest-welcome-done';

export function NicknameWelcome() {
  const { profile, setNickname } = useDemo();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState(profile.nickname);

  useEffect(() => {
    if (!DEMO_MODE) return;
    void AsyncStorage.getItem(WELCOME_KEY).then((done) => {
      if (!done) {
        setName(profile.nickname === '학습자' ? '' : profile.nickname);
        setVisible(true);
      }
    });
  }, [profile.nickname]);

  const finish = async () => {
    const trimmed = name.trim() || '학습자';
    setNickname(trimmed);
    await AsyncStorage.setItem(WELCOME_KEY, '1');
    setVisible(false);
  };

  if (!DEMO_MODE || !visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => void finish()}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🛣️</Text>
          <Text style={styles.title}>Drive Quest</Text>
          <Text style={styles.desc}>
            개인 플래시카드·퀴즈 모드입니다.{'\n'}
            닉네임과 학습 기록은 <Text style={styles.bold}>이 기기(브라우저)</Text>에만 저장됩니다.
          </Text>
          <Input
            label="닉네임 (선택)"
            placeholder="예: 수아"
            value={name}
            onChangeText={setName}
            maxLength={20}
            autoFocus
          />
          <Button title="시작하기" onPress={() => void finish()} fullWidth />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  emoji: { fontSize: 40, textAlign: 'center' },
  title: { ...typography.h1, color: colors.text, textAlign: 'center' },
  desc: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  bold: { fontWeight: '700', color: colors.text },
});
