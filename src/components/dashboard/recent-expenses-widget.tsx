import { Receipt } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityRow } from "@/components/dashboard/activity-row"
import { formatCurrency, formatDate } from "@/lib/format"
import type { RecentExpense } from "@/server/repositories/dashboard.repo"
import { getServerDictionary } from "@/lib/i18n/get-dictionary"

interface RecentExpensesWidgetProps {
  expenses: RecentExpense[]
  bare?: boolean
}

export async function RecentExpensesWidget({
  expenses,
  bare = false,
}: RecentExpensesWidgetProps) {
  const { dictionary: dict } = await getServerDictionary()

  const list =
    expenses.length === 0 ? (
      <p className="text-muted-foreground text-sm">{dict.dashboard.widgets.noExpensesYet}</p>
    ) : (
      <div className="divide-y">
        {expenses.map((expense) => (
          <ActivityRow
            key={expense.id}
            icon={Receipt}
            title={expense.supplier || dict.statuses.expenseCategory[expense.category]}
            subtitle={dict.statuses.expenseCategory[expense.category]}
            trailing={
              <div className="text-right">
                <p className="font-medium">{formatCurrency(expense.amount)}</p>
                <p className="text-muted-foreground text-xs">
                  {formatDate(expense.expenseDate)}
                </p>
              </div>
            }
          />
        ))}
      </div>
    )

  if (bare) return list

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{dict.dashboard.widgets.recentExpenses}</CardTitle>
      </CardHeader>
      <CardContent>{list}</CardContent>
    </Card>
  )
}
