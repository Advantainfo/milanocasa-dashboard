import { formatDate } from "@/lib/format"

export default function DashboardPage() {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
      <p className="text-muted-foreground text-sm">{formatDate(new Date())}</p>
    </div>
  )
}
