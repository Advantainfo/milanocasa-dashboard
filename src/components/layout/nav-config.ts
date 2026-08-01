import {
  FileBarChart,
  LayoutDashboard,
  Receipt,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  key: "dashboard" | "customers" | "orders" | "payments" | "expenses" | "reports" | "settings"
  href: string
  icon: LucideIcon
  status: "active" | "soon"
}

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard, status: "active" },
  { key: "customers", href: "/customers", icon: Users, status: "active" },
  { key: "orders", href: "/orders", icon: ShoppingCart, status: "active" },
  { key: "payments", href: "/payments", icon: Wallet, status: "active" },
  { key: "expenses", href: "/expenses", icon: Receipt, status: "active" },
  { key: "reports", href: "/reports", icon: FileBarChart, status: "active" },
  { key: "settings", href: "/settings", icon: Settings, status: "active" },
]
