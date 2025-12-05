import { motion } from 'framer-motion'
import { FileText, Download, Mail, Calendar, Network, Users, Package, DollarSign, AlertTriangle, TrendingUp, Building2, Globe, Shield, Target, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

// Network Health Data
const networkMetrics = {
  entities: 1526,
  relationships: 8403,
  density: 0.7,
  modularity: 0.56,
  avgPathLength: 2.97,
  components: 225
}

// Hub Suppliers (Single Points of Failure)
const hubSuppliers = [
  { id: 'SUP-000029', name: 'AeroMed Plastics', materials: 77, role: 'High network bridging' },
  { id: 'SUP-000077', name: 'MicroPulse Automation', materials: 76, role: 'Highest betweenness' },
  { id: 'SUP-000076', name: 'PrecisionMed Medical', materials: 76, role: 'Major hub supplier' },
]

// Critical Materials
const criticalMaterials = [
  { name: 'Oxygen Sensor #4', products: 7, betweenness: 0 },
  { name: 'Adhesive Hydrogel #4', products: 7, betweenness: 0 },
  { name: 'Ultrasound Transducer #4', products: 7, betweenness: 0 },
  { name: 'Pressure Sensor #4', products: 7, betweenness: 0 },
]

// Complex Products
const complexProducts = [
  { name: 'Surgical Drill Model 124', materials: 64, tariff: 62.34 },
  { name: 'ECG Machine Model 152', materials: 26, tariff: 28.50 },
  { name: 'ECG Machine Model 122', materials: 20, tariff: 22.15 },
  { name: 'Pacemaker Model 106', materials: 19, tariff: 31.20 },
]

// Top Customers
const topCustomers = [
  { name: 'St. Anne Medical Center', revenue: 7.83, products: 6 },
  { name: 'Valley View Clinic', revenue: 7.71, products: 6 },
  { name: 'Providence Health Partners', revenue: 7.44, products: 6 },
]

// Tariff Exposure by Country
const tariffExposure = [
  { country: 'United Kingdom', exposure: 102.34 },
  { country: 'Singapore', exposure: 94.17 },
  { country: 'United States', exposure: 90.81 },
  { country: 'India', exposure: 39.96 },
  { country: 'Germany', exposure: 35.20 },
]

// Recommendations
const immediateActions = [
  { action: 'Develop alternate sources for top 3 hub suppliers', owner: 'Procurement', timeline: '0-3 months' },
  { action: 'Secure additional suppliers for 4 critical materials', owner: 'Sourcing', timeline: '0-3 months' },
  { action: 'BOM simplification for Surgical Drill Model 124', owner: 'Engineering', timeline: '0-3 months' },
]

const mediumTermActions = [
  { action: 'Evaluate local sourcing for UK/Singapore/US materials', owner: 'Strategic Sourcing', timeline: '3-12 months' },
  { action: 'Enhanced account management for top 10 customers', owner: 'Sales', timeline: '3-12 months' },
  { action: 'Integrate 225 isolated network components', owner: 'Supply Chain', timeline: '3-12 months' },
]

const longTermActions = [
  { action: 'Build redundancy in critical supply paths', owner: 'Supply Chain Strategy', timeline: '12+ months' },
  { action: 'Create standardized component platforms', owner: 'Product Development', timeline: '12+ months' },
  { action: 'Develop geographically balanced supplier portfolio', owner: 'Global Sourcing', timeline: '12+ months' },
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
}

const progressVariants = {
  hidden: { width: 0 },
  visible: (width: number) => ({
    width: `${width}%`,
    transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 }
  })
}

const kpiVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
}

