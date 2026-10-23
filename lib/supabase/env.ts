/**
 * The Supabase public (anon / publishable) key has been read under three
 * different env var names by three different files. Accept any of them so the
 * existing deployment keeps working, and fail with one clear message if none is set.
 *
 * Each `process.env.NEXT_PUBLIC_*` reference must stay a literal so Next.js can
 * inline it into the browser bundle.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseEnv() {
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and one of " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY, " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return { url, key };
}
