import { createClient } from '@supabase/supabase-js';

// Server only. This file must never be imported by a client component,
// because the service role key bypasses row level security and must
// never reach the browser. It is only used by server actions in
// lib/admin-actions.ts, after the admin login has been checked.
export function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Service role key is not set. Fill in SUPABASE_SERVICE_ROLE_KEY in .env.local, then restart the app.');
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
