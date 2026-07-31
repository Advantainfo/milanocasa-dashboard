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
  { label: "Customers", href: "/customers", icon: Users, status: "soon" },
  { label: "Orders", href: "/orders", icon: ShoppingCart, status: "soon" },
  { label: "Payments", href: "/payments", icon: Wallet, status: "soon" },
  { label: "Expenses", href: "/expenses", icon: Receipt, status: "soon" },
  { label: "Reports", href: "/reports", icon: FileBarChart, status: "soon" },
  { label: "Settings", href: "/settings", icon: Settings, status: "soon" },
]
