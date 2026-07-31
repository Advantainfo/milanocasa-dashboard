"use client"

import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { NAV_ITEMS } from "@/components/layout/nav-config"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import { logout } from "@/server/actions/auth"

function isItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Topbar() {
  const pathname = usePathname()
  const currentItem = NAV_ITEMS.find((item) => isItemActive(pathname, item.href))

  return (
    <header className="bg-background/80 sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b px-6 backdrop-blur">
      <h1 className="text-lg font-semibold tracking-tight">
        {currentItem?.label ?? "Milano Casa"}
      </h1>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <form action={logout}>
          <Button variant="ghost" size="icon" type="submit" aria-label="Sign out">
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  )
}
