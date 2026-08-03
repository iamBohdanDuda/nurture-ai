import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type Session } from '@supabase/supabase-js';
import { asyncStorage } from './middleware/asyncStorage';
import { STORAGE_KEYS } from '@/core/constants';
import { type User } from '@/types/database';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  avatarUri: string | null;

  // Actions
  setUser: (user: User) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setAvatarUri: (avatarUri: string | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      hasCompletedOnboarding: false,
      avatarUri: null,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setSession: (session) =>
        set({
          session,
          isAuthenticated: !!session,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setOnboardingComplete: (hasCompletedOnboarding) =>
        set({ hasCompletedOnboarding }),

      setAvatarUri: (avatarUri) => set({ avatarUri }),

      signOut: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          avatarUri: null,
        }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        avatarUri: state.avatarUri,
      }),
    }
  )
);
