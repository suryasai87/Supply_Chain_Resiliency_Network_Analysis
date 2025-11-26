import { motion } from 'framer-motion'
import { FileText, Download, Mail, Calendar } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

export default function ExecutiveBriefing() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Executive Briefing</h1>
          <p className="text-muted-foreground">
            One-page summary for leadership review
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm hover:bg-accent">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm hover:bg-accent">
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90">
            <Calendar className="w-4 h-4" />
            Schedule Review
          </button>
        </div>
      </div>

      {/* Briefing Document */}
      <div className="rounded-xl bg-card border border-border p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b border-border">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-brand-teal" />
            <h2 className="text-2xl font-bold text-foreground">Supply Chain Resiliency Report</h2>
          </div>
          <p className="text-muted-foreground">Q4 2025 Assessment | Generated: November 26, 2025</p>
        </div>

        {/* Overall Score */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Overall Resiliency Assessment</h3>
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="none" className="text-muted/20" />
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="none" strokeDasharray={`${72 * 3.51} ${100 * 3.51}`} className="text-brand-teal" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-foreground">72</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-lg font-medium text-amber-500 mb-2">Moderate Risk</p>
              <p className="text-sm text-muted-foreground">
                Supply chain resiliency has improved 5% from last quarter but remains below target of 80.
                Key vulnerabilities in single-sourcing and tariff exposure require immediate attention.
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Key Risk Indicators</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Single-Sourced Materials', value: '23', status: 'critical' },
              { label: 'Tariff Exposure', value: '$45.2M', status: 'high' },
              { label: 'Geographic Concentration', value: '67%', status: 'medium' },
              { label: 'Active Suppliers', value: '847', status: 'low' },
            ].map((metric) => (
              <div key={metric.label} className="p-4 rounded-lg bg-background border border-border text-center">
                <p className={cn(
                  "text-2xl font-bold",
                  metric.status === 'critical' ? "text-risk-critical" :
                  metric.status === 'high' ? "text-risk-high" :
                  metric.status === 'medium' ? "text-risk-medium" : "text-foreground"
                )}>{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Issues */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Critical Issues Requiring Attention</h3>
          <div className="space-y-3">
            {[
              'MAT-023 (Semiconductor IC) has only 1 qualified supplier - qualifies as critical single-source risk',
              'China Section 301 tariffs increased to 35%, affecting 47 materials worth $45M annually',
              'Hidden Tier-2 dependency detected: 45% of Tier-1 suppliers depend on single rare earth supplier',
            ].map((issue, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-risk-critical/10 border border-risk-critical/20">
                <span className="w-6 h-6 rounded-full bg-risk-critical text-white text-sm flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground">{issue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recommended Actions (90-Day Plan)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Action</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Owner</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Due</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Impact</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { action: 'Qualify backup supplier for MAT-023', owner: 'Procurement', due: 'Dec 15', impact: '$2.3M risk avoided' },
                  { action: 'Relocate 12 materials to Vietnam', owner: 'Supply Chain', due: 'Jan 30', impact: '$1.2M tariff savings' },
                  { action: 'Build safety stock for critical items', owner: 'Operations', due: 'Dec 30', impact: '30-day buffer' },
                ].map((item, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-2 px-3 text-foreground">{item.action}</td>
                    <td className="py-2 px-3 text-muted-foreground">{item.owner}</td>
                    <td className="py-2 px-3 text-muted-foreground">{item.due}</td>
                    <td className="py-2 px-3 text-brand-teal font-medium">{item.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>Report generated by Supply Chain AI | Data as of November 26, 2025</p>
          <p className="mt-1">For questions, contact supply-chain-analytics@company.com</p>
        </div>
      </div>
    </motion.div>
  )
}