export default function ExecutiveBriefing() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['network', 'suppliers', 'recommendations']))

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const maxMaterials = Math.max(...hubSuppliers.map(s => s.materials))
  const maxTariff = Math.max(...tariffExposure.map(t => t.exposure))
  const maxProductMaterials = Math.max(...complexProducts.map(p => p.materials))

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Executive Supply Chain Briefing</h1>
          <p className="text-muted-foreground">
            Comprehensive network health and risk assessment
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

      {/* Executive Summary Text */}
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-brand-teal" />
          <h2 className="text-lg font-semibold text-foreground">Executive Summary</h2>
        </div>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            Based on comprehensive network analysis of your supply chain data, I've identified several critical insights
            that require executive attention. Your supply chain network consists of <strong className="text-foreground">1,526 entities</strong> connected
            through <strong className="text-foreground">8,403 relationships</strong>, representing a moderately complex ecosystem of suppliers,
            materials, products, and customers.
          </p>
          <p>
            <strong className="text-foreground">Key Findings:</strong> The network shows a <strong className="text-foreground">low density (0.7%)</strong>, indicating
            selective but strategic connections rather than excessive complexity. The <strong className="text-foreground">modularity score of 0.56</strong> suggests
            distinct operational clusters that help contain disruptions, while an <strong className="text-foreground">average path length of 2.97</strong> enables
            quick information flow and response.
          </p>
          <p>
            <strong className="text-foreground">Critical Risk Alert:</strong> Your supply base shows high concentration around 3 key hub suppliers
            (AeroMed Plastics, MicroPulse Automation, and PrecisionMed Medical), each supplying 76-77 materials. A disruption
            at any of these could impact a substantial portion of your material supply base. Additionally, 4 critical materials
            are each used across 7 different products, creating cross-product vulnerability.
          </p>
          <p>
            <strong className="text-foreground">Regulatory Exposure:</strong> Products like Surgical Drill Model 124 face significant tariff
            exposure ($62.34) due to material sourcing from United Kingdom ($102.34 exposure), Singapore ($94.17), and
            United States ($90.81). These represent opportunities for cost optimization through supplier diversification.
          </p>
        </div>
      </div>

      {/* Network Health KPIs */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="p-4 rounded-xl bg-card border border-border" variants={kpiVariants}>
          <div className="flex items-center gap-2 mb-2">
            <Network className="w-4 h-4 text-brand-teal" />
            <span className="text-xs text-muted-foreground">Total Entities</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{networkMetrics.entities.toLocaleString()}</p>
        </motion.div>
        <motion.div className="p-4 rounded-xl bg-card border border-border" variants={kpiVariants}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Relationships</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{networkMetrics.relationships.toLocaleString()}</p>
        </motion.div>
        <motion.div className="p-4 rounded-xl bg-card border border-border" variants={kpiVariants}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Network Density</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{networkMetrics.density}%</p>
        </motion.div>
        <motion.div className="p-4 rounded-xl bg-card border border-border" variants={kpiVariants}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Modularity</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{networkMetrics.modularity}</p>
          <p className="text-xs text-green-500">Good</p>
        </motion.div>
        <motion.div className="p-4 rounded-xl bg-card border border-border" variants={kpiVariants}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">Avg Path Length</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{networkMetrics.avgPathLength}</p>
          <p className="text-xs text-muted-foreground">hops</p>
        </motion.div>
        <motion.div className="p-4 rounded-xl bg-card border border-border" variants={kpiVariants}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-risk-high" />
            <span className="text-xs text-muted-foreground">Isolated Components</span>
          </div>
          <p className="text-2xl font-bold text-risk-high">{networkMetrics.components}</p>
          <p className="text-xs text-risk-high">Needs attention</p>
        </motion.div>
      </motion.div>

      {/* Overall Assessment Card */}
      <div className="rounded-xl bg-gradient-to-r from-brand-teal/10 to-blue-500/10 border border-brand-teal/20 p-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">Overall Network Health Assessment</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your supply chain shows <strong className="text-foreground">moderate connectivity</strong> with {networkMetrics.entities.toLocaleString()} total entities connected through {networkMetrics.relationships.toLocaleString()} relationships.
          The network has a <strong className="text-foreground">low density ({networkMetrics.density}%)</strong>, indicating selective but strategic connections rather than excessive complexity.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <Shield className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Good Modularity (0.56)</p>
              <p className="text-xs text-muted-foreground">Distinct operational clusters help contain disruptions</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Short Paths (2.97 hops)</p>
              <p className="text-xs text-muted-foreground">Enables quick information flow and response</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">225 Isolated Components</p>
              <p className="text-xs text-muted-foreground">Sub-networks may need integration attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Supply-Side Risks */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <button
          onClick={() => toggleSection('suppliers')}
          className="w-full px-6 py-4 flex items-center justify-between bg-risk-critical/5 border-b border-border hover:bg-risk-critical/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-risk-critical" />
            <h2 className="text-lg font-semibold text-foreground">Critical Supply-Side Risks</h2>
          </div>
          {expandedSections.has('suppliers') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {expandedSections.has('suppliers') && (
          <motion.div
            className="p-6 space-y-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Hub Suppliers */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-risk-critical" />
                Hub Suppliers (Single Points of Failure)
              </h3>
              <p className="text-xs text-muted-foreground mb-4">Your supply base is highly concentrated around key suppliers. A disruption at any of these could impact a substantial portion of your material supply base.</p>
              <div className="space-y-3">
                {hubSuppliers.map((supplier, i) => (
                  <motion.div
                    key={supplier.id}
                    className="flex items-center gap-4"
                    variants={itemVariants}
                  >
                    <motion.span
                      className="w-6 h-6 rounded-full bg-risk-critical text-white text-xs flex items-center justify-center flex-shrink-0"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                    >
                      {i + 1}
                    </motion.span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{supplier.name}</span>
                        <span className="text-xs text-muted-foreground">{supplier.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-risk-critical rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(supplier.materials / maxMaterials) * 100}%` }}
                            transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground w-20">{supplier.materials} materials</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{supplier.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Critical Materials */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" />
                Critical Material Dependencies
              </h3>
              <p className="text-xs text-muted-foreground mb-4">These materials are used across 7 different products each. Any supply disruption would simultaneously affect multiple product lines.</p>
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
                variants={containerVariants}
              >
                {criticalMaterials.map((material, i) => (
                  <motion.div
                    key={material.name}
                    className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  >
                    <p className="text-sm font-medium text-foreground">{material.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Used in {material.products} products</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Product Portfolio Vulnerabilities */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <button
          onClick={() => toggleSection('products')}
          className="w-full px-6 py-4 flex items-center justify-between border-b border-border hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-foreground">Product Portfolio Vulnerabilities</h2>
          </div>
          {expandedSections.has('products') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {expandedSections.has('products') && (
          <motion.div
            className="p-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <h3 className="text-sm font-semibold text-foreground mb-3">Complex Products (High BOM Risk)</h3>
            <p className="text-xs text-muted-foreground mb-4">Products with complex BOMs are more likely to experience production delays and should be prioritized for supply chain simplification or buffer inventory strategies.</p>
            <div className="space-y-3">
              {complexProducts.map((product, i) => (
                <motion.div
                  key={product.name}
                  className="flex items-center gap-4"
                  variants={itemVariants}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{product.name}</span>
                      <span className="text-xs text-risk-high">${product.tariff.toFixed(2)} tariff</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-purple-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(product.materials / maxProductMaterials) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.12, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-24">{product.materials} materials</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Customer & Regulatory Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <motion.div
          className="rounded-xl bg-card border border-border p-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-foreground">Customer Revenue Concentration</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Top customers purchasing multiple products shows healthy diversification, but revenue concentration represents relationship risk.</p>
          <div className="space-y-3">
            {topCustomers.map((customer, i) => (
              <motion.div
                key={customer.name}
                className="flex items-center gap-3"
                variants={itemVariants}
              >
                <motion.span
                  className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 text-xs flex items-center justify-center"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                >
                  {i + 1}
                </motion.span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{customer.name}</span>
                    <span className="text-sm font-bold text-brand-teal">${customer.revenue}M</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{customer.products} products</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tariff Exposure */}
        <motion.div
          className="rounded-xl bg-card border border-border p-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-foreground">Geographic Trade Policy Risks</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Tariff exposure by country - highest cost exposures requiring mitigation strategies.</p>
          <div className="space-y-3">
            {tariffExposure.map((item, i) => (
              <motion.div
                key={item.country}
                className="flex items-center gap-3"
                variants={itemVariants}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{item.country}</span>
                    <span className="text-sm font-bold text-amber-500">${item.exposure.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(item.exposure / maxTariff) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Strategic Recommendations */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <button
          onClick={() => toggleSection('recommendations')}
          className="w-full px-6 py-4 flex items-center justify-between bg-brand-teal/5 border-b border-border hover:bg-brand-teal/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-brand-teal" />
            <h2 className="text-lg font-semibold text-foreground">Strategic Recommendations</h2>
          </div>
          {expandedSections.has('recommendations') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {expandedSections.has('recommendations') && (
          <div className="p-6 space-y-6">
            {/* Immediate Actions */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-risk-critical/20 text-risk-critical text-xs">Immediate</span>
                0-3 Months
              </h3>
              <div className="space-y-2">
                {immediateActions.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-risk-critical/5 border border-risk-critical/10">
                    <span className="w-6 h-6 rounded-full bg-risk-critical text-white text-xs flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground">Owner: {item.owner}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medium-term */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 text-xs">Medium-term</span>
                3-12 Months
              </h3>
              <div className="space-y-2">
                {mediumTermActions.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground">Owner: {item.owner}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Long-term */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-500 text-xs">Long-term</span>
                12+ Months
              </h3>
              <div className="space-y-2">
                {longTermActions.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground">Owner: {item.owner}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPIs to Monitor */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Key Performance Indicators to Monitor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Supplier concentration ratios', target: 'Top 10 suppliers', icon: Building2 },
            { label: 'Single-source material count', target: 'Revenue at risk', icon: Package },
            { label: 'Customer revenue concentration', target: 'Top 10 percentage', icon: Users },
            { label: 'Tariff cost ratio', target: '% of product cost', icon: DollarSign },
            { label: 'Network modularity changes', target: 'Over time', icon: Network },
            { label: 'Critical path redundancy', target: 'Backup suppliers', icon: Shield },
          ].map((kpi) => (
            <div key={kpi.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <kpi.icon className="w-4 h-4 text-brand-teal mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{kpi.label}</p>
                <p className="text-xs text-muted-foreground">{kpi.target}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Line Summary */}
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-brand-teal" />
          <h2 className="text-lg font-semibold text-foreground">Bottom Line</h2>
        </div>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            Your supply chain demonstrates <strong className="text-foreground">good structural foundations</strong> with appropriate modularity
            and path lengths, but contains <strong className="text-foreground">significant concentration risks</strong> that require proactive management.
            The combination of hub supplier dependency, critical material vulnerabilities, and regulatory exposure creates
            a risk profile that demands attention.
          </p>
          <p>
            <strong className="text-foreground">Priority Actions:</strong> Focus immediate efforts on developing alternate sources for the top 3 hub
            suppliers and securing additional suppliers for the 4 critical materials identified. The Surgical Drill Model 124,
            with its 64-material BOM and highest tariff exposure, should be prioritized for supply chain simplification.
          </p>
          <p>
            <strong className="text-foreground">Opportunity:</strong> The 225 isolated network components represent untapped integration potential.
            Connecting these sub-networks could improve overall resilience and reveal additional optimization opportunities.
            Customer concentration, while currently healthy with diversification across multiple products, should be monitored
            as revenue dependency grows.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-xl bg-gradient-to-r from-brand-teal/5 to-blue-500/5 border border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          This analysis reveals a supply chain with good structural foundations but significant concentration risks that require proactive management to ensure continued resilience and growth.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Report generated by Supply Chain AI | Data as of December 4, 2025
        </p>
      </div>
    </motion.div>
  )
}
