import { NextResponse } from "next/server";
import { z } from "zod";

/** Consistent error envelope: { error: string, details?: ... } */
export function apiError(
  message: string,
  status: number,
  details?: Record<string, unknown>,
) {
  return NextResponse.json(
    details ? { error: message, details } : { error: message },
    { status },
  );
}

type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

/** Parses and validates a JSON request body against a zod schema. */
export async function parseBody<S extends z.ZodType>(
  req: Request,
  schema: S,
): Promise<ParseResult<z.infer<S>>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, response: apiError("Corps de requête invalide.", 400) };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: apiError("Données invalides.", 400, {
        fields: z.flattenError(parsed.error).fieldErrors,
      }),
    };
  }

  return { ok: true, data: parsed.data };
}

/**
 * Wraps a route handler so an unexpected exception becomes a logged 500
 * with a generic message instead of leaking internals to the client.
 */
export function route(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (err) {
      console.error("[api] unhandled error:", err);
      return apiError("Erreur serveur.", 500);
    }
  };
}
