import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './middleware/asyncStorage';
import { STORAGE_KEYS } from '@/core/constants';

interface SubscriptionState {
  tier: 'free' | 'premium';
  isPremium: boolean;
  entitlements: Record<string, boolean>;

  // Actions
  setTier: (tier: 'free' | 'premium') => void;
  setEntitlements: (entitlements: Record<string, boolean>) => void;
  checkAccess: (feature: string) => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      tier: 'free',
      isPremium: false,
      entitlements: {},

      setTier: (tier) => set({ tier, isPremium: tier === 'premium' }),

      setEntitlements: (entitlements) => set({ entitlements }),

      checkAccess: (feature) => {
        const state = get();
        if (state.isPremium) return true;
        return state.entitlements[feature] ?? false;
      },
    }),
    {
      name: STORAGE_KEYS.SUBSCRIPTION,
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        tier: state.tier,
        isPremium: state.isPremium,
        entitlements: state.entitlements,
      }),
    }
  )
);
