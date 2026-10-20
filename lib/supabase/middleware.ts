import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "./env";

/** Pages anyone can open without signing in. Everything else needs a session. */
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/signin",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const CHANGE_PASSWORD_PATH = "/auth/change-password";

function isPublic(pathname: string) {
  return (
    pathname === "/" ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  );
}

/**
 * Runs on every page request (see src/proxy.ts):
 *  1. refreshes the Supabase session cookies,
 *  2. sends visitors without a session to the login page,
 *  3. keeps staff on the change-password page until they've replaced their
 *     temporary password.
 *
 * Which *role* may open which area is checked by the layouts (requireDoctor,
 * requireAdmin, ...) and, for the data itself, by Row Level Security.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { url, key } = supabaseEnv();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Do not run code between createServerClient and getClaims(): it can cause
  // users to be logged out at random.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as
    | {
        app_metadata?: Record<string, unknown>;
        user_metadata?: Record<string, unknown>;
      }
    | undefined;

  const { pathname } = request.nextUrl;

  const redirectTo = (path: string) => {
    const target = request.nextUrl.clone();
    target.pathname = path;
    target.search = "";
    const response = NextResponse.redirect(target);
    // Keep any refreshed session cookies on the redirect as well.
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => response.cookies.set(cookie));
    return response;
  };

  if (!claims) {
    return isPublic(pathname) ? supabaseResponse : redirectTo("/auth/login");
  }

  const mustChangePassword =
    claims.app_metadata?.must_change_password === true ||
    claims.user_metadata?.must_change_password === true;

  if (
    mustChangePassword &&
    !isPublic(pathname) &&
    !pathname.startsWith(CHANGE_PASSWORD_PATH)
  ) {
    return redirectTo(CHANGE_PASSWORD_PATH);
  }

  return supabaseResponse;
}
