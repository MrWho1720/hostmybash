import { NextRequest, NextResponse } from "next/server";

// Paths that require authentication
const PROTECTED_PATHS = ["/scripts", "/dashboard", "/settings", "/nodes"];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected) return NextResponse.next();

  // Check for a Lucia session cookie (any cookie whose name starts with "auth_session")
  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("auth_session") && c.value.length > 0);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    // Preserve any existing `from` param, otherwise use current path
    loginUrl.searchParams.set(
      "from",
      searchParams.get("from") || pathname
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match everything except:
     * - _next/static, _next/image
     * - favicon.ico
     * - /api/* routes (handled by API itself)
     * - /login, /register (public auth pages)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|login|register).*)",
  ],
};
