import { useState } from 'react'
import { motion } from 'framer-motion'
import { Network, Play, Download, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MaxFlow() {
  const [source, setSource] = useState('')
  const [sink, setSink] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    // Simulate analysis
    setTimeout(() => setIsAnalyzing(false), 2000)
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Max-Flow Analysis</h1>
        <p className="text-muted-foreground">
          Edmonds-Karp algorithm for supply chain capacity bottleneck analysis
        </p>
      </div>

      {/* Controls */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Analysis Parameters</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Source Node
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select supplier...</option>
              <option value="SUPP-001">SUPP-001 - Acme Electronics</option>
              <option value="SUPP-002">SUPP-002 - Global Components</option>
              <option value="SUPP-003">SUPP-003 - Pacific Materials</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sink Node
            </label>
            <select
              value={sink}
              onChange={(e) => setSink(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select customer...</option>
              <option value="CUST-001">CUST-001 - TechCorp Inc</option>
              <option value="CUST-002">CUST-002 - Manufacturing Co</option>
              <option value="CUST-003">CUST-003 - Industrial Systems</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAnalyze}
              disabled={!source || !sink || isAnalyzing}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Max-Flow</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Visualization */}
        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Network className="w-5 h-5 text-brand-teal" />
              Flow Network Visualization
            </h2>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-accent transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="h-[500px] rounded-lg bg-background border border-border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Max-Flow Network</p>
              <p className="text-sm mt-2">
                Select source and sink nodes to visualize<br />
                the maximum flow path
              </p>
              <div className="mt-4 p-4 rounded-lg bg-card border border-border inline-block text-left">
                <p className="text-xs font-mono">
                  <span className="text-brand-teal">// Edmonds-Karp Algorithm</span><br />
                  <span className="text-foreground">while augmenting_path_exists:</span><br />
                  <span className="text-muted-foreground ml-4">find_path_bfs(source, sink)</span><br />
                  <span className="text-muted-foreground ml-4">update_residual_graph()</span><br />
                  <span className="text-muted-foreground ml-4">max_flow += bottleneck</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {/* Max Flow Result */}
          <div className="rounded-xl bg-card border border-border p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Maximum Flow</h3>
            <div className="text-3xl font-bold text-foreground">
              {source && sink ? '5,420' : '--'}
              <span className="text-lg font-normal text-muted-foreground ml-2">units/day</span>
            </div>
          </div>

          {/* Bottlenecks */}
          <div className="rounded-xl bg-card border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Bottleneck Edges
            </h3>

            {source && sink ? (
              <div className="space-y-3">
                {[
                  { from: 'MAT-012', to: 'PROD-001', capacity: 2000, utilization: 100 },
                  { from: 'SUPP-002', to: 'MAT-012', capacity: 1500, utilization: 95 },
                  { from: 'MAT-045', to: 'PROD-003', capacity: 3000, utilization: 87 },
                ].map((edge, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-background border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {edge.from} → {edge.to}
                      </span>
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        edge.utilization === 100
                          ? "bg-risk-critical/20 text-risk-critical"
                          : edge.utilization >= 90
                            ? "bg-risk-high/20 text-risk-high"
                            : "bg-risk-medium/20 text-risk-medium"
                      )}>
                        {edge.utilization}% utilized
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          edge.utilization === 100
                            ? "bg-risk-critical"
                            : edge.utilization >= 90
                              ? "bg-risk-high"
                              : "bg-risk-medium"
                        )}
                        style={{ width: `${edge.utilization}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Capacity: {edge.capacity.toLocaleString()} units/day
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Run analysis to identify bottlenecks
              </p>
            )}
          </div>

          {/* Recommendations */}
          <div className="rounded-xl bg-card border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Recommendations
            </h3>

            {source && sink ? (
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="font-medium text-foreground">Increase MAT-012 capacity</p>
                  <p className="text-muted-foreground mt-1">
                    Add secondary supplier to increase throughput by 30%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border">
                  <p className="font-medium text-foreground">Optimize SUPP-002 logistics</p>
                  <p className="text-muted-foreground mt-1">
                    Reduce lead time from 14 to 10 days
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Run analysis to see recommendations
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
