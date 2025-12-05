import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  DollarSign, Globe, TrendingUp, AlertTriangle, Building2, Package,
  Shield, Target, ChevronDown, ChevronRight, Clock, Bot, Send,
  Sparkles, ArrowRight, Users, Factory, Sliders, Network, Brain,
  BarChart3, GitBranch, Layers, Zap, CheckCircle2, Info
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
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

// Country scenarios
const countryScenarios = [
  { id: 'china', name: 'China', flag: '🇨🇳', exposure: 87, suppliers: 3, materials: 74, alert: true },
  { id: 'taiwan', name: 'Taiwan', flag: '🇹🇼', exposure: 32, suppliers: 2, materials: 28, alert: false },
  { id: 'vietnam', name: 'Vietnam', flag: '🇻🇳', exposure: 18, suppliers: 4, materials: 22, alert: false },
  { id: 'mexico', name: 'Mexico', flag: '🇲🇽', exposure: 24, suppliers: 3, materials: 31, alert: false },
  { id: 'germany', name: 'Germany', flag: '🇩🇪', exposure: 15, suppliers: 2, materials: 18, alert: false },
]

// AI Agents that contribute to analysis
const aiAgents = [
  {
    id: 'network',
    name: 'Network Graph Agent',
    icon: Network,
    color: 'brand-teal',
    description: 'Analyzes supplier dependencies, hub nodes, and single points of failure',
    factors: ['Betweenness centrality', 'Hub supplier identification', 'Network density', 'Critical paths']
  },
  {
    id: 'financial',
    name: 'Financial Impact Agent',
    icon: DollarSign,
    color: 'green-500',
    description: 'Calculates revenue at risk, margin impacts, and cost absorption capacity',
    factors: ['Revenue exposure', 'Product profitability', 'Customer concentration', 'Pricing elasticity']
  },
  {
    id: 'resilience',
    name: 'Supply Resilience Agent',
    icon: Shield,
    color: 'blue-500',
    description: 'Evaluates alternative suppliers, lead times, and geographic diversification',
    factors: ['Alternative availability', 'Qualification timeline', 'Geographic spread', 'Dual-source readiness']
  },
  {
    id: 'strategic',
    name: 'Strategy Agent',
    icon: Target,
    color: 'purple-500',
    description: 'Generates prioritized action plans with owners and timelines',
    factors: ['Action prioritization', 'Resource allocation', 'Timeline optimization', 'Risk sequencing']
  },
]

