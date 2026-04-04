import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// The main domain — requests here go to the dashboard
const MAIN_HOST = process.env.MAIN_HOST || "endever.in";

// Paths on the main domain that require authentication
const PROTECTED_PATHS = ["/scripts", "/dashboard", "/settings", "/nodes"];

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0]; // strip port

  // Force HTTPS in production
  const proto = request.headers.get("x-forwarded-proto");
  if (proto === "http" && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(
      new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${host}`),
      301
    );
  }

  // Check if this is a subdomain request (e.g., user1.endever.in)
  if (hostname.endsWith(`.${MAIN_HOST}`) && hostname !== MAIN_HOST) {
    const username = hostname.replace(`.${MAIN_HOST}`, "").toLowerCase();

    // Ignore www
    if (username === "www") {
      return NextResponse.redirect(
        new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${MAIN_HOST}`),
        301
      );
    }

    const pathname = request.nextUrl.pathname;

    // Root of subdomain → rewrite to public profile page
    if (pathname === "/" || pathname === "") {
      const url = request.nextUrl.clone();
      url.pathname = `/u/${username}`;
      return NextResponse.rewrite(url);
    }

    // Rewrite user1.endever.in/install-nginx → /s/user1/install-nginx
    const slug = pathname.startsWith("/") ? pathname.slice(1) : pathname;
    if (slug && !slug.includes("/") && !slug.startsWith("_next") && !slug.startsWith("api")) {
      const url = request.nextUrl.clone();
      url.pathname = `/s/${username}/${slug}`;
      return NextResponse.rewrite(url);
    }
  }

  // ── Auth guard (main domain only) ──────────────────────
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isProtected) {
    const hasSession = request.cookies
      .getAll()
      .some((c) => c.name.startsWith("auth_session") && c.value.length > 0);

    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match everything except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

