import { createAdminClient } from "@/lib/supabase/admin";

type StaffTable = "doctors" | "receptionists";

type CreateResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; error: string };

/**
 * Creates an auth user plus its row in `doctors` / `receptionists`, and rolls
 * the auth user back if the row can't be written, so a half-created account
 * (login works, no staff record) can never be left behind.
 */
export async function createStaffAccount(args: {
  table: StaffTable;
  email: string;
  password: string;
  row: Record<string, unknown>;
}): Promise<CreateResult> {
  const admin = createAdminClient();

  const { data, error: authError } = await admin.auth.admin.createUser({
    email: args.email,
    password: args.password,
    email_confirm: true,
    user_metadata: { must_change_password: true },
  });

  if (authError || !data?.user) {
    if (authError?.code === "email_exists") {
      return {
        ok: false,
        status: 409,
        error: "Un compte existe déjà avec cet email.",
      };
    }
    console.error("[staff] createUser failed:", authError);
    return { ok: false, status: 400, error: "Impossible de créer le compte." };
  }

  const userId = data.user.id;

  const { error: insertError } = await admin
    .from(args.table)
    .insert({ ...args.row, email: args.email, auth_user_id: userId });

  if (insertError) {
    console.error(`[staff] insert into ${args.table} failed:`, insertError);
    await admin.auth.admin.deleteUser(userId);
    return {
      ok: false,
      status: 400,
      error: "Impossible d'enregistrer le profil.",
    };
  }

  return { ok: true, userId };
}

/** Removes a staff row and its auth user (used to undo a creation). */
export async function removeStaffAccount(table: StaffTable, userId: string) {
  const admin = createAdminClient();

  const { error: rowError } = await admin
    .from(table)
    .delete()
    .eq("auth_user_id", userId);
  if (rowError) console.error(`[staff] delete from ${table} failed:`, rowError);

  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) console.error("[staff] deleteUser failed:", authError);

  return !rowError && !authError;
}