// Multi-factor comparison
const analysisComparison = {
  traditional: {
    title: 'Traditional Single-Factor',
    approach: 'Volume × Rate Change = Cost Impact',
    limitations: [
      'Ignores supplier dependencies',
      'No alternative sourcing analysis',
      'Missing revenue context',
      'No prioritized actions',
      'Static point-in-time view'
    ]
  },
  ai: {
    title: 'AI Multi-Factor Analysis',
    approach: '4 Agents × 16+ Factors = Strategic Insights',
    advantages: [
      {
        id: 'network',
        title: 'Network-aware dependency analysis',
        icon: 'Network',
        color: 'brand-teal',
        description: 'Uses graph theory to map your entire supplier network and identify hidden dependencies.',
        howItWorks: [
          'Builds a comprehensive supplier-material-product graph from your data',
          'Calculates betweenness centrality to find hub suppliers',
          'Identifies critical paths where disruption cascades through the network',
          'Scores suppliers by network importance, not just spend volume'
        ],
        example: 'A $2M supplier might be more critical than a $20M supplier if 15 products depend on their unique component.',
        metrics: ['Hub Score', 'Network Density', 'Cascade Risk Index']
      },
      {
        id: 'alternative',
        title: 'Alternative supplier evaluation',
        icon: 'GitBranch',
        color: 'blue-500',
        description: 'Automatically identifies and scores potential replacement suppliers for at-risk materials.',
        howItWorks: [
          'Scans your approved vendor database for capability matches',
          'Evaluates lead time, quality history, and geographic diversification',
          'Calculates qualification timeline and switching costs',
          'Ranks alternatives by readiness-to-activate score'
        ],
        example: 'For a single-source IC component, AI found 3 qualified alternatives with 6-month activation timeline.',
        metrics: ['Alternative Count', 'Activation Timeline', 'Switching Cost']
      },
      {
        id: 'revenue',
        title: 'Revenue-weighted prioritization',
        icon: 'DollarSign',
        color: 'green-500',
        description: 'Prioritizes mitigation efforts based on actual revenue impact, not just cost exposure.',
        howItWorks: [
          'Maps materials → products → revenue streams',
          'Calculates revenue at risk for each tariff scenario',
          'Factors in product margins and customer concentration',
          'Ranks risks by business impact, not procurement spend'
        ],
        example: 'A 25% tariff on $5M materials affecting $80M revenue products ranks higher than a 50% tariff on $10M commodity materials.',
        metrics: ['Revenue at Risk', 'Margin Impact', 'Customer Exposure']
      },
      {
        id: 'actionable',
        title: 'Actionable recommendations',
        icon: 'Target',
        color: 'purple-500',
        description: 'Generates specific, assigned actions with owners and timelines instead of generic advice.',
        howItWorks: [
          'Analyzes risk reduction potential for each possible action',
          'Matches actions to organizational capabilities and owners',
          'Sequences actions by dependency and urgency',
          'Provides clear success metrics for each recommendation'
        ],
        example: 'Instead of "diversify suppliers", AI recommends: "Qualify Taiwan Semiconductor by Q2 (owner: Engineering) - reduces China dependency by 34%"',
        metrics: ['Risk Reduction %', 'Implementation Effort', 'Timeline']
      },
      {
        id: 'dynamic',
        title: 'Dynamic scenario modeling',
        icon: 'Layers',
        color: 'amber-500',
        description: 'Runs real-time what-if simulations across multiple tariff scenarios simultaneously.',
        howItWorks: [
          'Models tariff changes across multiple countries in parallel',
          'Simulates supply chain disruption propagation',
          'Calculates compounding effects of multiple policy changes',
          'Updates recommendations as new data arrives'
        ],
        example: 'Simultaneously modeling +25% China tariff with potential Taiwan disruption reveals hidden $15M compound risk.',
        metrics: ['Scenario Count', 'Compound Risk', 'Update Frequency']
      }
    ]
  }
}

