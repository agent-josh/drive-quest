import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { signInWithGoogle as googleSignIn } from '@/lib/googleAuth';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateNickname: (nickname: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  }, [session?.user?.id, fetchProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user?.id) {
        fetchProfile(s.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user?.id) {
        fetchProfile(s.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signInWithGoogle = useCallback(async () => googleSignIn(), []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const updateNickname = useCallback(
    async (nickname: string) => {
      if (!session?.user?.id) return { error: '로그인이 필요합니다.' };
      const trimmed = nickname.trim();
      if (trimmed.length < 2 || trimmed.length > 20) {
        return { error: '닉네임은 2~20자여야 합니다.' };
      }
      const { error } = await supabase
        .from('profiles')
        .update({ nickname: trimmed })
        .eq('id', session.user.id);
      if (error) return { error: error.message };
      await fetchProfile(session.user.id);
      return { error: null };
    },
    [session?.user?.id, fetchProfile],
  );

  const value = useMemo(
    () => ({
      session,
      profile,
      isLoading,
      signInWithGoogle,
      signOut,
      refreshProfile,
      updateNickname,
    }),
    [session, profile, isLoading, signInWithGoogle, signOut, refreshProfile, updateNickname],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
