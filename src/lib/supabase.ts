import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
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

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
