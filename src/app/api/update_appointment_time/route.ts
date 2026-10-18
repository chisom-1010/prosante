import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/api/auth";
import { apiError, parseBody, route } from "@/lib/api/http";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  appointmentId: z.union([z.string().min(1), z.number()]),
  tranche_horaires: z.string().trim().min(1).max(50),
});

export const POST = route(async (req) => {
  const auth = await requireRole("receptionist", "admin");
  if (!auth.ok) return auth.response;

  const body = await parseBody(req, schema);
  if (!body.ok) return body.response;
  const { appointmentId, tranche_horaires } = body.data;

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("demande_de_consultation")
    .update({ tranche_horaires })
    .eq("id", appointmentId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) return apiError("Rendez-vous introuvable.", 404);

  return NextResponse.json({ success: true });
});
