import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, Minimize2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'multi-agent' | 'knowledge' | 'genie'>('multi-agent')

  // Databricks workspace URL - configured for your environment
  const workspaceUrl = 'fe-vm-hls-amer.cloud.databricks.com'

  const iframeSources = {
    'multi-agent': `https://${workspaceUrl}/serving-endpoints/supply-chain-analysis-mas/invocations`,
    'knowledge': `https://${workspaceUrl}/serving-endpoints/supplytics-knowledge-assistant/invocations`,
    'genie': `https://${workspaceUrl}/sql/genie/supplytics_global_supply_chain`,
  }

  const tabs = [
    { id: 'multi-agent' as const, label: 'Multi-Agent', description: 'Complex analysis' },
    { id: 'knowledge' as const, label: 'Knowledge', description: 'Document search' },
    { id: 'genie' as const, label: 'Genie Space', description: 'SQL queries' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              "fixed z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden",
              isExpanded
                ? "inset-4"
                : "right-4 top-20 bottom-4 w-[480px]"
            )}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="h-14 px-4 border-b border-border flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-teal to-brand-teal/60 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Supply Chain AI</h3>
                  <p className="text-xs text-muted-foreground">Powered by Multi-Agent Supervisor</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-md hover:bg-accent transition-colors"
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md hover:bg-accent transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="h-12 px-2 border-b border-border flex items-center gap-1 bg-background/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 h-9 px-3 rounded-md text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 h-[calc(100%-6.5rem)] relative">
              {/* Fallback UI when iframe cannot load */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-3xl">🤖</span>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {tabs.find(t => t.id === activeTab)?.label} Assistant
                </h4>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  {activeTab === 'multi-agent' &&
                    "Ask complex questions about supply chain risks, network analysis, and what-if scenarios."
                  }
                  {activeTab === 'knowledge' &&
                    "Search through supply chain documentation and best practices."
                  }
                  {activeTab === 'genie' &&
                    "Query your supply chain data using natural language."
                  }
                </p>

                <a
                  href={iframeSources[activeTab]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90 transition-colors"
                  )}
                >
                  <span>Open in Databricks</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Chat Interface Placeholder */}
              <div className="absolute inset-0 flex flex-col">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">🤖</span>
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-accent text-sm">
                      <p>Hello! I'm your Supply Chain AI Assistant. I can help you with:</p>
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        <li>• Analyzing network risks and bottlenecks</li>
                        <li>• Running what-if scenarios</li>
                        <li>• Finding alternative suppliers</li>
                        <li>• Tariff impact analysis</li>
                        <li>• Max-flow capacity planning</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask about supply chain risks..."
                      className="flex-1 px-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                      Send
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    Powered by Multi-Agent Supervisor + Knowledge Assistant
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
