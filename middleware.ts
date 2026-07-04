import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

const protectedPaths = [
  "/dashboard",
  "/courses",
  "/departments",
  "/academic-years",
  "/subjects",
  "/notices",
  "/routines",
  "/syllabus",
  "/questions",
  "/resources",
  "/student-requests",
  "/uploads",
];

function isProtectedPath(pathname: string) {
  return protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasToken = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (!hasToken && isProtectedPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/courses/:path*",
    "/departments/:path*",
    "/academic-years/:path*",
    "/subjects/:path*",
    "/notices/:path*",
    "/routines/:path*",
    "/syllabus/:path*",
    "/questions/:path*",
    "/resources/:path*",
    "/student-requests/:path*",
    "/uploads/:path*",
  ],
};
