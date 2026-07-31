"use server"

import { redirect } from "next/navigation"
import { query, queryOne } from "@/lib/db"
import { verifyPassword } from "@/lib/auth/password"
import { createSession, deleteSession } from "@/lib/auth/session"
import { loginSchema } from "@/lib/validation/auth"

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000
const GENERIC_ERROR = "Invalid email or password."

export interface LoginFormState {
  error?: string
}

interface UserRow {
  id: string
  password_hash: string
  failed_login_attempts: number
  locked_until: string | null
}

export async function login(
  _prevState: LoginFormState | undefined,
  formData: FormData
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: "Enter a valid email and password." }
  }

  const { email, password } = parsed.data

  const user = await queryOne<UserRow>(
    "SELECT id, password_hash, failed_login_attempts, locked_until FROM users WHERE email = $1",
    [email]
  )

  if (!user) {
    return { error: GENERIC_ERROR }
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const minutesLeft = Math.ceil(
      (new Date(user.locked_until).getTime() - Date.now()) / 60_000
    )
    return {
      error: `Too many failed attempts. Try again in ${minutesLeft} minute${
        minutesLeft === 1 ? "" : "s"
      }.`,
    }
  }

  const isValid = await verifyPassword(password, user.password_hash)

  if (!isValid) {
    const attempts = user.failed_login_attempts + 1
    const lockedUntil =
      attempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null

    await query(
      "UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3",
      [attempts, lockedUntil, user.id]
    )

    return { error: GENERIC_ERROR }
  }

  await query(
    "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1",
    [user.id]
  )

  await createSession(user.id)
  redirect("/dashboard")
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect("/login")
}
