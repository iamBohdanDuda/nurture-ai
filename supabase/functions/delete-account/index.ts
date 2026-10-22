import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, getCaller, json } from '../_shared/auth.ts';

// Deletes the caller's auth user; every table with ON DELETE CASCADE on auth.users goes with it.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const caller = await getCaller(req);
  if (!caller) return json({ error: 'Unauthorized' }, 401);
  const userId = caller.user.id;

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // These tables predate the repo's migrations, so don't rely on their FK cascading.
  for (const [table, column] of [['chat_history', 'user_id'], ['user_memory', 'user_id'], ['users', 'id']]) {
    const { error } = await admin.from(table).delete().eq(column, userId);
    if (error) {
      console.error(`delete-account: ${table}`, error);
      return json({ error: 'Could not delete account data' }, 500);
    }
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    console.error('delete-account: auth user', error);
    return json({ error: 'Could not delete account' }, 500);
  }
  return json({ deleted: true });
});
