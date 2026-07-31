import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/format"
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants"
import type { RecentExpense } from "@/server/repositories/dashboard.repo"

export function RecentExpensesWidget({ expenses }: { expenses: RecentExpense[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-muted-foreground text-sm">No expenses yet.</p>
        ) : (
          <div className="divide-y">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {expense.supplier || EXPENSE_CATEGORY_LABELS[expense.category]}
                  </p>
                  <p className="text-muted-foreground truncate">
                    {EXPENSE_CATEGORY_LABELS[expense.category]}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-medium">{formatCurrency(expense.amount)}</p>
                  <p className="text-muted-foreground">
                    {formatDate(expense.expenseDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
