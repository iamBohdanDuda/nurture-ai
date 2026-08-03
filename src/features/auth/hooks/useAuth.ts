import { useCallback, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '../services/authService';

export function useAuth() {
  const { user, isAuthenticated, setUser, setSession, setLoading, signOut: clearStore } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLocalLoading] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLocalLoading(true);
      setError(null);
      const data = await authService.signInWithEmail(email, password);
      if (data.session) {
        setSession(data.session);
        const profile = await authService.getUserProfile(data.session.user.id);
        if (profile) {
          setUser(profile);
        }
      }
    } catch (err: any) {
      setError(err.message ?? 'Sign in failed');
      throw err;
    } finally {
      setLocalLoading(false);
    }
  }, [setSession, setUser]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLocalLoading(true);
      setError(null);
      const data = await authService.signUpWithEmail(email, password);
      if (data.session) {
        setSession(data.session);
      }
      return data;
    } catch (err: any) {
      let message = err.message ?? 'Sign up failed';
      if (err.message?.toLowerCase().includes('rate limit')) {
        message = 'Email rate limit exceeded. Supabase limits sign-up emails (3-4 per hour on free tier). Please wait a few minutes before trying again or sign in if you already created an account.';
      } else if (err.message === 'Network request failed') {
        message = 'Network request failed. Please check your internet connection and Supabase configuration.';
      }
      setError(message);
      throw err;
    } finally {
      setLocalLoading(false);
    }
  }, [setSession]);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
      clearStore();
    } catch (err: any) {
      setError(err.message ?? 'Sign out failed');
    }
  }, [clearStore]);

  const deleteAccount = useCallback(async () => {
    try {
      setLocalLoading(true);
      if (user?.id) {
        await authService.deleteAccount(user.id);
      }
      clearStore();
    } catch (err: any) {
      setError(err.message ?? 'Delete account failed');
      throw err;
    } finally {
      setLocalLoading(false);
    }
  }, [user?.id, clearStore]);

  return {
    user,
    isAuthenticated,
    error,
    loading,
    signIn,
    signUp,
    signOut,
    deleteAccount,
    clearError: () => setError(null),
  };
}
