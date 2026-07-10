import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protect all routes (incl. API) except login, register, the NextAuth
// endpoints, and the public signup API. Data API routes were previously
// excluded via the bare `api` token and served PII/financials with no auth.
export const config = {
  matcher: [
    "/((?!login|register|api/auth|api/register|_next/static|_next/image|favicon.ico).*)",
  ],
};
