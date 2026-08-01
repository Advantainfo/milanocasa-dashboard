"use client"

import type { LucideIcon } from "lucide-react"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import type { CSSProperties, ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatCurrency, formatNumber } from "@/lib/format"
import { AnimatedNumber } from "@/components/dashboard/animated-number"

export interface KpiTrend {
  direction: "up" | "down" | "flat"
  label: string
}

interface KpiCardProps {
  label: string
  value: number
  /** Serializable format kind - server components can't pass formatter
   *  functions to this client component, so the value is resolved here. */
  format?: "currency" | "number"
  hint?: string
  /** Pass a rendered icon element (e.g. `<TrendingUp className="size-4" />`),
   *  not a component reference - server components can't pass component
   *  references to this client component either, only rendered elements. */
  icon: ReactNode
  /** CSS color value for the icon chip, e.g. "var(--kpi-revenue)". Defaults
   *  to the app's primary accent. */
  color?: string
  tone?: "default" | "amber"
  trend?: KpiTrend
}

const FORMATTERS: Record<NonNullable<KpiCardProps["format"]>, (value: number) => string> = {
  currency: formatCurrency,
  number: (n) => formatNumber(Math.round(n)),
}

const TREND_STYLES: Record<KpiTrend["direction"], { icon: LucideIcon; className: string }> = {
  up: { icon: TrendingUp, className: "text-success" },
  down: { icon: TrendingDown, className: "text-warning" },
  flat: { icon: Minus, className: "text-muted-foreground" },
}

export function KpiCard({
  label,
  value,
  format = "number",
  hint,
  icon,
  color = "var(--primary)",
  tone = "default",
  trend,
}: KpiCardProps) {
  const TrendIcon = trend ? TREND_STYLES[trend.direction].icon : null
  const formatValue = FORMATTERS[format]

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
            <div
              className="bg-(--kpi-color)/10 text-(--kpi-color) ring-(--kpi-color)/30 flex size-9 shrink-0 items-center justify-center rounded-lg ring-1"
              style={{ "--kpi-color": color } as CSSProperties}
            >
              {icon}
            </div>
          </div>

          <div className="space-y-1">
            <AnimatedNumber
              value={value}
              formatFn={formatValue}
              className={cn(
                "block truncate font-mono text-2xl font-semibold tracking-tight tabular-nums",
                tone === "amber" ? "text-warning text-glow-warning" : "text-glow-primary"
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
