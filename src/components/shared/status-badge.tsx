import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const VARIANT_CLASSES = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  positive: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
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
        "border-transparent font-medium",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {label}
    </Badge>
  )
}
