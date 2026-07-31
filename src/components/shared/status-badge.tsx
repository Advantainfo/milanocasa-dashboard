import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Hues stay fixed regardless of theme (status colors are reserved meaning,
// never restyled to match a brand palette) - only the glow/ring treatment
// changes to fit the terminal aesthetic.
const VARIANT_CLASSES = {
  neutral: "bg-muted text-muted-foreground ring-muted-foreground/20",
  info: "bg-blue-500/15 text-blue-600 ring-blue-500/30 dark:text-blue-400",
  warning: "bg-amber-500/15 text-amber-600 ring-amber-500/30 dark:text-amber-400",
  success: "bg-emerald-500/15 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400",
  positive: "bg-violet-500/15 text-violet-600 ring-violet-500/30 dark:text-violet-400",
} as const

export type StatusBadgeVariant = keyof typeof VARIANT_CLASSES

interface StatusBadgeProps {
  label: string
  variant: StatusBadgeVariant
  className?: string
}

export function StatusBadge({ label, variant, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent font-medium ring-1",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {label}
    </Badge>
  )
}
