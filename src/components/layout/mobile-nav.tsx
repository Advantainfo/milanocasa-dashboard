"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { useDictionary } from "@/lib/i18n/dictionary-provider"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const dict = useDictionary()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={dict.nav.openMenu}
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 px-4 py-6">
        <SheetTitle className="sr-only">{dict.nav.navigation}</SheetTitle>
        <SidebarNav
          layoutId="sidebar-active-pill-mobile"
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