// Country-specific analysis data
const countryAnalysisData: Record<string, {
  suppliers: { name: string; materials: number; revenue: number; agent: string }[];
  products: { name: string; revenue: number; tariff: number; components: number; agent: string }[];
  vulnerabilities: { name: string; suppliers: number; alternatives: number; agent: string }[];
  actions: {
    shortTerm: { action: string; owner: string; agent: string }[];
    mediumTerm: { action: string; owner: string; agent: string }[];
  };
  financial: { revenueAtRisk: number; potentialIncrease: number; mitigationSavings: number; daysToAct: number };
  bottomLine: string;
}> = {
  china: {
    suppliers: [
      { name: 'AeroMed Plastics', materials: 74, revenue: 28.5, agent: 'network' },
      { name: 'MedTech Manufacturing', materials: 60, revenue: 22.3, agent: 'network' },
      { name: 'ShenZhen Components', materials: 45, revenue: 15.8, agent: 'network' },
    ],
    products: [
      { name: 'Surgical Drill Model 124', revenue: 32.3, tariff: 5.42, components: 18, agent: 'financial' },
      { name: 'Ultrasound Scanner Model 153', revenue: 25.8, tariff: 5.39, components: 22, agent: 'financial' },
      { name: 'Defibrillator Model 105', revenue: 21.9, tariff: 2.99, components: 12, agent: 'financial' },
    ],
    vulnerabilities: [
      { name: 'Medical Grade Silicone #3', suppliers: 2, alternatives: 3, agent: 'resilience' },
      { name: 'Titanium Alloy Ti-6Al-4V #3', suppliers: 2, alternatives: 2, agent: 'resilience' },
    ],
    actions: {
      shortTerm: [
        { action: 'Build 90-day safety stock', owner: 'Supply Chain', agent: 'strategic' },
        { action: 'Lock in forward contracts', owner: 'Procurement', agent: 'strategic' },
        { action: 'Customer price discussions', owner: 'Sales', agent: 'strategic' },
      ],
      mediumTerm: [
        { action: '60% China dependency reduction', owner: 'Strategic Sourcing', agent: 'strategic' },
        { action: 'Product redesign initiative', owner: 'Engineering', agent: 'strategic' },
      ]
    },
    financial: {
      revenueAtRisk: 87,
      potentialIncrease: 25,
      mitigationSavings: 12,
      daysToAct: 90
    },
    bottomLine: 'Your medical device portfolio has significant but manageable China exposure. Focus on diversifying your top 3 hub suppliers (identified via network analysis) and protecting your $87M revenue base from highest-exposure products. Start immediately - supplier qualification takes 6-12 months.'
  },
  taiwan: {
    suppliers: [
      { name: 'TSMC Medical Division', materials: 42, revenue: 18.2, agent: 'network' },
      { name: 'Taiwan Precision Optics', materials: 28, revenue: 12.5, agent: 'network' },
    ],
    products: [
      { name: 'Imaging Sensor Array X1', revenue: 18.5, tariff: 2.85, components: 8, agent: 'financial' },
      { name: 'MRI Controller Unit', revenue: 15.2, tariff: 2.28, components: 12, agent: 'financial' },
      { name: 'Surgical Camera Module', revenue: 11.8, tariff: 1.77, components: 6, agent: 'financial' },
    ],
    vulnerabilities: [
      { name: 'Advanced Semiconductor ICs', suppliers: 1, alternatives: 2, agent: 'resilience' },
      { name: 'High-precision Optical Lenses', suppliers: 2, alternatives: 1, agent: 'resilience' },
    ],
    actions: {
      shortTerm: [
        { action: 'Secure 6-month IC inventory', owner: 'Supply Chain', agent: 'strategic' },
        { action: 'Expedite Samsung qualification', owner: 'Engineering', agent: 'strategic' },
      ],
      mediumTerm: [
        { action: 'Develop US-based chip sourcing', owner: 'Strategic Sourcing', agent: 'strategic' },
        { action: 'Design for multi-source capability', owner: 'R&D', agent: 'strategic' },
      ]
    },
    financial: {
      revenueAtRisk: 32,
      potentialIncrease: 8,
      mitigationSavings: 5,
      daysToAct: 120
    },
    bottomLine: 'Taiwan exposure is moderate but concentrated in critical semiconductor components. The single-source dependency on TSMC-class chips represents the highest risk. Geopolitical tensions require proactive diversification toward Korean and US fab alternatives.'
  },
  vietnam: {
    suppliers: [
      { name: 'VN Medical Assembly', materials: 35, revenue: 8.5, agent: 'network' },
      { name: 'Hanoi Plastics Corp', materials: 28, revenue: 6.2, agent: 'network' },
      { name: 'Saigon Electronics', materials: 22, revenue: 5.8, agent: 'network' },
      { name: 'Mekong Cable Works', materials: 18, revenue: 4.3, agent: 'network' },
    ],
    products: [
      { name: 'Patient Monitor Housing', revenue: 8.8, tariff: 0.88, components: 4, agent: 'financial' },
      { name: 'Cable Assembly Kit', revenue: 6.5, tariff: 0.65, components: 8, agent: 'financial' },
      { name: 'Disposable Sensor Pack', revenue: 5.2, tariff: 0.52, components: 3, agent: 'financial' },
    ],
    vulnerabilities: [
      { name: 'Medical-grade PVC Tubing', suppliers: 2, alternatives: 4, agent: 'resilience' },
    ],
    actions: {
      shortTerm: [
        { action: 'Monitor trade policy changes', owner: 'Trade Compliance', agent: 'strategic' },
        { action: 'Document country-of-origin', owner: 'Quality', agent: 'strategic' },
      ],
      mediumTerm: [
        { action: 'Expand Vietnam capacity', owner: 'Operations', agent: 'strategic' },
        { action: 'Leverage as China alternative', owner: 'Strategic Sourcing', agent: 'strategic' },
      ]
    },
    financial: {
      revenueAtRisk: 18,
      potentialIncrease: 3,
      mitigationSavings: 7,
      daysToAct: 180
    },
    bottomLine: 'Vietnam represents a favorable tariff environment and serves as a strategic China-alternative hub. Current exposure is low-risk, but capacity constraints may limit rapid scaling. Continue investment in Vietnam operations as part of your diversification strategy.'
  },
  mexico: {
    suppliers: [
      { name: 'Monterrey MedTech', materials: 45, revenue: 12.8, agent: 'network' },
      { name: 'Tijuana Assembly Co', materials: 38, revenue: 9.5, agent: 'network' },
      { name: 'Guadalajara Electronics', materials: 31, revenue: 8.2, agent: 'network' },
    ],
    products: [
      { name: 'Infusion Pump Assembly', revenue: 14.2, tariff: 1.42, components: 15, agent: 'financial' },
      { name: 'Diagnostic Kit Housing', revenue: 9.8, tariff: 0.98, components: 6, agent: 'financial' },
      { name: 'Sterilization Container', revenue: 7.5, tariff: 0.75, components: 4, agent: 'financial' },
    ],
    vulnerabilities: [
      { name: 'Injection Molded Casings', suppliers: 2, alternatives: 3, agent: 'resilience' },
      { name: 'Precision Metal Stampings', suppliers: 1, alternatives: 2, agent: 'resilience' },
    ],
    actions: {
      shortTerm: [
        { action: 'USMCA compliance audit', owner: 'Trade Compliance', agent: 'strategic' },
        { action: 'Review rules of origin', owner: 'Legal', agent: 'strategic' },
        { action: 'Optimize IMMEX benefits', owner: 'Finance', agent: 'strategic' },
      ],
      mediumTerm: [
        { action: 'Expand nearshoring capacity', owner: 'Operations', agent: 'strategic' },
        { action: 'Develop Tier 2 supplier base', owner: 'Procurement', agent: 'strategic' },
      ]
    },
    financial: {
      revenueAtRisk: 24,
      potentialIncrease: 4,
      mitigationSavings: 9,
      daysToAct: 60
    },
    bottomLine: 'Mexico offers strategic nearshoring advantages under USMCA with favorable tariff treatment. Current exposure benefits from trade agreements, but potential policy changes require monitoring. Prioritize USMCA compliance documentation and consider expanding Mexico operations.'
  },
  germany: {
    suppliers: [
      { name: 'Bavaria Precision GmbH', materials: 24, revenue: 9.8, agent: 'network' },
      { name: 'Stuttgart Medical Tech', materials: 18, revenue: 7.2, agent: 'network' },
    ],
    products: [
      { name: 'Surgical Robot Joint', revenue: 12.5, tariff: 1.25, components: 8, agent: 'financial' },
      { name: 'Precision Actuator Unit', revenue: 8.8, tariff: 0.88, components: 5, agent: 'financial' },
      { name: 'Sterilizable Gearbox', revenue: 6.2, tariff: 0.62, components: 12, agent: 'financial' },
    ],
    vulnerabilities: [
      { name: 'Precision Ball Bearings', suppliers: 2, alternatives: 2, agent: 'resilience' },
    ],
    actions: {
      shortTerm: [
        { action: 'Document EU FTA benefits', owner: 'Trade Compliance', agent: 'strategic' },
        { action: 'Review bilateral agreements', owner: 'Legal', agent: 'strategic' },
      ],
      mediumTerm: [
        { action: 'Maintain premium supplier base', owner: 'Procurement', agent: 'strategic' },
        { action: 'Explore Eastern EU alternatives', owner: 'Strategic Sourcing', agent: 'strategic' },
      ]
    },
    financial: {
      revenueAtRisk: 15,
      potentialIncrease: 2,
      mitigationSavings: 3,
      daysToAct: 180
    },
    bottomLine: 'Germany exposure is low-risk due to stable EU trade relationships. Premium suppliers provide high-quality precision components critical for surgical robotics. Maintain relationships while exploring cost-effective Eastern European alternatives for non-critical components.'
  }
}

