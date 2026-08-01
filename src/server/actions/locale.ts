"use server"

import { cookies } from "next/headers"
import { LOCALE_COOKIE_NAME, isLocale, type Locale } from "@/lib/i18n/config"

export async function setLocale(locale: Locale): Promise<void> {
  if (!isLocale(locale)) return

  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  })
}
