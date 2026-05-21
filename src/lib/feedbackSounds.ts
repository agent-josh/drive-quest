import * as Haptics from 'expo-haptics';

/** 네트워크·expo-av 없이 햅틱만 사용 (번들 오류 방지) */
export async function playCardSwipeFeedback() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    /* ignore */
  }
}

export async function playStageCompleteFeedback() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    /* ignore */
  }
}
