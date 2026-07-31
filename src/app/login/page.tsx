import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { decryptSession, SESSION_COOKIE_NAME } from "@/lib/auth/session"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = { title: "Sign in | Milano Casa" }

export default async function LoginPage() {
  const cookieStore = await cookies()
  const session = await decryptSession(cookieStore.get(SESSION_COOKIE_NAME)?.value)

  if (session?.userId) {
    redirect("/dashboard")
  }

  return (
    <main className="bg-background relative flex min-h-svh items-center justify-center overflow-hidden p-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 35%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklch, var(--primary) 60%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklch, var(--primary) 60%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <LoginForm />
    </main>
  )
}
