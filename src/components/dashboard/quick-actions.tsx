import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, ShoppingCart, Wallet, Receipt } from "lucide-react"
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog"
import { OrderFormDialog } from "@/components/orders/order-form-dialog"
import { PaymentFormDialog } from "@/components/payments/payment-form-dialog"
import { ExpenseFormDialog } from "@/components/expenses/expense-form-dialog"
import type { CustomerOption } from "@/server/repositories/customers.repo"
import type { OrderOption } from "@/server/repositories/orders.repo"

interface QuickActionsProps {
  customers: CustomerOption[]
  orders: OrderOption[]
}

export function QuickActions({ customers, orders }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <CustomerFormDialog
          mode="create"
          trigger={
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <UserPlus className="size-5" />
              Add Customer
            </Button>
          }
        />
        <OrderFormDialog
          mode="create"
          customers={customers}
          trigger={
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <ShoppingCart className="size-5" />
              New Order
            </Button>
          }
        />
        <PaymentFormDialog
          mode="create"
          orders={orders}
          trigger={
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Wallet className="size-5" />
              Record Payment
            </Button>
          }
        />
        <ExpenseFormDialog
          mode="create"
          trigger={
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Receipt className="size-5" />
              Add Expense
            </Button>
          }
        />
      </CardContent>
    </Card>
  )
}
