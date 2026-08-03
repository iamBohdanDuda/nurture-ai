import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './middleware/asyncStorage';
import { STORAGE_KEYS } from '@/core/constants';
import { type SymptomLog, type MealLog, type KickLog } from '@/types/database';

interface TrackingState {
  todayCalories: number;
  todayWater: number;
  todayWeight: number | null;
  todaySymptoms: string[];
  vitaminsTaken: string[];
  customVitamins: Array<{ id: string; name: string }>;
  lastResetDate: string;

  // Rich log history
  symptomLogs: SymptomLog[];
  mealLogs: MealLog[];
  kickLogs: KickLog[];

  // Actions
  logCalories: (amount: number) => void;
  logWater: (ml: number) => void;
  logWeight: (kg: number) => void;
  toggleSymptom: (symptom: string) => void;
  toggleVitamin: (vitamin: string) => void;
  addCustomVitamin: (name: string) => boolean;
  removeCustomVitamin: (id: string) => void;
  addSymptomLog: (log: SymptomLog) => void;
  addMealLog: (log: MealLog) => void;
  addKickLog: (log: KickLog) => void;
  resetDaily: () => void;
  checkAndResetIfNewDay: () => void;
}

const getToday = () => new Date().toISOString().split('T')[0];

export const useTrackingStore = create<TrackingState>()(
  persist(
    (set, get) => ({
      todayCalories: 0,
      todayWater: 0,
      todayWeight: null,
      todaySymptoms: [],
      vitaminsTaken: [],
      customVitamins: [],
      lastResetDate: getToday(),

      symptomLogs: [],
      mealLogs: [],
      kickLogs: [],

      logCalories: (amount) =>
        set((state) => ({ todayCalories: state.todayCalories + amount })),

      logWater: (ml) =>
        set((state) => ({ todayWater: state.todayWater + ml })),

      logWeight: (kg) => set({ todayWeight: kg }),

      toggleSymptom: (symptom) =>
        set((state) => ({
          todaySymptoms: state.todaySymptoms.includes(symptom)
            ? state.todaySymptoms.filter((s) => s !== symptom)
            : [...state.todaySymptoms, symptom],
        })),

      toggleVitamin: (vitamin) =>
        set((state) => ({
          vitaminsTaken: state.vitaminsTaken.includes(vitamin)
            ? state.vitaminsTaken.filter((v) => v !== vitamin)
            : [...state.vitaminsTaken, vitamin],
        })),

      addCustomVitamin: (name) => {
        const state = get();
        if (state.customVitamins.length >= 15) return false;
        const trimmed = name.trim();
        if (!trimmed) return false;
        const newVit = { id: `custom_${Date.now()}`, name: trimmed };
        set({ customVitamins: [...state.customVitamins, newVit] });
        return true;
      },

      removeCustomVitamin: (id) =>
        set((state) => ({
          customVitamins: state.customVitamins.filter((v) => v.id !== id),
          vitaminsTaken: state.vitaminsTaken.filter((v) => v !== id),
        })),

      addSymptomLog: (log) =>
        set((state) => ({
          symptomLogs: [log, ...state.symptomLogs],
          todaySymptoms: Array.from(new Set([log.symptom_name, ...state.todaySymptoms])),
        })),

      addMealLog: (log) =>
        set((state) => ({
          mealLogs: [log, ...state.mealLogs],
          todayCalories: state.todayCalories + log.calories,
        })),

      addKickLog: (log) =>
        set((state) => ({
          kickLogs: [log, ...state.kickLogs],
        })),

      resetDaily: () =>
        set({
          todayCalories: 0,
          todayWater: 0,
          todayWeight: null,
          todaySymptoms: [],
          vitaminsTaken: [],
          lastResetDate: getToday(),
        }),

      checkAndResetIfNewDay: () => {
        const today = getToday();
        if (get().lastResetDate !== today) {
          get().resetDaily();
        }
      },
    }),
    {
      name: STORAGE_KEYS.TRACKING,
      storage: createJSONStorage(() => asyncStorage),
    }
  )
);
