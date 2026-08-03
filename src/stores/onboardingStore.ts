import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './middleware/asyncStorage';
import { STORAGE_KEYS } from '@/core/constants';
import { type OnboardingData } from '@/types/common';

interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;
  isComplete: boolean;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateData: (partial: Partial<OnboardingData>) => void;
  complete: () => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  firstName: '',
  pregnancyStartDate: null,
  dueDate: null,
  dietaryPreferences: [],
  healthConditions: [],
  bloodType: '',
  emergencyContact: '',
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      totalSteps: 5,
      data: initialData,
      isComplete: false,

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        })),

      goToStep: (step) => set({ currentStep: step }),

      updateData: (partial) =>
        set((state) => ({
          data: { ...state.data, ...partial },
        })),

      complete: () => set({ isComplete: true }),

      reset: () => set({ currentStep: 0, data: initialData, isComplete: false }),
    }),
    {
      name: STORAGE_KEYS.ONBOARDING,
      storage: createJSONStorage(() => asyncStorage),
    }
  )
);
