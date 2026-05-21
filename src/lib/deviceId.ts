import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_KEY = 'drive-quest-device-id';

/** 로그인 없이 이 기기(브라우저)를 구분하는 ID — 진행 데이터와 별도 */
export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_KEY);
  if (existing) return existing;

  const id = `dq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(DEVICE_KEY, id);
  return id;
}

export function formatDeviceIdShort(id: string): string {
  return id.length > 8 ? id.slice(-8) : id;
}
