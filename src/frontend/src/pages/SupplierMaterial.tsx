import { motion } from 'framer-motion'
import { Building2, MapPin, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import NetworkGraph from '@/components/networks/NetworkGraph'
import SupplyChainMap from '@/components/maps/SupplyChainMap'

export default function SupplierMaterial() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Supplier-Material Analysis</h1>
        <p className="text-muted-foreground">
          Risk matrix and geographic concentration analysis
        </p>
      </div>

      {/* Risk Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-risk-critical/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-risk-critical" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">23</p>
              <p className="text-sm text-muted-foreground">Single-Sourced Items</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-risk-high/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-risk-high" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-sm text-muted-foreground">High Geographic Risk</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-risk-medium/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-risk-medium" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">7</p>
              <p className="text-sm text-muted-foreground">Lead Time Critical</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Network */}
        <div className="rounded-xl bg-card border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Supplier Network Projection
          </h2>
          <NetworkGraph
            nodes={[
              { id: 's1', label: 'Acme Electronics', type: 'supplier', risk: 'critical' },
              { id: 's2', label: 'Global Components', type: 'supplier', risk: 'high' },
              { id: 's3', label: 'Pacific Materials', type: 'supplier', risk: 'medium' },
              { id: 's4', label: 'Euro Parts', type: 'supplier', risk: 'low' },
              { id: 's5', label: 'US Components', type: 'supplier', risk: 'low' },
              { id: 'm1', label: 'Semiconductor IC', type: 'material', risk: 'critical' },
              { id: 'm2', label: 'PCB Substrate', type: 'material', risk: 'high' },
              { id: 'm3', label: 'Capacitors', type: 'material', risk: 'medium' },
              { id: 'm4', label: 'Housing', type: 'material', risk: 'low' },
            ]}
            edges={[
              { source: 's1', target: 'm1', weight: 100 },
              { source: 's1', target: 'm2', weight: 60 },
              { source: 's2', target: 'm2', weight: 80 },
              { source: 's2', target: 'm3', weight: 70 },
              { source: 's3', target: 'm3', weight: 50 },
              { source: 's3', target: 'm4', weight: 40 },
              { source: 's4', target: 'm4', weight: 60 },
              { source: 's5', target: 'm1', weight: 30 },
            ]}
            height="400px"
            layout="fcose"
          />
        </div>

        {/* Geographic Map */}
        <div className="rounded-xl bg-card border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Geographic Concentration
          </h2>
          <SupplyChainMap
            height="400px"
            showFlows={false}
          />
        </div>
      </div>

      {/* Risk Matrix Table */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Supplier Risk Matrix
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Supplier</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Materials</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Lead Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'SUPP-001', name: 'Acme Electronics', materials: 15, location: 'China', leadTime: 45, risk: 78 },
                { id: 'SUPP-002', name: 'Global Components', materials: 8, location: 'Taiwan', leadTime: 30, risk: 65 },
                { id: 'SUPP-003', name: 'Pacific Materials', materials: 12, location: 'Vietnam', leadTime: 35, risk: 52 },
                { id: 'SUPP-004', name: 'Euro Parts GmbH', materials: 6, location: 'Germany', leadTime: 21, risk: 28 },
                { id: 'SUPP-005', name: 'US Components Inc', materials: 10, location: 'USA', leadTime: 14, risk: 22 },
              ].map((supplier) => (
                <tr key={supplier.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-foreground">{supplier.id}</p>
                      <p className="text-sm text-muted-foreground">{supplier.name}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-foreground">{supplier.materials}</td>
                  <td className="py-3 px-4 text-foreground">{supplier.location}</td>
                  <td className="py-3 px-4 text-foreground">{supplier.leadTime} days</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            supplier.risk >= 70 ? "bg-risk-critical" :
                            supplier.risk >= 50 ? "bg-risk-high" :
                            supplier.risk >= 30 ? "bg-risk-medium" : "bg-risk-low"
                          )}
                          style={{ width: `${supplier.risk}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">{supplier.risk}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
