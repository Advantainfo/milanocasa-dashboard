"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/components/layout/nav-config"
import { LogoMark } from "@/components/brand/logo-mark"
import { useDictionary } from "@/lib/i18n/dictionary-provider"

function isItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface SidebarNavProps {
  /** Distinct layoutId per rendering surface (desktop vs. mobile sheet) so
   *  framer-motion doesn't try to animate the pill between two DOM trees. */
  layoutId: string
  onNavigate?: () => void
}

export function SidebarNav({ layoutId, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const dict = useDictionary()

  return (
    <>
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="bg-primary/10 ring-primary/40 glow-primary text-primary flex size-8 items-center justify-center rounded-lg ring-1">
          <LogoMark className="size-5" />
        </div>
        <span className="text-base font-semibold tracking-tight">
          Milano Casa
          <span className="text-primary text-glow-primary animate-pulse motion-reduce:animate-none">
            _
          </span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon

          if (item.status === "soon") {
            return (
              <div
                key={item.href}
                className="text-sidebar-foreground/40 flex items-center gap-3 rounded-lg px-3 py-2 text-sm"
              >
                <Icon className="size-4" />
                <span className="flex-1">{dict.nav[item.key]}</span>
                <span className="text-[10px] font-medium tracking-wide uppercase">
                  {dict.nav.soon}
                </span>
              </div>
            )
          }

          const active = isItemActive(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId={layoutId}
                  className="bg-sidebar-accent ring-primary/40 absolute inset-0 rounded-lg shadow-[0_0_16px_-4px_var(--primary)] ring-1"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon className="relative size-4" />
              <span className="relative">{dict.nav[item.key]}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
