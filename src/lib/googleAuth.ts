import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

/**
 * Supabase Google OAuth (Expo Go / 실기기 / 웹)
 * Supabase 대시보드 → Authentication → Providers → Google 활성화 필요
 */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  try {
    const redirectTo = makeRedirectUri({ scheme: 'drivequest', path: 'auth/callback' });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error) return { error: error.message };
    if (!data?.url) return { error: 'Google 로그인 URL을 받지 못했습니다.' };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type !== 'success' || !result.url) {
      return { error: result.type === 'cancel' ? '로그인이 취소되었습니다.' : '로그인에 실패했습니다.' };
    }

    const hash = result.url.includes('#') ? result.url.split('#')[1] : '';
    const query = result.url.includes('?') ? result.url.split('?')[1]?.split('#')[0] : '';
    const params = new URLSearchParams(hash || query);

    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (access_token && refresh_token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (sessionError) return { error: sessionError.message };
      return { error: null };
    }

    const code = params.get('code');
    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) return { error: exchangeError.message };
      return { error: null };
    }

    return { error: '인증 토큰을 확인하지 못했습니다. Supabase Redirect URL 설정을 확인하세요.' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Google 로그인 중 오류가 발생했습니다.' };
  }
}
