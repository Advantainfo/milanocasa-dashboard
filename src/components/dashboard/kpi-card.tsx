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
    <Card className="glow-primary">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            {label}
          </p>
          <p
            className={cn(
              "truncate font-mono text-2xl font-semibold tracking-tight tabular-nums",
              tone === "amber"
                ? "text-amber-500 [text-shadow:0_0_18px_rgba(245,158,11,0.5)]"
                : "text-glow-primary"
            )}
          >
            {value}
          </p>
          {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
        </div>
        <div className="bg-primary/10 text-primary ring-primary/30 flex size-9 shrink-0 items-center justify-center rounded-lg ring-1">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  )
}
