import { NextResponse, type NextRequest } from "next/server"
import { decryptSession, SESSION_COOKIE_NAME } from "@/lib/auth/session"

const PUBLIC_ROUTES = new Set(["/login"])

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicRoute = PUBLIC_ROUTES.has(pathname)

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = await decryptSession(token)
  const isAuthenticated = Boolean(session?.userId)

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// This is an optimistic, cookie-only check (no DB round trip) so it stays
// cheap on every navigation. Every dashboard layout/page and API route also
// re-verifies the session server-side — see src/lib/auth/dal.ts.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|.*\\.(?:png|svg|jpg|jpeg|webp|ico)$).*)",
  ],
}
