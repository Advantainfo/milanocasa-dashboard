"use client"

import { createContext, use } from "react"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { Locale } from "@/lib/i18n/config"

interface DictionaryContextValue {
  locale: Locale
  dictionary: Dictionary
}

const DictionaryContext = createContext<DictionaryContextValue | null>(null)

export function DictionaryProvider({
  locale,
  dictionary,
  children,
}: DictionaryContextValue & { children: React.ReactNode }) {
  return (
    <DictionaryContext.Provider value={{ locale, dictionary }}>
      {children}
    </DictionaryContext.Provider>
  )
}

function useDictionaryContext(): DictionaryContextValue {
  const ctx = use(DictionaryContext)
  if (!ctx) {
    throw new Error("useDictionary/useLocale must be used within a DictionaryProvider")
  }
  return ctx
}

export function useDictionary(): Dictionary {
  return useDictionaryContext().dictionary
}

export function useLocale(): Locale {
  return useDictionaryContext().locale
}
