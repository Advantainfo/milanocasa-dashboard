import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { decryptSession, SESSION_COOKIE_NAME } from "@/lib/auth/session"

/**
 * Verifies the session cookie for the current request. Memoized per request
 * via React's cache() so calling it from a layout and again from a page or
 * server action doesn't re-verify the JWT multiple times.
 */
export const verifySession = cache(async (): Promise<{ userId: string }> => {
  const cookieStore = await cookies()
  const session = await decryptSession(cookieStore.get(SESSION_COOKIE_NAME)?.value)

  if (!session?.userId) {
    redirect("/login")
  }

  return { userId: session.userId }
})
