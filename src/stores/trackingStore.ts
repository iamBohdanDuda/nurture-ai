import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './middleware/asyncStorage';
import { STORAGE_KEYS } from '@/core/constants';
import { type SymptomLog, type MealLog, type KickLog, type HydrationLog } from '@/types/database';

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
  hydrationLogs: HydrationLog[];

  // Actions
  logCalories: (amount: number) => void;
  logWater: (ml: number, timestampIso?: string) => void;
  logWeight: (kg: number) => void;
  toggleSymptom: (symptom: string) => void;
  toggleVitamin: (vitamin: string) => void;
  addCustomVitamin: (name: string) => boolean;
  removeCustomVitamin: (id: string) => void;
  addSymptomLog: (log: SymptomLog) => void;
  addMealLog: (log: MealLog) => void;
  addKickLog: (log: KickLog) => void;
  addHydrationLog: (log: HydrationLog) => void;
  resetDaily: () => void;
  checkAndResetIfNewDay: () => void;
}

const getToday = () => new Date().toISOString().split('T')[0];
const getYesterday = () => new Date(Date.now() - 86400000).toISOString().split('T')[0];

// Default sample log for yesterday so historical AI queries always find valid user tracking data in dev/guest mode
const defaultYesterdayLog: HydrationLog = {
  id: 'hyd-yesterday-default',
  user_id: 'current-user',
  amount_ml: 1750, // 7 glasses
  daily_target_ml: 2300,
  logged_at: `${getYesterday()}T15:30:00.000Z`,
};

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
      hydrationLogs: [defaultYesterdayLog],

      logCalories: (amount) =>
        set((state) => ({ todayCalories: state.todayCalories + amount })),

      logWater: (ml, timestampIso) => {
        const loggedAt = timestampIso || new Date().toISOString();
        const newLog: HydrationLog = {
          id: `hyd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          user_id: 'current-user',
          amount_ml: ml,
          daily_target_ml: 2300,
          logged_at: loggedAt,
        };
        set((state) => ({
          todayWater: state.todayWater + ml,
          hydrationLogs: [newLog, ...state.hydrationLogs],
        }));
      },

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

      addHydrationLog: (log) =>
        set((state) => ({
          hydrationLogs: [log, ...state.hydrationLogs],
        })),

      resetDaily: () => {
        const state = get();
        const yestStr = getYesterday();
        const hasYestLogs = state.hydrationLogs.some(h => h.logged_at && h.logged_at.startsWith(yestStr));
        let updatedLogs = state.hydrationLogs;
        if (!hasYestLogs && state.todayWater > 0) {
          const synthLog: HydrationLog = {
            id: `hyd-${Date.now()}-yesterday`,
            user_id: 'current-user',
            amount_ml: state.todayWater,
            daily_target_ml: 2300,
            logged_at: `${yestStr}T20:00:00.000Z`,
          };
          updatedLogs = [synthLog, ...state.hydrationLogs];
        }

        set({
          todayCalories: 0,
          todayWater: 0,
          todayWeight: null,
          todaySymptoms: [],
          vitaminsTaken: [],
          hydrationLogs: updatedLogs,
          lastResetDate: getToday(),
        });
      },

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
