import type { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError } from "@/lib/api/http";

export type Role = "admin" | "patient" | "doctor" | "receptionist";

export type Caller = {
  userId: string;
  email?: string;
  roles: Role[];
  /** True until a staff member has replaced their temporary password. */
  mustChangePassword: boolean;
};

/**
 * Resolves the signed-in user (from the session cookie) and the roles they
 * hold. Mirrors how the app already models roles: admin/patient live in
 * `profiles.role`, doctors and receptionists are rows in their own tables.
 * Returns null when nobody is signed in.
 */
export async function getCaller(): Promise<Caller | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  // Role lookups use the service client so they don't depend on RLS rules
  // for the caller's own rows.
  const admin = createAdminClient();
  const [profile, doctor, receptionist] = await Promise.all([
    admin
      .from("profiles")
      .select("role")
      .eq("auth_user_id", user.id)
      .maybeSingle(),
    admin.from("doctors").select("id").eq("auth_user_id", user.id).maybeSingle(),
    admin
      .from("receptionists")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle(),
  ]);

  const roles: Role[] = [];
  const profileRole = String(profile.data?.role ?? "").toLowerCase();
  if (profileRole === "admin") roles.push("admin");
  if (profileRole === "patient") roles.push("patient");
  if (doctor.data) roles.push("doctor");
  if (receptionist.data) roles.push("receptionist");

  // app_metadata can only be written server-side. user_metadata can be edited by
  // the user themselves, so it is only honoured as a legacy flag: accounts made
  // before this change were flagged there, and it can only ever add a restriction.
  const mustChangePassword =
    user.app_metadata?.must_change_password === true ||
    user.user_metadata?.must_change_password === true;

  return { userId: user.id, email: user.email, roles, mustChangePassword };
}

type GuardResult =
  | { ok: true; caller: Caller }
  | { ok: false; response: NextResponse };

/**
 * Route-handler guard. Usage:
 *
 *   const auth = await requireRole("admin");
 *   if (!auth.ok) return auth.response;
 *
 * 401 when not signed in, 403 when signed in without one of the roles, and 403
 * while a staff member still has to replace their temporary password.
 */
export async function requireRole(...allowed: Role[]): Promise<GuardResult> {
  const caller = await getCaller();

  if (!caller) {
    return { ok: false, response: apiError("Non authentifié.", 401) };
  }

  if (!caller.roles.some((role) => allowed.includes(role))) {
    return { ok: false, response: apiError("Accès refusé.", 403) };
  }

  if (caller.mustChangePassword) {
    return {
      ok: false,
      response: apiError(
        "Vous devez d'abord changer votre mot de passe temporaire.",
        403,
      ),
    };
  }

  return { ok: true, caller };
}

/** Any signed-in user, whatever their role or password state. */
export async function requireSession(): Promise<GuardResult> {
  const caller = await getCaller();
  if (!caller) {
    return { ok: false, response: apiError("Non authentifié.", 401) };
  }
  return { ok: true, caller };
}

/** Where each kind of user lands after signing in. */
export function homePathFor(roles: Role[]): string {
  if (roles.includes("admin")) return "/admin";
  if (roles.includes("doctor")) return "/doctors";
  if (roles.includes("receptionist")) return "/receptionists";
  if (roles.includes("patient")) return "/patients";
  return "/";
}
