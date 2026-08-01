"use client"

import type { LucideIcon } from "lucide-react"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { AnimatedNumber } from "@/components/dashboard/animated-number"

export interface KpiTrend {
  direction: "up" | "down" | "flat"
  label: string
}

interface KpiCardProps {
  label: string
  value: number
  formatValue?: (value: number) => string
  hint?: string
  icon: LucideIcon
  tone?: "default" | "amber"
  trend?: KpiTrend
}

const TREND_STYLES: Record<KpiTrend["direction"], { icon: LucideIcon; className: string }> = {
  up: { icon: TrendingUp, className: "text-emerald-600 dark:text-emerald-400" },
  down: { icon: TrendingDown, className: "text-amber-600 dark:text-amber-400" },
  flat: { icon: Minus, className: "text-muted-foreground" },
}

export function KpiCard({
  label,
  value,
  formatValue = (n) => String(Math.round(n)),
  hint,
  icon: Icon,
  tone = "default",
  trend,
}: KpiCardProps) {
  const TrendIcon = trend ? TREND_STYLES[trend.direction].icon : null

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="h-full"
    >
      <Card className="glow-primary hover:ring-primary/40 h-full transition-shadow duration-300 hover:shadow-[0_0_36px_-18px_var(--primary)]">
        <CardContent className="flex h-full flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-muted-foreground min-w-0 text-xs font-medium tracking-wide uppercase">
              {label}
            </p>
            <div className="bg-primary/10 text-primary ring-primary/30 flex size-9 shrink-0 items-center justify-center rounded-lg ring-1">
              <Icon className="size-4" />
            </div>
          </div>

          <div className="space-y-1">
            <AnimatedNumber
              value={value}
              formatFn={formatValue}
              className={cn(
                "block truncate font-mono text-2xl font-semibold tracking-tight tabular-nums",
                tone === "amber"
                  ? "text-amber-500 [text-shadow:0_0_18px_rgba(245,158,11,0.5)]"
                  : "text-glow-primary"
              )}
            />
            <div className="flex items-center gap-2">
              {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
              {trend && TrendIcon && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-medium",
                    TREND_STYLES[trend.direction].className
                  )}
                >
                  <TrendIcon className="size-3" />
                  {trend.label}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
