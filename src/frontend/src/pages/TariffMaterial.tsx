import { motion } from 'framer-motion'
import { DollarSign, Globe, TrendingUp } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

export default function TariffMaterial() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tariff-Material Analysis</h1>
        <p className="text-muted-foreground">
          Tariff exposure and impact analysis with scenario modeling
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl bg-card border border-border">
          <DollarSign className="w-8 h-8 text-brand-teal mb-2" />
          <p className="text-2xl font-bold text-foreground">$45.2M</p>
          <p className="text-sm text-muted-foreground">Annual Tariff Exposure</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <Globe className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">47</p>
          <p className="text-sm text-muted-foreground">Affected Materials</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <TrendingUp className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">+18%</p>
          <p className="text-sm text-muted-foreground">YoY Tariff Increase</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <DollarSign className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">$8.3M</p>
          <p className="text-sm text-muted-foreground">Potential Savings</p>
        </div>
      </div>

      {/* Tariff Map and Scenario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tariff Heatmap */}
        <div className="rounded-xl bg-card border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Tariff Exposure by Country
          </h2>
          <div className="h-[400px] rounded-lg bg-background border border-border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Choropleth tariff heatmap</p>
            </div>
          </div>
        </div>

        {/* Scenario Modeling */}
        <div className="rounded-xl bg-card border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Tariff Scenario Modeling
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Country</label>
              <select className="w-full px-4 py-2 bg-background border border-input rounded-lg text-sm">
                <option>China</option>
                <option>Taiwan</option>
                <option>Vietnam</option>
                <option>Mexico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Rate Change</label>
              <select className="w-full px-4 py-2 bg-background border border-input rounded-lg text-sm">
                <option>+10%</option>
                <option>+25%</option>
                <option>+50%</option>
                <option>-10%</option>
              </select>
            </div>

            <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Simulate Impact
            </button>

            <div className="p-4 rounded-lg bg-background border border-border">
              <h3 className="font-medium text-foreground mb-3">Projected Impact</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Materials Affected</span>
                  <span className="font-medium text-foreground">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Additional Cost</span>
                  <span className="font-medium text-risk-critical">+$12.3M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alternative Suppliers</span>
                  <span className="font-medium text-risk-low">12 available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tariff Table */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Materials by Tariff Exposure
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Material</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Origin</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tariff Rate</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Annual Volume</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tariff Cost</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Alt. Source</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'MAT-001', name: 'Semiconductor IC', origin: 'China', rate: 25, volume: 5200000, cost: 1300000, alt: true },
                { id: 'MAT-023', name: 'PCB Substrate', origin: 'Taiwan', rate: 15, volume: 3400000, cost: 510000, alt: true },
                { id: 'MAT-045', name: 'Capacitor Array', origin: 'China', rate: 25, volume: 1800000, cost: 450000, alt: false },
                { id: 'MAT-089', name: 'Aluminum Housing', origin: 'China', rate: 10, volume: 2100000, cost: 210000, alt: true },
                { id: 'MAT-112', name: 'Battery Cell', origin: 'China', rate: 25, volume: 4500000, cost: 1125000, alt: false },
              ].map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-accent/50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-foreground">{item.id}</p>
                    <p className="text-sm text-muted-foreground">{item.name}</p>
                  </td>
                  <td className="py-3 px-4 text-foreground">{item.origin}</td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      item.rate >= 20 ? "bg-risk-critical/20 text-risk-critical" :
                      item.rate >= 10 ? "bg-risk-medium/20 text-risk-medium" :
                      "bg-risk-low/20 text-risk-low"
                    )}>
                      {item.rate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground">{formatCurrency(item.volume)}</td>
                  <td className="py-3 px-4 text-foreground font-medium">{formatCurrency(item.cost)}</td>
                  <td className="py-3 px-4">
                    {item.alt ? (
                      <span className="text-risk-low">Available</span>
                    ) : (
                      <span className="text-risk-critical">None</span>
                    )}
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
