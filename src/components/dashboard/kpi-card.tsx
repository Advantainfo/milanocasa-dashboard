import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: "default" | "amber"
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <p
            className={cn(
              "truncate text-2xl font-semibold tracking-tight",
              tone === "amber" && "text-amber-600 dark:text-amber-500"
            )}
          >
            {value}
          </p>
          {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
        </div>
        <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  )
}
