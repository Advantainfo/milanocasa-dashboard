import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { decryptSession, SESSION_COOKIE_NAME } from "@/lib/auth/session"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage() {
  const cookieStore = await cookies()
  const session = await decryptSession(cookieStore.get(SESSION_COOKIE_NAME)?.value)

  if (session?.userId) {
    redirect("/dashboard")
  }

  return (
    <main className="from-background to-muted/40 flex min-h-svh items-center justify-center bg-gradient-to-b p-6">
      <LoginForm />
    </main>
  )
}
