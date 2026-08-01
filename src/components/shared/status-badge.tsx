import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Hues stay fixed regardless of theme (status colors are reserved meaning,
// never restyled to match a brand palette) - sourced from the centralized
// theme tokens in globals.css, which are already theme-resolved (no dark:
// variant needed).
const VARIANT_CLASSES = {
  neutral: "bg-muted text-muted-foreground ring-muted-foreground/20",
  info: "bg-(--kpi-orders)/15 text-(--kpi-orders) ring-(--kpi-orders)/30",
  warning: "bg-warning/15 text-warning ring-warning/30",
  success: "bg-success/15 text-success ring-success/30",
  positive: "bg-violet/15 text-violet ring-violet/30",
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
