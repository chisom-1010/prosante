import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS, so it must only be used in
 * server code (route handlers, scripts) AFTER the caller has been authorized.
 * A fresh client is created per call; never cache it in module scope.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client is not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
