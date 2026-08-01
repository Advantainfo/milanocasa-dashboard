"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config"
import { useLocale } from "@/lib/i18n/dictionary-provider"
import { setLocale } from "@/server/actions/locale"

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSelect(next: (typeof LOCALES)[number]) {
    if (next === locale) return
    startTransition(async () => {
      await setLocale(next)
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Change language"
          disabled={isPending}
        >
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((code) => (
          <DropdownMenuItem
            key={code}
            onSelect={() => handleSelect(code)}
            className={code === locale ? "font-semibold" : undefined}
          >
            {LOCALE_LABELS[code]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
