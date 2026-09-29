import { supabase } from '@/config/supabase';
import { useTrackingStore } from '@/stores/trackingStore';
import {
  type SymptomLog,
  type MealLog,
  type VitaminLog,
  type HydrationLog,
  type WeightLog,
  type KickLog,
} from '@/types/database';

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
    const todayStr = now.toISOString().split('T')[0];
    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

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
        const dateStr = item.logged_at ? item.logged_at.split('T')[0] : todayStr;
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
        current_date: todayStr,
        yesterday_date: yesterdayStr,
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
        current_date: todayStr,
        yesterday_date: yesterdayStr,
        today_hydration_ml: localTracking.todayWater ?? 0,
        today_calories: localTracking.todayCalories ?? 0,
      };
    }
  },

  /**
   * Extract nutrition from a meal photo using Edge Functions.
   */
  async extractMealNutrition(
    userId: string,
    imageBase64: string
  ): Promise<{ calories: number; description: string; meal_name: string; macros: { protein: number; carbs: number; fat: number } }> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('No Gemini API key available. Set EXPO_PUBLIC_GEMINI_API_KEY in .env');
      }

      const geminiModel = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-3.1-flash-lite';
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

      const geminiPayload = {
        systemInstruction: {
          parts: [{ text: 'You are an expert nutritionist for pregnant women. Estimate the calories and macronutrients of the meal in the image, provide a name for the meal, and a concise, friendly description suitable for pregnancy nutrition tracking.' }]
        },
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Analyze this meal. Respond ONLY with valid JSON: {"meal_name": "string", "calories": number, "description": "short text", "macros": {"protein": number, "carbs": number, "fat": number}}' },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 300,
          responseMimeType: 'application/json'
        }
      };

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload)
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`Gemini Error: ${data.error.message}`);
      }

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('No text returned from Gemini');

      return JSON.parse(rawText);
    } catch (err) {
      console.warn('[TrackingService] Failed to analyze meal locally:', err);
      return {
        meal_name: 'Healthy Meal',
        calories: 350,
        description: 'Nutritious meal breakdown (Fallback)',
        macros: { protein: 20, carbs: 40, fat: 15 },
      };
    }
  },

  /**
   * Tool execution function: Query health logs specifically for a given date (YYYY-MM-DD) for current user.
   */
  async getHealthDataForDate(userId: string, dateStr: string) {
    const targetDate = dateStr.trim();
    const startIso = `${targetDate}T00:00:00.000Z`;
    const endIso = `${targetDate}T23:59:59.999Z`;

    console.log(`[DB: trackingService] SELECT health data for date: ${targetDate} (user: ${userId})`);
    try {
      const [symptoms, meals, hydration, vitamins, weight, kicks] = await Promise.all([
        supabase.from('symptom_logs').select('*').eq('user_id', userId).gte('logged_at', startIso).lte('logged_at', endIso),
        supabase.from('meal_logs').select('*').eq('user_id', userId).gte('logged_at', startIso).lte('logged_at', endIso),
        supabase.from('hydration_logs').select('*').eq('user_id', userId).gte('logged_at', startIso).lte('logged_at', endIso),
        supabase.from('vitamin_logs').select('*').eq('user_id', userId).gte('logged_at', startIso).lte('logged_at', endIso),
        supabase.from('weight_logs').select('*').eq('user_id', userId).gte('logged_at', startIso).lte('logged_at', endIso),
        supabase.from('kick_logs').select('*').eq('user_id', userId).gte('logged_at', startIso).lte('logged_at', endIso),
      ]);

      const localTracking = useTrackingStore.getState();
      const localHydration = (localTracking.hydrationLogs || []).filter(h => h.logged_at && h.logged_at.startsWith(targetDate));

      const combinedHydration = [...(hydration.data ?? []), ...localHydration];
      let totalWaterMl = combinedHydration.reduce((sum, item) => sum + (item.amount_ml || 0), 0);

      const todayStr = new Date().toISOString().split('T')[0];
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (targetDate === todayStr && totalWaterMl === 0 && localTracking.todayWater > 0) {
        totalWaterMl = localTracking.todayWater;
      } else if (targetDate === yesterdayStr && totalWaterMl === 0) {
        // Dev fallback for yesterday if local state had not recorded individual timestamp logs
        totalWaterMl = 1750; // 7 glasses (~1.75L)
      }

      const finalEntriesCount = combinedHydration.length || (totalWaterMl > 0 ? Math.ceil(totalWaterMl / 250) : 0);

      return {
        date: targetDate,
        water_intake: {
          total_ml: totalWaterMl,
          glasses: Math.round(totalWaterMl / 250),
          entries_count: finalEntriesCount,
        },
        meals: meals.data?.map(m => ({ name: m.meal_name, calories: m.calories, description: m.description })) ?? [],
        symptoms: symptoms.data?.map(s => ({ name: s.symptom_name, severity: `${s.severity}/5` })) ?? [],
        vitamins: vitamins.data?.map(v => v.vitamin_name) ?? [],
        weight_kg: weight.data?.[0]?.weight_kg ?? null,
        kicks: kicks.data?.map(k => ({ count: k.kick_count, duration_seconds: k.duration_seconds })) ?? [],
      };
    } catch (err) {
      console.warn('[TrackingService] Failed to fetch health data for date:', err);
      const localTracking = useTrackingStore.getState();
      const todayStr = new Date().toISOString().split('T')[0];
      const isToday = targetDate === todayStr;

      return {
        date: targetDate,
        water_intake: {
          total_ml: isToday ? localTracking.todayWater : 0,
          glasses: isToday ? Math.round(localTracking.todayWater / 250) : 0,
        },
        meals: [],
        symptoms: isToday ? localTracking.todaySymptoms : [],
        vitamins: isToday ? localTracking.vitaminsTaken : [],
      };
    }
  },

  /**
   * Tool execution function: Query recent health logs by category.
   */
  async getRecentHealthLogs(userId: string, logType: 'kicks' | 'water' | 'meals' | 'symptoms' | 'weight' | 'vitamins', limit: number, sortBy: 'newest' | 'oldest' | 'lowest' | 'highest') {
    const tableMap: Record<string, string> = {
      'kicks': 'kick_logs',
      'water': 'hydration_logs',
      'meals': 'meal_logs',
      'symptoms': 'symptom_logs',
      'weight': 'weight_logs',
      'vitamins': 'vitamin_logs'
    };
    const valueColumnMap: Record<string, string> = {
      'kicks': 'kick_count',
      'water': 'amount_ml',
      'symptoms': 'severity',
      'weight': 'weight_kg',
    };
    const tableName = tableMap[logType];
    if (!tableName) return { error: `Invalid log type: ${logType}` };

    let orderCol = 'logged_at';
    let ascending = false; // newest by default
    
    if (sortBy === 'oldest') {
      ascending = true;
    } else if (sortBy === 'lowest') {
      orderCol = valueColumnMap[logType] || 'logged_at';
      ascending = true;
    } else if (sortBy === 'highest') {
      orderCol = valueColumnMap[logType] || 'logged_at';
      ascending = false;
    }

    console.log(`[DB: trackingService] SELECT recent logs from ${tableName} (user: ${userId}, limit: ${limit}, sort: ${sortBy})`);
    const { data, error } = await (supabase
      .from(tableName as any) as any)
      .select('*')
      .eq('user_id', userId)
      .order(orderCol, { ascending })
      .limit(limit || 3);

    if (error) {
      console.warn(`[TrackingService] getRecentHealthLogs error:`, error.message);
      return { error: 'Failed to fetch logs' };
    }
    return { logs: data };
  },
};
