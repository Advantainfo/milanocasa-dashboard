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
  label: string
  href: string
  icon: LucideIcon
  status: "active" | "soon"
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, status: "active" },
  { label: "Customers", href: "/customers", icon: Users, status: "active" },
  { label: "Orders", href: "/orders", icon: ShoppingCart, status: "active" },
  { label: "Payments", href: "/payments", icon: Wallet, status: "active" },
  { label: "Expenses", href: "/expenses", icon: Receipt, status: "active" },
  { label: "Reports", href: "/reports", icon: FileBarChart, status: "soon" },
  { label: "Settings", href: "/settings", icon: Settings, status: "soon" },
]
