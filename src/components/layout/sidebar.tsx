"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/components/layout/nav-config"

function isItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden w-64 shrink-0 flex-col border-r px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm font-bold">
          M
        </div>
        <span className="text-base font-semibold tracking-tight">Milano Casa</span>
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
                <span className="flex-1">{item.label}</span>
                <span className="text-[10px] font-medium tracking-wide uppercase">
                  Soon
                </span>
              </div>
            )
          }

          const active = isItemActive(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="bg-sidebar-accent absolute inset-0 rounded-lg"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon className="relative size-4" />
              <span className="relative">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
