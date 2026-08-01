import "server-only"

import { cookies } from "next/headers"
import { en } from "@/lib/i18n/dictionaries/en"
import { tr } from "@/lib/i18n/dictionaries/tr"
import { bg } from "@/lib/i18n/dictionaries/bg"
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isLocale, type Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"

const DICTIONARIES: Record<Locale, Dictionary> = { en, tr, bg }

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get(LOCALE_COOKIE_NAME)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
}

export async function getServerDictionary(): Promise<{ locale: Locale; dictionary: Dictionary }> {
  const locale = await getLocale()
  return { locale, dictionary: getDictionary(locale) }
}
