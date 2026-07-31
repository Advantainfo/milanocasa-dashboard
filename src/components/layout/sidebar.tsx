"use client"

import { SidebarNav } from "@/components/layout/sidebar-nav"

export function Sidebar() {
  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden w-64 shrink-0 flex-col border-r px-4 py-6 md:flex">
      <SidebarNav layoutId="sidebar-active-pill-desktop" />
    </aside>
  )
}
