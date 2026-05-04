import { type NextRequest, NextResponse } from "next/server";
import { verifyLpAdminCookie } from "@/lib/adminSession";

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function isPublicAdminPath(pathname: string): boolean {
  const p = normalizePath(pathname);
  return p === "/admin" || p === "/api/admin/login";
}

/** Checkout must stay public; admin order list uses GET on the same path. */
function isPublicOrdersApi(pathname: string, method: string): boolean {
  return normalizePath(pathname) === "/api/orders" && (method === "POST" || method === "OPTIONS");
}

export async function proxy(request: NextRequest) {
  const pathname = normalizePath(request.nextUrl.pathname);
  const method = request.method;

  if (isPublicAdminPath(pathname)) {
    return NextResponse.next();
  }

  if (isPublicOrdersApi(pathname, method)) {
    return NextResponse.next();
  }

  const requiresAdminAuth =
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/") ||
    pathname === "/api/orders";

  if (!requiresAdminAuth) {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    if (pathname.startsWith("/api/admin") || pathname === "/api/orders") {
      return NextResponse.json(
        { error: "Server is not configured for admin access." },
        { status: 503 }
      );
    }
    return new NextResponse("Admin access is not configured.", { status: 503 });
  }

  const ok = await verifyLpAdminCookie(request.cookies, adminPassword);
  if (ok) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin") || pathname === "/api/orders") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*", "/api/orders"],
};
