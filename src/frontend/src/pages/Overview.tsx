import { motion } from 'framer-motion'
import {
  AlertTriangle,
  TrendingUp,
  Package,
  Building2,
  Globe,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { cn, formatNumber, formatCurrency } from '@/lib/utils'
import SupplyChainMap from '@/components/maps/SupplyChainMap'

// Mock data - will be replaced with API calls
const kpiData = [
  {
    title: 'Resiliency Score',
    value: 72,
    suffix: '/100',
    change: +5,
    icon: Activity,
    color: 'from-brand-teal to-emerald-600',
    description: 'Overall supply chain health'
  },
  {
    title: 'Active Suppliers',
    value: 847,
    change: +12,
    icon: Building2,
    color: 'from-blue-500 to-blue-600',
    description: 'Across all tiers'
  },
  {
    title: 'Critical Materials',
    value: 23,
    change: -3,
    icon: Package,
    color: 'from-amber-500 to-orange-600',
    description: 'Single-sourced items'
  },
  {
    title: 'Tariff Exposure',
    value: 45200000,
    prefix: '$',
    change: +8,
    icon: Globe,
    color: 'from-purple-500 to-purple-600',
    description: 'Annual tariff impact'
  }
]

const riskAlerts = [
  {
    id: 1,
    severity: 'critical',
    title: 'Single-Source Supplier Risk',
    description: 'MAT-023 (Semiconductor IC) has only 1 qualified supplier',
    timestamp: '2 hours ago',
    affected: '12 products'
  },
  {
    id: 2,
    severity: 'high',
    title: 'Tariff Increase Alert',
    description: 'China Section 301 tariffs increased to 35% on electronics',
    timestamp: '5 hours ago',
    affected: '47 materials'
  },
  {
    id: 3,
    severity: 'medium',
    title: 'Lead Time Variance',
    description: 'Supplier SUPP-089 showing 15-day delivery delays',
    timestamp: '1 day ago',
    affected: '8 materials'
  },
  {
    id: 4,
    severity: 'low',
    title: 'Alternative Supplier Qualified',
    description: 'New backup supplier approved for MAT-045',
    timestamp: '2 days ago',
    affected: '1 material'
  }
]

const networkStats = [
  { label: 'Tier 1 Suppliers', value: 156, change: '+3' },
  { label: 'Tier 2 Suppliers', value: 423, change: '+12' },
  { label: 'Tier 3 Suppliers', value: 268, change: '+5' },
  { label: 'Total Materials', value: 1247, change: '+28' },
  { label: 'Products', value: 89, change: '0' },
  { label: 'Countries', value: 34, change: '+1' },
]

export default function Overview() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
          <p className="text-muted-foreground">
            Real-time supply chain resiliency monitoring
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Live data</span>
          <span className="text-foreground/50">|</span>
          <span>Last updated: 2 min ago</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            className="group relative p-6 rounded-xl bg-card border border-border overflow-hidden kpi-glow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            {/* Background gradient */}
            <div className={cn(
              "absolute inset-0 opacity-5 bg-gradient-to-br",
              kpi.color
            )} />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                  kpi.color
                )}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  kpi.change >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {kpi.change >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{Math.abs(kpi.change)}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-3xl font-bold text-foreground">
                  {kpi.prefix}
                  {kpi.title === 'Tariff Exposure'
                    ? formatCurrency(kpi.value).replace('$', '')
                    : formatNumber(kpi.value)
                  }
                  {kpi.suffix}
                </p>
                <p className="text-xs text-muted-foreground">{kpi.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Alerts */}
        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Risk Alerts
            </h2>
            <button className="text-sm text-primary hover:underline">
              View all
            </button>
          </div>

          <div className="space-y-3">
            {riskAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                className="p-4 rounded-lg bg-background border border-border hover:border-border/80 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                    alert.severity === 'critical' && "bg-risk-critical",
                    alert.severity === 'high' && "bg-risk-high",
                    alert.severity === 'medium' && "bg-risk-medium",
                    alert.severity === 'low' && "bg-risk-low",
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-foreground truncate">
                        {alert.title}
                      </h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        `risk-${alert.severity}`
                      )}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{alert.timestamp}</span>
                      <span>•</span>
                      <span>{alert.affected}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Network Statistics */}
        <div className="rounded-xl bg-card border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-brand-teal" />
            Network Overview
          </h2>

          <div className="space-y-4">
            {networkStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {formatNumber(stat.value)}
                  </span>
                  {stat.change !== '0' && (
                    <span className={cn(
                      "text-xs",
                      stat.change.startsWith('+') ? "text-green-500" : "text-red-500"
                    )}>
                      {stat.change}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Resiliency Gauge */}
          <div className="mt-6 p-4 rounded-lg bg-background border border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Overall Resiliency</p>
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted/20"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${72 * 3.51} ${100 * 3.51}`}
                    className="text-brand-teal transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-foreground">72</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <p className={cn(
                "mt-2 text-sm font-medium",
                "text-amber-500"
              )}>
                Moderate Risk
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Supply Chain Map */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Global Supply Chain Map
        </h2>
        <SupplyChainMap
          height="400px"
          showFlows={true}
        />
      </div>
    </motion.div>
  )
}
