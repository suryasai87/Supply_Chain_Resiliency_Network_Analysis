import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Network,
  Package,
  Building2,
  DollarSign,
  Truck,
  Layers,
  Lightbulb,
  FileText,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Command Center' },
  { path: '/max-flow', icon: Network, label: 'Max-Flow Analysis' },
  { path: '/material-part', icon: Package, label: 'Material-Part' },
  { path: '/supplier-material', icon: Building2, label: 'Supplier-Material' },
  { path: '/tariff-material', icon: DollarSign, label: 'Tariff-Material' },
  { path: '/supplier-product', icon: Truck, label: 'Supplier-Product' },
  { path: '/supplier-tier', icon: Layers, label: 'Multi-Tier Network' },
  { path: '/recommendations', icon: Lightbulb, label: 'Recommendations' },
  { path: '/executive-briefing', icon: FileText, label: 'Executive Briefing' },
]

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <motion.aside
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col",
        "transition-all duration-300 ease-in-out"
      )}
      animate={{ width: collapsed ? 72 : 260 }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <motion.div
          className="flex items-center gap-3"
          animate={{ opacity: collapsed ? 0 : 1 }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-teal to-brand-teal/60 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-foreground whitespace-nowrap">
              Supply Chain AI
            </span>
          )}
        </motion.div>

        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "hover:bg-accent group relative",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />

              {!collapsed && (
                <motion.span
                  className="text-sm font-medium whitespace-nowrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {item.label}
                </motion.span>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {!collapsed && (
          <motion.div
            className="text-xs text-muted-foreground text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Powered by Databricks
          </motion.div>
        )}
      </div>
    </motion.aside>
  )
}
