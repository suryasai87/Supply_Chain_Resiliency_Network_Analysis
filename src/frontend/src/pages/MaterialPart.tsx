import { motion } from 'framer-motion'
import { Package, Search, Filter, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import BipartiteGraph from '@/components/networks/BipartiteGraph'

// Mock data
const materials = [
  { id: 'MAT-001', name: 'Semiconductor IC Type A', centrality: 0.87, suppliers: 1, risk: 'critical', products: 12 },
  { id: 'MAT-045', name: 'Capacitor Array 100uF', centrality: 0.72, suppliers: 3, risk: 'medium', products: 8 },
  { id: 'MAT-023', name: 'PCB Substrate FR-4', centrality: 0.68, suppliers: 2, risk: 'high', products: 15 },
  { id: 'MAT-089', name: 'Aluminum Housing 6061', centrality: 0.54, suppliers: 5, risk: 'low', products: 6 },
  { id: 'MAT-112', name: 'Lithium Battery Cell', centrality: 0.49, suppliers: 2, risk: 'high', products: 4 },
]

export default function MaterialPart() {
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
          <h1 className="text-2xl font-bold text-foreground">Material-Part Analysis</h1>
          <p className="text-muted-foreground">
            Bipartite network analysis of material to part relationships
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search materials..."
            className="w-full pl-10 pr-4 py-2 bg-card border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm hover:bg-accent transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Visualization */}
        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-brand-teal" />
            Material-Part Bipartite Network
          </h2>

          <BipartiteGraph
            height="500px"
            leftLabel="Materials"
            rightLabel="Parts"
          />
        </div>

        {/* Material Criticality Ranking */}
        <div className="rounded-xl bg-card border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Criticality Ranking
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ranked by betweenness centrality
          </p>

          <div className="space-y-3">
            {materials.map((material, index) => (
              <motion.div
                key={material.id}
                className="p-4 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                    <h3 className="font-medium text-foreground">{material.id}</h3>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    `risk-${material.risk}`
                  )}>
                    {material.risk}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-3 truncate">
                  {material.name}
                </p>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Centrality</span>
                    <p className="font-semibold text-foreground">{material.centrality.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Suppliers</span>
                    <p className={cn(
                      "font-semibold",
                      material.suppliers === 1 ? "text-risk-critical" : "text-foreground"
                    )}>{material.suppliers}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Products</span>
                    <p className="font-semibold text-foreground">{material.products}</p>
                  </div>
                </div>

                {/* Centrality bar */}
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-teal rounded-full"
                      style={{ width: `${material.centrality * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* What-If Scenario */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          What-If Disruption Scenario
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Material
            </label>
            <select className="w-full px-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Choose material...</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Disruption Level
            </label>
            <select className="w-full px-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="25">25% Reduction</option>
              <option value="50">50% Reduction</option>
              <option value="75">75% Reduction</option>
              <option value="100">100% (Complete Loss)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Duration
            </label>
            <select className="w-full px-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Simulate Impact
            </button>
          </div>
        </div>

        {/* Impact Preview */}
        <div className="mt-6 p-4 rounded-lg bg-background border border-border">
          <h3 className="font-medium text-foreground mb-3">Impact Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-risk-critical/10 border border-risk-critical/20">
              <p className="text-2xl font-bold text-risk-critical">12</p>
              <p className="text-sm text-muted-foreground">Products Affected</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-risk-high/10 border border-risk-high/20">
              <p className="text-2xl font-bold text-risk-high">$2.3M</p>
              <p className="text-sm text-muted-foreground">Revenue at Risk</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-risk-low/10 border border-risk-low/20">
              <p className="text-2xl font-bold text-risk-low">3</p>
              <p className="text-sm text-muted-foreground">Alt. Suppliers Available</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
