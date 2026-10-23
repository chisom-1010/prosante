import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Cheap database round-trip, hit by .github/workflows/keepalive.yml.
 * Supabase pauses free projects after a week with no database activity.
 */
export async function GET() {
  const { error } = await createAdminClient()
    .from("service_medical")
    .select("id", { head: true, count: "exact" })
    .limit(1);

  return NextResponse.json({ ok: !error }, { status: error ? 503 : 200 });
}
