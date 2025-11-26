import { motion } from 'framer-motion'
import { Lightbulb, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

const recommendations = [
  {
    id: 1,
    priority: 'critical',
    title: 'Qualify backup supplier for MAT-023 (Semiconductor IC)',
    description: 'Single-source dependency creates unacceptable risk. Qualify SUPP-089 as secondary source.',
    impact: 'Reduces single-source risk by 45%',
    effort: 'Medium',
    roi: 2300000,
    status: 'pending'
  },
  {
    id: 2,
    priority: 'high',
    title: 'Relocate sourcing for tariff-exposed materials',
    description: 'Move 12 materials from China to Vietnam to reduce Section 301 tariff exposure.',
    impact: '$1.2M annual tariff savings',
    effort: 'High',
    roi: 1200000,
    status: 'in_progress'
  },
  {
    id: 3,
    priority: 'high',
    title: 'Increase safety stock for 7 critical materials',
    description: 'Build 30-day buffer inventory for high-risk items with long lead times.',
    impact: '30-day supply continuity buffer',
    effort: 'Low',
    roi: 850000,
    status: 'pending'
  },
  {
    id: 4,
    priority: 'medium',
    title: 'Renegotiate contracts with Tier-2 concentration',
    description: 'Diversify Tier-2 supplier base for magnetic materials category.',
    impact: 'Reduces hidden dependency risk by 35%',
    effort: 'Medium',
    roi: 500000,
    status: 'pending'
  },
  {
    id: 5,
    priority: 'medium',
    title: 'Implement dual-sourcing for battery cells',
    description: 'Qualify alternative battery supplier in South Korea.',
    impact: 'Ensures supply continuity for 4 products',
    effort: 'High',
    roi: 750000,
    status: 'completed'
  }
]

export default function Recommendations() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Strategic Recommendations</h1>
          <p className="text-muted-foreground">
            AI-generated actions to improve supply chain resiliency
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-card border border-border rounded-lg text-sm hover:bg-accent">
            Export PDF
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90">
            Create Jira Tickets
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">Total Actions</p>
          <p className="text-2xl font-bold text-foreground mt-1">{recommendations.length}</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">Critical Priority</p>
          <p className="text-2xl font-bold text-risk-critical mt-1">
            {recommendations.filter(r => r.priority === 'critical').length}
          </p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="text-2xl font-bold text-blue-500 mt-1">
            {recommendations.filter(r => r.status === 'in_progress').length}
          </p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">Total ROI Potential</p>
          <p className="text-2xl font-bold text-brand-teal mt-1">
            {formatCurrency(recommendations.reduce((sum, r) => sum + r.roi, 0))}
          </p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            className="rounded-xl bg-card border border-border p-6 hover:border-primary/30 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                rec.priority === 'critical' ? "bg-risk-critical/20" :
                rec.priority === 'high' ? "bg-risk-high/20" : "bg-risk-medium/20"
              )}>
                <Lightbulb className={cn(
                  "w-5 h-5",
                  rec.priority === 'critical' ? "text-risk-critical" :
                  rec.priority === 'high' ? "text-risk-high" : "text-risk-medium"
                )} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium uppercase",
                    `risk-${rec.priority}`
                  )}>
                    {rec.priority}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    rec.status === 'completed' ? "bg-green-500/20 text-green-500" :
                    rec.status === 'in_progress' ? "bg-blue-500/20 text-blue-500" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {rec.status === 'completed' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                    {rec.status === 'in_progress' && <Clock className="w-3 h-3 inline mr-1" />}
                    {rec.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">{rec.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>

                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Impact: </span>
                    <span className="font-medium text-foreground">{rec.impact}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Effort: </span>
                    <span className="font-medium text-foreground">{rec.effort}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ROI: </span>
                    <span className="font-medium text-brand-teal">{formatCurrency(rec.roi)}</span>
                  </div>
                </div>
              </div>

              <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
                Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
