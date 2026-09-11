import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ikere-waste-system-jwt-secret-key-2026-super-secure"
);

interface TokenPayload {
  userId: string;
  email: string;
  role: "RESIDENT" | "ADMIN" | "CREW";
  name: string;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;

  let user: TokenPayload | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload as unknown as TokenPayload;
    } catch {
      user = null;
    }
  }

  // Redirect logged-in users to their dashboard
  if (pathname === "/") {
    if (user) {
      if (user.role === "ADMIN" || user.role === "CREW") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Auth pages (login, register)
  if (pathname === "/login" || pathname === "/register") {
    if (user) {
      if (user.role === "ADMIN" || user.role === "CREW") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "ADMIN" && user.role !== "CREW") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Resident dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/dashboard/:path*", "/login", "/register"],
};
