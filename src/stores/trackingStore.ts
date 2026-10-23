import { create } from 'zustand';
import { format } from 'date-fns';
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
  resetDaily: () => void;
  checkAndResetIfNewDay: () => void;
}

// Local calendar day, so daily totals reset at the user's midnight rather than UTC's
const getToday = () => format(new Date(), 'yyyy-MM-dd');

// ponytail: on-device history is capped (the whole store is persisted and re-rendered);
// the server keeps everything. Load history from Supabase if older days must show here.
const MAX_LOGS = 500;
const prepend = <T>(log: T, logs: T[]) => [log, ...logs].slice(0, MAX_LOGS);

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
      hydrationLogs: [],

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
          hydrationLogs: prepend(newLog, state.hydrationLogs),
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
          symptomLogs: prepend(log, state.symptomLogs),
          todaySymptoms: Array.from(new Set([log.symptom_name, ...state.todaySymptoms])),
        })),

      addMealLog: (log) =>
        set((state) => ({
          mealLogs: prepend(log, state.mealLogs),
          todayCalories: state.todayCalories + log.calories,
        })),

      addKickLog: (log) =>
        set((state) => ({
          kickLogs: prepend(log, state.kickLogs),
        })),

      resetDaily: () => {
        const state = get();
        // Remove any synthetic yesterday logs from previous bug, keep authentic logs
        const cleanLogs = (state.hydrationLogs || []).filter((h) => !h.id.includes('yesterday'));

        set({
          todayCalories: 0,
          todayWater: 0,
          todayWeight: null,
          todaySymptoms: [],
          vitaminsTaken: [],
          hydrationLogs: cleanLogs,
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrationLogs = (state.hydrationLogs || []).filter(
            (h) => !h.id.includes('yesterday')
          );
        }
      },
    }
  )
);