// Traditional analysis data
const traditionalMaterials = [
  { id: 'MAT-001', name: 'Semiconductor IC', origin: 'China', rate: 25, volume: 5200000, cost: 1300000, alt: true },
  { id: 'MAT-023', name: 'PCB Substrate', origin: 'Taiwan', rate: 15, volume: 3400000, cost: 510000, alt: true },
  { id: 'MAT-045', name: 'Capacitor Array', origin: 'China', rate: 25, volume: 1800000, cost: 450000, alt: false },
  { id: 'MAT-089', name: 'Aluminum Housing', origin: 'China', rate: 10, volume: 2100000, cost: 210000, alt: true },
  { id: 'MAT-112', name: 'Battery Cell', origin: 'China', rate: 25, volume: 4500000, cost: 1125000, alt: false },
]

export default function TariffMaterial() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedCountry, setSelectedCountry] = useState('china')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['factors', 'immediate', 'products'])
  )
  const [expandedAdvantages, setExpandedAdvantages] = useState<Set<string>>(new Set())
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'Select a country above to see AI-powered tariff impact analysis, or ask me a specific question about tariff scenarios.' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [showAgentDetails, setShowAgentDetails] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.has(section) ? next.delete(section) : next.add(section)
      return next
    })
  }

  const toggleAdvantage = (id: string) => {
    setExpandedAdvantages(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const getAdvantageIcon = (iconName: string) => {
    const icons: Record<string, typeof Network> = {
      Network, GitBranch, DollarSign, Target, Layers
    }
    return icons[iconName] || Network
  }

  const handleCountrySelect = (countryId: string) => {
    setSelectedCountry(countryId)
    const country = countryScenarios.find(c => c.id === countryId)
    if (country) {
      setChatMessages(prev => [...prev,
        { role: 'user', content: `What is the impact of ${country.name} tariffs on my supply chain?` },
        { role: 'assistant', content: `Analyzing ${country.name} tariff impact using 4 specialized AI agents... Analysis complete. See the detailed breakdown below.` }
      ])
    }
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return
    const userMessage = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setChatInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/multi-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, { role: 'user', content: userMessage }]
        })
      })
      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const getAgentColor = (agentId: string) => {
    const agent = aiAgents.find(a => a.id === agentId)
    return agent?.color || 'gray-500'
  }

  const getAgentIcon = (agentId: string) => {
    const agent = aiAgents.find(a => a.id === agentId)
    return agent?.icon || Brain
  }

  const selectedCountryData = countryScenarios.find(c => c.id === selectedCountry)
  const currentAnalysis = countryAnalysisData[selectedCountry]
  const maxMaterials = currentAnalysis ? Math.max(...currentAnalysis.suppliers.map(s => s.materials)) : 0
  const maxRevenue = currentAnalysis ? Math.max(...currentAnalysis.products.map(p => p.revenue)) : 0

  const tabs = [
    { id: 0, label: 'AI Multi-Factor Analysis', icon: Sparkles },
    { id: 1, label: 'Traditional Scenario', icon: Sliders },
  ]

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
          <h1 className="text-2xl font-bold text-foreground">Tariff Impact Analysis</h1>
          <p className="text-muted-foreground">
            AI-powered multi-factor analysis vs traditional scenario modeling
          </p>
        </div>
        {selectedCountryData?.alert && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-500">{selectedCountryData.name} Tariff Alert</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-muted/30 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 0 ? (
        /* AI Multi-Factor Analysis Tab */
        <motion.div
          key="ai-analysis"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Country Selector - Q&A Style */}
          <div className="rounded-xl bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-brand-teal/20">
                <Bot className="w-5 h-5 text-brand-teal" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Ask about tariff impact</h2>
                <p className="text-sm text-muted-foreground">Select a country to analyze or type your question</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              {countryScenarios.map((country) => (
                <button
                  key={country.id}
                  onClick={() => handleCountrySelect(country.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                    selectedCountry === country.id
                      ? "bg-brand-teal/10 border-brand-teal text-foreground"
                      : "bg-background border-border text-muted-foreground hover:border-brand-teal/50"
                  )}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="font-medium">{country.name}</span>
                  {country.alert && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Or ask a specific question... e.g., 'What if China tariffs increase 50%?'"
                className="flex-1 px-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !chatInput.trim()}
                className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Analysis Method Comparison */}
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <button
              onClick={() => toggleSection('factors')}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-brand-teal/5 to-purple-500/5 border-b border-border"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-brand-teal" />
                <h2 className="text-lg font-semibold text-foreground">How AI Analysis Works</h2>
                <span className="px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal text-xs">4 Agents • 16+ Factors</span>
              </div>
              {expandedSections.has('factors') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            <AnimatePresence>
              {expandedSections.has('factors') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 space-y-6">
                    {/* Old vs New Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Traditional */}
                      <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 mb-3">
                          <Sliders className="w-5 h-5 text-muted-foreground" />
                          <h3 className="font-semibold text-foreground">{analysisComparison.traditional.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 font-mono bg-background px-2 py-1 rounded">
                          {analysisComparison.traditional.approach}
                        </p>
                        <ul className="space-y-2">
                          {analysisComparison.traditional.limitations.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-risk-critical" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* AI Multi-Factor */}
                      <div className="p-4 rounded-lg bg-brand-teal/5 border border-brand-teal/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-5 h-5 text-brand-teal" />
                          <h3 className="font-semibold text-foreground">{analysisComparison.ai.title}</h3>
                        </div>
                        <p className="text-sm text-brand-teal mb-3 font-mono bg-brand-teal/10 px-2 py-1 rounded">
                          {analysisComparison.ai.approach}
                        </p>
                        <div className="space-y-2">
                          {analysisComparison.ai.advantages.map((advantage) => {
                            const IconComponent = getAdvantageIcon(advantage.icon)
                            const isExpanded = expandedAdvantages.has(advantage.id)
                            return (
                              <div key={advantage.id} className="border border-border/50 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => toggleAdvantage(advantage.id)}
                                  className="w-full flex items-center gap-2 p-3 text-left hover:bg-background/50 transition-colors"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span className="text-sm text-foreground flex-1">{advantage.title}</span>
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </button>
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-3 pb-3 pt-0 space-y-3 border-t border-border/30">
                                        <div className="flex items-start gap-2 pt-3">
                                          <IconComponent className={`w-5 h-5 text-${advantage.color} flex-shrink-0 mt-0.5`} />
                                          <p className="text-sm text-muted-foreground">{advantage.description}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs font-semibold text-foreground mb-2">How it works:</p>
                                          <ul className="space-y-1 ml-2">
                                            {advantage.howItWorks.map((step, idx) => (
                                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                                <span className="w-4 h-4 rounded-full bg-muted text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                                                  {idx + 1}
                                                </span>
                                                {step}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                        <div className="p-2 rounded bg-background border border-border">
                                          <p className="text-xs text-muted-foreground">
                                            <strong className="text-foreground">Example:</strong> {advantage.example}
                                          </p>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {advantage.metrics.map((metric, idx) => (
                                            <span key={idx} className={`px-2 py-0.5 rounded text-xs bg-${advantage.color}/10 text-${advantage.color}`}>
                                              {metric}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* AI Agents Grid */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        Specialized AI Agents Contributing to Analysis
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {aiAgents.map((agent) => (
                          <motion.div
                            key={agent.id}
                            className={cn(
                              "p-4 rounded-lg border cursor-pointer transition-all",
                              showAgentDetails === agent.id
                                ? `bg-${agent.color}/10 border-${agent.color}/30`
                                : "bg-card border-border hover:border-brand-teal/30"
                            )}
                            onClick={() => setShowAgentDetails(showAgentDetails === agent.id ? null : agent.id)}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <agent.icon className={`w-5 h-5 text-${agent.color}`} />
                              <span className="font-medium text-foreground text-sm">{agent.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{agent.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {agent.factors.map((factor, i) => (
                                <span
                                  key={i}
                                  className={`px-2 py-0.5 rounded text-xs bg-${agent.color}/10 text-${agent.color}`}
                                >
                                  {factor}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Analysis Results - Show when country data available */}
          {currentAnalysis && (
            <>
              {/* Key Metrics */}
              <motion.div
                key={`metrics-${selectedCountry}`}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div className="p-5 rounded-xl bg-card border border-border" variants={itemVariants}>
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8 text-brand-teal" />
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">Financial Agent</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">${currentAnalysis.financial.revenueAtRisk}M+</p>
                  <p className="text-sm text-muted-foreground">Revenue at Risk</p>
                </motion.div>
                <motion.div className="p-5 rounded-xl bg-card border border-border" variants={itemVariants}>
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-risk-critical" />
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">Financial Agent</span>
                  </div>
                  <p className="text-2xl font-bold text-risk-critical">+${currentAnalysis.financial.potentialIncrease}M</p>
                  <p className="text-sm text-muted-foreground">Potential Increase</p>
                </motion.div>
                <motion.div className="p-5 rounded-xl bg-card border border-border" variants={itemVariants}>
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="w-8 h-8 text-green-500" />
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500">Resilience Agent</span>
                  </div>
                  <p className="text-2xl font-bold text-green-500">${currentAnalysis.financial.mitigationSavings}M</p>
                  <p className="text-sm text-muted-foreground">Mitigation Savings</p>
                </motion.div>
                <motion.div className="p-5 rounded-xl bg-card border border-border" variants={itemVariants}>
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 text-amber-500" />
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-500">Strategy Agent</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{currentAnalysis.financial.daysToAct}</p>
                  <p className="text-sm text-muted-foreground">Days to Act</p>
                </motion.div>
              </motion.div>

              {/* Hub Suppliers - Network Agent */}
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <button
                  onClick={() => toggleSection('immediate')}
                  className="w-full px-6 py-4 flex items-center justify-between bg-risk-critical/5 border-b border-border"
                >
                  <div className="flex items-center gap-3">
                    <Network className="w-5 h-5 text-brand-teal" />
                    <h2 className="text-lg font-semibold text-foreground">Critical Hub Suppliers</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal">Network Agent</span>
                  </div>
                  {expandedSections.has('immediate') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>

                {expandedSections.has('immediate') && (
                  <motion.div key={`suppliers-${selectedCountry}`} className="p-6" initial="hidden" animate="visible" variants={containerVariants}>
                    <p className="text-sm text-muted-foreground mb-4">
                      <Info className="w-4 h-4 inline mr-1" />
                      Identified via <strong>betweenness centrality</strong> analysis - these suppliers are network hubs whose disruption would cascade through your supply chain.
                    </p>
                    <div className="space-y-3">
                      {currentAnalysis.suppliers.map((supplier, i) => (
                        <motion.div
                          key={supplier.name}
                          className="flex items-center gap-4 p-3 rounded-lg bg-risk-critical/5 border border-risk-critical/10"
                          variants={itemVariants}
                        >
                          <motion.span
                            className="w-8 h-8 rounded-full bg-risk-critical text-white text-sm flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.1, type: 'spring' }}
                          >
                            {i + 1}
                          </motion.span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-foreground">{supplier.name}</span>
                              <span className="text-xs text-muted-foreground">${supplier.revenue}M revenue impact</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-risk-critical rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(supplier.materials / maxMaterials) * 100}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.15 }}
                                />
                              </div>
                              <span className="text-xs font-medium w-24">{supplier.materials} materials</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Revenue Products - Financial Agent */}
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <button
                  onClick={() => toggleSection('products')}
                  className="w-full px-6 py-4 flex items-center justify-between border-b border-border"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <h2 className="text-lg font-semibold text-foreground">Revenue-Critical Products</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">Financial Agent</span>
                  </div>
                  {expandedSections.has('products') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>

                {expandedSections.has('products') && (
                  <motion.div key={`products-${selectedCountry}`} className="p-6" initial="hidden" animate="visible" variants={containerVariants}>
                    <p className="text-sm text-muted-foreground mb-4">
                      <Info className="w-4 h-4 inline mr-1" />
                      Ranked by <strong>revenue × tariff exposure</strong> to prioritize protection efforts where they matter most.
                    </p>
                    <div className="space-y-3">
                      {currentAnalysis.products.map((product, i) => (
                        <motion.div
                          key={product.name}
                          className="p-4 rounded-lg bg-muted/30 border border-border"
                          variants={itemVariants}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground">{product.name}</span>
                            <span className="text-lg font-bold text-brand-teal">${product.revenue}M</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex-1">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-brand-teal rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.1 }}
                                />
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-risk-critical font-medium">${product.tariff}M tariff</span>
                              <p className="text-muted-foreground">{product.components} components</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Single-Source Vulnerabilities - Resilience Agent */}
              <motion.div
                key={`vulnerabilities-${selectedCountry}`}
                className="rounded-xl bg-card border border-border p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-foreground">Single-Source Vulnerabilities</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500">Resilience Agent</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  <Info className="w-4 h-4 inline mr-1" />
                  Materials with <strong>≤2 qualified suppliers</strong> - these represent critical bottlenecks.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentAnalysis.vulnerabilities.map((v) => (
                    <div key={v.name} className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="font-medium text-foreground">{v.name}</p>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-risk-critical">Only {v.suppliers} supplier{v.suppliers > 1 ? 's' : ''}</span>
                        <span className="text-green-500">{v.alternatives} alternative{v.alternatives > 1 ? 's' : ''} identified</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Strategic Actions - Strategy Agent */}
              <motion.div
                key={`actions-${selectedCountry}`}
                className="rounded-xl bg-card border border-border p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 text-purple-500" />
                  <h2 className="text-lg font-semibold text-foreground">Prioritized Actions</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-500">Strategy Agent</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  <Info className="w-4 h-4 inline mr-1" />
                  Actions prioritized by <strong>risk reduction × implementation feasibility</strong>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-risk-critical/20 text-risk-critical text-xs">Immediate</span>
                      0-6 Months
                    </h3>
                    <div className="space-y-2">
                      {currentAnalysis.actions.shortTerm.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-risk-critical/5 border border-risk-critical/10">
                          <ArrowRight className="w-4 h-4 text-risk-critical" />
                          <div>
                            <p className="text-sm text-foreground">{item.action}</p>
                            <p className="text-xs text-muted-foreground">Owner: {item.owner}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 text-xs">Medium-term</span>
                      6-18 Months
                    </h3>
                    <div className="space-y-2">
                      {currentAnalysis.actions.mediumTerm.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <ArrowRight className="w-4 h-4 text-amber-500" />
                          <div>
                            <p className="text-sm text-foreground">{item.action}</p>
                            <p className="text-xs text-muted-foreground">Owner: {item.owner}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Bottom Line */}
              <motion.div
                key={`bottomline-${selectedCountry}`}
                className="rounded-xl bg-gradient-to-r from-brand-teal/5 to-purple-500/5 border border-border p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-brand-teal" />
                  Bottom Line: {selectedCountryData?.flag} {selectedCountryData?.name}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentAnalysis.bottomLine}
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  Analysis synthesized from 4 specialized AI agents | 16+ factors analyzed | Data as of December 4, 2025
                </p>
              </motion.div>
            </>
          )}
        </motion.div>
      ) : (
        /* Traditional Scenario Tab */
        <motion.div
          key="traditional"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Traditional Single-Factor Analysis</p>
                <p className="text-xs text-muted-foreground">
                  This view uses simple Volume × Rate calculations. For comprehensive multi-factor analysis with AI insights, switch to the AI tab.
                </p>
              </div>
            </div>
          </div>

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl bg-card border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Tariff Exposure by Country</h2>
              <div className="h-[400px] rounded-lg bg-background border border-border flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Choropleth tariff heatmap</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-card border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Scenario Modeling</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <select className="w-full px-4 py-2 bg-background border border-input rounded-lg text-sm">
                    <option>China</option>
                    <option>Taiwan</option>
                    <option>Vietnam</option>
                    <option>Mexico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rate Change</label>
                  <select className="w-full px-4 py-2 bg-background border border-input rounded-lg text-sm">
                    <option>+10%</option>
                    <option>+25%</option>
                    <option>+50%</option>
                  </select>
                </div>
                <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium">
                  Simulate Impact
                </button>
                <div className="p-4 rounded-lg bg-background border border-border">
                  <h3 className="font-medium mb-3">Projected Impact</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Materials Affected</span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Additional Cost</span>
                      <span className="font-medium text-risk-critical">+$12.3M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Alternative Suppliers</span>
                      <span className="font-medium text-green-500">12 available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Materials by Tariff Exposure</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Material</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Origin</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rate</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Volume</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cost</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Alt.</th>
                  </tr>
                </thead>
                <tbody>
                  {traditionalMaterials.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-accent/50">
                      <td className="py-3 px-4">
                        <p className="font-medium">{item.id}</p>
                        <p className="text-sm text-muted-foreground">{item.name}</p>
                      </td>
                      <td className="py-3 px-4">{item.origin}</td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          item.rate >= 20 ? "bg-risk-critical/20 text-risk-critical" : "bg-risk-medium/20 text-risk-medium"
                        )}>
                          {item.rate}%
                        </span>
                      </td>
                      <td className="py-3 px-4">{formatCurrency(item.volume)}</td>
                      <td className="py-3 px-4 font-medium">{formatCurrency(item.cost)}</td>
                      <td className="py-3 px-4">
                        <span className={item.alt ? "text-green-500" : "text-risk-critical"}>
                          {item.alt ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-brand-teal/10 to-blue-500/10 border border-brand-teal/20 p-6">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-brand-teal" />
              <div>
                <h2 className="font-semibold text-foreground mb-2">Get Deeper Insights with AI Analysis</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  AI analysis considers 16+ factors across 4 specialized agents - not just volume × rate.
                </p>
                <button
                  onClick={() => setActiveTab(0)}
                  className="px-4 py-2 bg-brand-teal text-white rounded-lg text-sm font-medium hover:bg-brand-teal/90"
                >
                  Switch to AI Analysis
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
