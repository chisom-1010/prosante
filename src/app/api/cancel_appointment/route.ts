import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/api/auth";
import { apiError, parseBody, route } from "@/lib/api/http";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({ appointmentId: z.string().uuid() });

/** A patient cancels one of their own appointments that hasn't started yet. */
export const POST = route(async (req) => {
  const auth = await requireRole("patient");
  if (!auth.ok) return auth.response;

  const body = await parseBody(req, schema);
  if (!body.ok) return body.response;

  const admin = createAdminClient();

  const { data: appointment, error } = await admin
    .from("demande_de_consultation")
    .select("id, status, id_patient")
    .eq("id", body.data.appointmentId)
    .maybeSingle();
  if (error) throw error;

  // Same answer for "doesn't exist" and "not yours" so ids can't be probed.
  if (!appointment || appointment.id_patient !== auth.caller.userId) {
    return apiError("Rendez-vous introuvable.", 404);
  }
  if (!["en attente", "accepté", "reporté"].includes(appointment.status)) {
    return apiError("Ce rendez-vous ne peut plus être annulé.", 409);
  }

  const { error: updateError } = await admin
    .from("demande_de_consultation")
    .update({ status: "annulé" })
    .eq("id", appointment.id);
  if (updateError) throw updateError;

  return NextResponse.json({ success: true });
});
