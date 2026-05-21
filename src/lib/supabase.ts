import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import type { Database } from '@/types/database';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/config';

const isClient = () => typeof window !== 'undefined';

/** Node SSR 시 window/AsyncStorage 접근 방지 */
const authStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (!isClient()) return null;
    if (Platform.OS === 'web') return window.localStorage.getItem(key);
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (!isClient()) return;
    if (Platform.OS === 'web') window.localStorage.setItem(key, value);
    else await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (!isClient()) return;
    if (Platform.OS === 'web') window.localStorage.removeItem(key);
    else await AsyncStorage.removeItem(key);
  },
};

let client: SupabaseClient<Database> | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL?.trim() && SUPABASE_ANON_KEY?.trim());
}

function getSupabaseClient(): SupabaseClient<Database> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  if (!client) {
    client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

/** 데모 모드에서는 import만 하고, 실제 접근 전까지 클라이언트를 만들지 않음 */
export const supabase: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const c = getSupabaseClient();
    const value = Reflect.get(c, prop);
    return typeof value === 'function' ? value.bind(c) : value;
  },
});
