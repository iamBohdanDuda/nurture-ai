import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './middleware/asyncStorage';
import { STORAGE_KEYS } from '@/core/constants';

interface SubscriptionState {
  tier: 'free' | 'premium';
  isPremium: boolean;

  // Actions
  setTier: (tier: 'free' | 'premium') => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      tier: 'free',
      isPremium: false,

      setTier: (tier) => set({ tier, isPremium: tier === 'premium' }),
    }),
    {
      name: STORAGE_KEYS.SUBSCRIPTION,
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        tier: state.tier,
        isPremium: state.isPremium,
      }),
    }
  )
);
