import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ActivityRowProps {
  icon: LucideIcon
  iconClassName?: string
  title: string
  subtitle?: string
  trailing?: ReactNode
  href?: string
}

/** Shared row layout (icon chip + title/subtitle + trailing content) for dashboard
 *  activity lists - keeps the 5 recent-activity widgets and the activity panel
 *  visually and structurally consistent. */
export function ActivityRow({
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  trailing,
  href,
}: ActivityRowProps) {
  const className =
    "hover:bg-muted/50 -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors"

  const content = (
    <>
      <div
        className={cn(
          "bg-primary/10 text-primary ring-primary/20 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1",
          iconClassName
        )}
      >
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{title}</p>
        {subtitle && <p className="text-muted-foreground truncate text-xs">{subtitle}</p>}
      </div>
      {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
