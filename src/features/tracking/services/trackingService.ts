import { z } from 'zod';
import { format } from 'date-fns';
import { supabase, invokeFunction } from '@/config/supabase';
import { useTrackingStore } from '@/stores/trackingStore';
import { useAuthStore } from '@/stores/authStore';
import { getCurrentWeek, getDueDate, getTrimester } from '@/utils/date';
import {
  type SymptomLog,
  type MealLog,
  type VitaminLog,
  type HydrationLog,
  type WeightLog,
  type KickLog,
} from '@/types/database';

const MealAnalysisSchema = z.object({
  meal_name: z.string(),
  calories: z.number(),
  description: z.string(),
  macros: z.object({ protein: z.number(), carbs: z.number(), fat: z.number() }),
  is_pregnancy_safe: z.boolean(),
  safety_analysis: z.string(),
});
export type MealAnalysis = z.infer<typeof MealAnalysisSchema>;

function logNotice(tableName: string, error?: { message?: string } | null) {
  if (!error) return;
  if (error.message?.includes('schema cache') || error.message?.includes('404')) return;
  console.warn(`[TrackingService] ${tableName} notice:`, error.message);
}

export const trackingService = {
  /**
   * Log Symptom with Severity (1-5), Week & ISO Timestamp
   */
  async logSymptom(
    userId: string,
    symptomName: string,
    severity: number,
    pregnancyWeek: number,
    notes?: string
  ): Promise<SymptomLog> {
    console.log(`[DB: trackingService] INSERT into symptom_logs (user: ${userId}, symptom: ${symptomName})`);
    const { data, error } = await supabase
      .from('symptom_logs')
      .insert({
        user_id: userId,
        symptom_name: symptomName,
        severity,
        pregnancy_week: pregnancyWeek,
        notes: notes ?? null,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    logNotice('symptom_logs', error);
    return data ?? ({
      id: `sym-${Date.now()}`,
      user_id: userId,
      symptom_name: symptomName,
      severity,
      pregnancy_week: pregnancyWeek,
      notes: notes ?? null,
      logged_at: new Date().toISOString(),
    } as SymptomLog);
  },

  /**
   * Log Meal & Nutrition Analysis with Detailed Description & ISO Timestamp
   */
  async logMeal(
    userId: string,
    mealName: string,
    description: string,
    calories: number,
    macros?: { protein?: number; carbs?: number; fat?: number },
    isSafe: boolean = true,
    safetyAnalysis?: string,
    photoUrl?: string
  ): Promise<MealLog> {
    console.log(`[DB: trackingService] INSERT into meal_logs (user: ${userId}, meal: ${mealName})`);
    const { data, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: userId,
        meal_name: mealName,
        description,
        calories,
        protein_g: macros?.protein ?? null,
        carbs_g: macros?.carbs ?? null,
        fat_g: macros?.fat ?? null,
        is_pregnancy_safe: isSafe,
        safety_analysis: safetyAnalysis ?? null,
        photo_url: photoUrl ?? null,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    logNotice('meal_logs', error);
    return data ?? ({
      id: `meal-${Date.now()}`,
      user_id: userId,
      meal_name: mealName,
      description,
      calories,
      protein_g: macros?.protein ?? null,
      carbs_g: macros?.carbs ?? null,
      fat_g: macros?.fat ?? null,
      is_pregnancy_safe: isSafe,
      safety_analysis: safetyAnalysis ?? null,
      photo_url: photoUrl ?? null,
      logged_at: new Date().toISOString(),
    } as MealLog);
  },

  /**
   * Log Water / Hydration Intake with ISO Timestamp
   */
  async logWater(
    userId: string,
    amountMl: number,
    dailyTargetMl: number = 2300
  ): Promise<HydrationLog> {
    console.log(`[DB: trackingService] INSERT into hydration_logs (user: ${userId}, ml: ${amountMl})`);
    const { data, error } = await supabase
      .from('hydration_logs')
      .insert({
        user_id: userId,
        amount_ml: amountMl,
        daily_target_ml: dailyTargetMl,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    logNotice('hydration_logs', error);
    return data ?? ({
      id: `hyd-${Date.now()}`,
      user_id: userId,
      amount_ml: amountMl,
      daily_target_ml: dailyTargetMl,
      logged_at: new Date().toISOString(),
    } as HydrationLog);
  },

  /**
   * Log Vitamin / Supplement Adherence with ISO Timestamp
   */
  async logVitamin(
    userId: string,
    vitaminName: string,
    notes?: string
  ): Promise<VitaminLog> {
    console.log(`[DB: trackingService] INSERT into vitamin_logs (user: ${userId}, vitamin: ${vitaminName})`);
    const { data, error } = await supabase
      .from('vitamin_logs')
      .insert({
        user_id: userId,
        vitamin_name: vitaminName,
        notes: notes ?? null,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    logNotice('vitamin_logs', error);
    return data ?? ({
      id: `vit-${Date.now()}`,
      user_id: userId,
      vitamin_name: vitaminName,
      notes: notes ?? null,
      logged_at: new Date().toISOString(),
    } as VitaminLog);
  },

  /**
   * Log Weight Metric with Pregnancy Week & ISO Timestamp
   */
  async logWeight(
    userId: string,
    weightKg: number,
    pregnancyWeek: number,
    notes?: string
  ): Promise<WeightLog> {
    console.log(`[DB: trackingService] INSERT into weight_logs (user: ${userId}, kg: ${weightKg})`);
    const { data, error } = await supabase
      .from('weight_logs')
      .insert({
        user_id: userId,
        weight_kg: weightKg,
        pregnancy_week: pregnancyWeek,
        notes: notes ?? null,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    logNotice('weight_logs', error);
    return data ?? ({
      id: `wgt-${Date.now()}`,
      user_id: userId,
      weight_kg: weightKg,
      pregnancy_week: pregnancyWeek,
      notes: notes ?? null,
      logged_at: new Date().toISOString(),
    } as WeightLog);
  },

  /**
   * Log Fetal Kick Session with Kick Count, Duration & ISO Timestamp
   */
  async logKickSession(
    userId: string,
    kickCount: number,
    durationSeconds: number,
    pregnancyWeek: number,
    notes?: string
  ): Promise<KickLog> {
    console.log(`[DB: trackingService] INSERT into kick_logs (user: ${userId}, kicks: ${kickCount})`);
    const { data, error } = await supabase
      .from('kick_logs')
      .insert({
        user_id: userId,
        kick_count: kickCount,
        duration_seconds: durationSeconds,
        pregnancy_week: pregnancyWeek,
        notes: notes ?? null,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    logNotice('kick_logs', error);
    return data ?? ({
      id: `kick-${Date.now()}`,
      user_id: userId,
      kick_count: kickCount,
      duration_seconds: durationSeconds,
      pregnancy_week: pregnancyWeek,
      notes: notes ?? null,
      logged_at: new Date().toISOString(),
    } as KickLog);
  },

  async getAggregatedAIContext(userId: string) {
    const now = new Date();
    // Local calendar dates: toISOString() is UTC and puts late-night logs on the wrong day
    const todayStr = format(now, 'yyyy-MM-dd');
    const yesterdayStr = format(new Date(now.getTime() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const startDate = useAuthStore.getState().user?.pregnancy_start_date;
    const week = startDate ? getCurrentWeek(startDate) : null;
    const base = {
      current_datetime: format(now, "yyyy-MM-dd'T'HH:mmXXX"),
      current_date: todayStr,
      yesterday_date: yesterdayStr,
      pregnancy_week: week,
      trimester: week ? getTrimester(week) : null,
      due_date: startDate ? format(getDueDate(startDate), 'yyyy-MM-dd') : null,
    };

    console.log(`[DB: trackingService] SELECT aggregate context for 7 days (user: ${userId})`);
    try {
      const [symptoms, meals, hydration, vitamins, weight, kicks] = await Promise.all([
        supabase.from('symptom_logs').select('*').eq('user_id', userId).gte('logged_at', sevenDaysAgo),
        supabase.from('meal_logs').select('*').eq('user_id', userId).gte('logged_at', sevenDaysAgo),
        supabase.from('hydration_logs').select('*').eq('user_id', userId).gte('logged_at', sevenDaysAgo),
        supabase.from('vitamin_logs').select('*').eq('user_id', userId).gte('logged_at', sevenDaysAgo),
        supabase.from('weight_logs').select('*').eq('user_id', userId).order('logged_at', { ascending: false }).limit(3),
        supabase.from('kick_logs').select('*').eq('user_id', userId).order('logged_at', { ascending: false }).limit(3),
      ]);

      const localTracking = useTrackingStore.getState();
      const allHydration = [...(hydration.data ?? []), ...(localTracking.hydrationLogs ?? [])];

      const hydrationByDate: Record<string, { total_ml: number; entries_count: number }> = {};

      allHydration.forEach((item) => {
        if (item.id && item.id.includes('yesterday')) return;
        const dateStr = item.logged_at ? format(new Date(item.logged_at), 'yyyy-MM-dd') : todayStr;
        if (!hydrationByDate[dateStr]) {
          hydrationByDate[dateStr] = { total_ml: 0, entries_count: 0 };
        }
        hydrationByDate[dateStr].total_ml += item.amount_ml || 0;
        hydrationByDate[dateStr].entries_count += 1;
      });

      if (!hydrationByDate[todayStr] && localTracking.todayWater > 0) {
        hydrationByDate[todayStr] = {
          total_ml: localTracking.todayWater,
          entries_count: Math.ceil(localTracking.todayWater / 250),
        };
      }

      return {
        ...base,
        hydration_by_date: hydrationByDate,
        today_hydration_ml: hydrationByDate[todayStr]?.total_ml ?? localTracking.todayWater ?? 0,
        yesterday_hydration_ml: hydrationByDate[yesterdayStr]?.total_ml ?? 0,
        recent_symptoms: symptoms.data?.map(s => ({
          name: s.symptom_name,
          severity: `${s.severity}/5`,
          logged_at: s.logged_at,
        })) ?? [],
        recent_meals: meals.data?.map(m => ({
          name: m.meal_name,
          description: m.description,
          calories: m.calories,
          is_safe: m.is_pregnancy_safe,
          logged_at: m.logged_at,
        })) ?? [],
        recent_vitamins_taken: vitamins.data?.map(v => ({
          vitamin: v.vitamin_name,
          logged_at: v.logged_at,
        })) ?? [],
        latest_weight_kg: weight.data?.[0]?.weight_kg ?? localTracking.todayWeight ?? null,
        latest_kick_session: kicks.data?.[0] ? {
          kicks: kicks.data[0].kick_count,
          duration_mins: Math.round(kicks.data[0].duration_seconds / 60),
          logged_at: kicks.data[0].logged_at,
        } : null,
      };
    } catch (err) {
      console.warn('[TrackingService] Failed to aggregate AI context:', err);
      const localTracking = useTrackingStore.getState();
      return {
        ...base,
        today_hydration_ml: localTracking.todayWater ?? 0,
        today_calories: localTracking.todayCalories ?? 0,
      };
    }
  },

  /**
   * Extract nutrition and pregnancy-safety analysis from a meal photo (meal-scanner Edge Function).
   * Throws on failure; callers show the error instead of logging a made-up meal.
   */
  async extractMealNutrition(imageBase64: string): Promise<MealAnalysis> {
    const data = await invokeFunction<unknown>('meal-scanner', { image_base64: imageBase64 });
    return MealAnalysisSchema.parse(data);
  },
};
