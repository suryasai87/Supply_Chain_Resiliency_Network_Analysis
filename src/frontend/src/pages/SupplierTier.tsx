import { motion } from 'framer-motion'
import { Layers, AlertTriangle } from 'lucide-react'

export default function SupplierTier() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Multi-Tier Supplier Network</h1>
        <p className="text-muted-foreground">
          Deep visibility into supplier tiers and hidden dependencies
        </p>
      </div>

      {/* Tier Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { tier: 'Tier 1', count: 156, risk: 12 },
          { tier: 'Tier 2', count: 423, risk: 34 },
          { tier: 'Tier 3', count: 268, risk: 28 },
          { tier: 'Hidden', count: 45, risk: 45 },
        ].map((t) => (
          <div key={t.tier} className="p-6 rounded-xl bg-card border border-border">
            <p className="text-sm text-muted-foreground">{t.tier} Suppliers</p>
            <p className="text-2xl font-bold text-foreground mt-1">{t.count}</p>
            <p className="text-sm text-risk-high mt-2">{t.risk} high risk</p>
          </div>
        ))}
      </div>

      {/* Network Visualization */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Multi-Tier Network Visualization
        </h2>
        <div className="h-[500px] rounded-lg bg-background border border-border flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Force-Directed Graph</p>
            <p className="text-sm">Tier 1 → Tier 2 → Tier 3 hierarchy</p>
          </div>
        </div>
      </div>

      {/* Hidden Dependencies */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Hidden Dependencies Detected
        </h2>
        <div className="space-y-3">
          {[
            { name: 'Tier-2 Supplier XYZ', impact: '45% of Tier-1 suppliers depend on this single source', severity: 'critical' },
            { name: 'Rare Earth Minerals Co', impact: 'Supplies 67% of magnetic materials across all tiers', severity: 'high' },
            { name: 'Taiwan Chip Foundry', impact: 'Single source for 12 critical semiconductor components', severity: 'critical' },
          ].map((dep, i) => (
            <div key={i} className="p-4 rounded-lg bg-background border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">{dep.name}</span>
                <span className={`risk-${dep.severity} risk-badge`}>{dep.severity}</span>
              </div>
              <p className="text-sm text-muted-foreground">{dep.impact}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
