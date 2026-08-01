import type { ReactNode } from "react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DashboardSectionProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

/** Shared card shell for dashboard panels: title/description header + action slot + body. */
export function DashboardSection({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: DashboardSectionProps) {
  return (
    <Card className={cn("h-full gap-4", className)}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className={cn("flex-1", contentClassName)}>{children}</CardContent>
    </Card>
  )
}
