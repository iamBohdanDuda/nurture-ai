import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './middleware/asyncStorage';
import { STORAGE_KEYS } from '@/core/constants';

type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  themeMode: ThemeMode;
  isFirstLaunch: boolean;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setFirstLaunch: (value: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      isFirstLaunch: true,

      setThemeMode: (themeMode) => set({ themeMode }),
      setFirstLaunch: (isFirstLaunch) => set({ isFirstLaunch }),
    }),
    {
      name: STORAGE_KEYS.UI,
      storage: createJSONStorage(() => asyncStorage),
    }
  )
);
