import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Resolves the calling user from their JWT and returns a Supabase client that
 * acts as that user, so RLS applies to every query. Null when the caller is not
 * a signed-in user (missing token, or just the anon key).
 */
export async function getCaller(req: Request) {
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return { supabase, user: data.user };
}

/** Gemini generateContent call. Key goes in a header, never the URL. */
export async function gemini(model: string, payload: unknown) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': Deno.env.get('GEMINI_API_KEY') ?? '' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Gemini error (${res.status}): ${data.error?.message ?? 'unknown'}`);
  }
  return data;
}

/** RevenueCat is the source of truth for Pro (the app logs in to RevenueCat with the Supabase user id). */
export async function isPremium(userId: string): Promise<boolean> {
  const key = Deno.env.get('REVENUECAT_SECRET_KEY');
  if (!key) {
    console.warn('REVENUECAT_SECRET_KEY not set: free limits are not enforced');
    return true;
  }
  try {
    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`RevenueCat ${res.status}`);
    const { subscriber } = await res.json();
    // deno-lint-ignore no-explicit-any
    return Object.values(subscriber?.entitlements ?? {}).some(
      (e: any) => !e.expires_date || Date.parse(e.expires_date) > Date.now()
    );
  } catch (err) {
    // ponytail: fail open so a RevenueCat outage doesn't lock out paying users.
    console.warn('RevenueCat check failed, allowing request:', err);
    return true;
  }
}

/**
 * This week's free-tier counters. The counters live in a table users can't write, so deleting
 * chats or reinstalling doesn't reset them. Callers increment only after the model answered.
 */
export async function weeklyUsage(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc('get_ai_usage').maybeSingle();
  if (error) throw error;
  const row = data as { messages: number; scans: number } | null;
  return { messages: row?.messages ?? 0, scans: row?.scans ?? 0 };
}
