import { motion } from 'framer-motion'
import { Truck, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SupplierProduct() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Supplier-Product Analysis</h1>
        <p className="text-muted-foreground">
          End-to-end dependency analysis from suppliers to products
        </p>
      </div>

      {/* Sankey Diagram */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Supply Flow Diagram
        </h2>
        <div className="h-[500px] rounded-lg bg-background border border-border flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Truck className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Sankey Diagram</p>
            <p className="text-sm">Supplier → Material → Product flow</p>
          </div>
        </div>
      </div>

      {/* Product Risk Table */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Product Risk Scorecard
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Suppliers</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Single-Source</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Materials</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'PROD-001', name: 'Controller Unit X1', suppliers: 3, singleSource: 2, materials: 15, risk: 82 },
                { id: 'PROD-002', name: 'Sensor Module A', suppliers: 7, singleSource: 0, materials: 8, risk: 23 },
                { id: 'PROD-003', name: 'Power Supply Unit', suppliers: 2, singleSource: 4, materials: 12, risk: 94 },
                { id: 'PROD-004', name: 'Display Assembly', suppliers: 5, singleSource: 1, materials: 10, risk: 45 },
                { id: 'PROD-005', name: 'Battery Pack', suppliers: 2, singleSource: 3, materials: 6, risk: 78 },
              ].map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-accent/50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-foreground">{product.id}</p>
                    <p className="text-sm text-muted-foreground">{product.name}</p>
                  </td>
                  <td className="py-3 px-4 text-foreground">{product.suppliers}</td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      "font-medium",
                      product.singleSource > 2 ? "text-risk-critical" :
                      product.singleSource > 0 ? "text-risk-medium" : "text-risk-low"
                    )}>
                      {product.singleSource} materials
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground">{product.materials}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            product.risk >= 70 ? "bg-risk-critical" :
                            product.risk >= 50 ? "bg-risk-high" :
                            product.risk >= 30 ? "bg-risk-medium" : "bg-risk-low"
                          )}
                          style={{ width: `${product.risk}%` }}
                        />
                      </div>
                      <span className={cn(
                        "text-sm font-bold",
                        product.risk >= 70 ? "text-risk-critical" :
                        product.risk >= 50 ? "text-risk-high" :
                        product.risk >= 30 ? "text-risk-medium" : "text-risk-low"
                      )}>{product.risk}</span>
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
