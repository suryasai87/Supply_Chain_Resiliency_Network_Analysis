import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, Minimize2, Send, Loader2, Bot, User, ChevronDown, ChevronRight, Database, BarChart3, Cpu, Wrench, MessageSquare, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import DataVisualization from './DataVisualization'

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

interface TraceStep {
  type: string
  name?: string
  agent?: string
  content?: string
  input?: Record<string, unknown>
  tool_use_id?: string
  id?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  source?: string
  timestamp: Date
  sql?: string
  results?: {
    columns: Array<{ name: string; type?: string }>
    rows: unknown[][]
    row_count?: number
  }
  trace?: TraceStep[]
}

interface GenieSpace {
  key: string
  id: string
  name: string
  description: string
}

type TabId = 'multi-agent' | 'knowledge' | 'genie'

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('multi-agent')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [genieSpaces, setGenieSpaces] = useState<GenieSpace[]>([])
  const [selectedSpace, setSelectedSpace] = useState<string>('global_supply_chain')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [showSpaceDropdown, setShowSpaceDropdown] = useState(false)
  const [expandedTraces, setExpandedTraces] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const toggleTrace = (messageId: string) => {
    setExpandedTraces(prev => {
      const next = new Set(prev)
      if (next.has(messageId)) {
        next.delete(messageId)
      } else {
        next.add(messageId)
      }
      return next
    })
  }

  const tabs = [
    { id: 'multi-agent' as const, label: 'Multi-Agent', description: 'Complex analysis' },
    { id: 'knowledge' as const, label: 'Knowledge', description: 'Document search' },
    { id: 'genie' as const, label: 'Genie Space', description: 'SQL queries' },
  ]

  // Fetch Genie Spaces on mount
  useEffect(() => {
    fetch('/api/genie/spaces')
      .then(res => res.json())
      .then(data => {
        if (data.spaces) {
          setGenieSpaces(data.spaces)
        }
      })
      .catch(err => console.error('Failed to fetch Genie spaces:', err))
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Add welcome message when tab changes
  useEffect(() => {
    // Reset conversation when changing tabs
    setConversationId(null)

    const welcomeMessages: Record<TabId, string> = {
      'multi-agent': `Hello! I'm your Supply Chain AI Assistant powered by Multi-Agent Supervisor. I can help you with:

- **Network Risk Analysis** - Identify single-source dependencies, geographic concentration
- **Tariff Impact Assessment** - Model tariff scenarios and find alternatives
- **Max-Flow Capacity Analysis** - Find bottlenecks using graph algorithms
- **What-If Scenarios** - Simulate disruptions and measure impact
- **Supplier Intelligence** - Deep dive into supplier performance and risk

What would you like to explore?`,
      'knowledge': `I'm the Knowledge Assistant. I can search through supply chain documentation and best practices to answer your questions.

Ask me about:
- Supply chain risk management frameworks
- Supplier evaluation criteria
- Industry benchmarks and standards

What would you like to know?`,
      'genie': `I'm Genie Space - I can query your supply chain data using natural language and return SQL results.

**Select a data space** from the dropdown above, then ask questions like:
- "Which materials are single-sourced?"
- "What is our total tariff exposure?"
- "Show me suppliers with highest risk"

What data would you like to explore?`
    }

    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessages[activeTab],
      source: activeTab,
      timestamp: new Date()
    }])
  }, [activeTab])

  // Reset conversation when space changes
  useEffect(() => {
    if (activeTab === 'genie') {
      setConversationId(null)
      const space = genieSpaces.find(s => s.key === selectedSpace)
      if (space) {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `You're now connected to **${space.name}**.\n\n${space.description}\n\nAsk me anything about this data!`,
          source: 'genie',
          timestamp: new Date()
        }])
      }
    }
  }, [selectedSpace, genieSpaces])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      let endpoint: string
      let body: Record<string, unknown>

      if (activeTab === 'genie') {
        endpoint = '/api/genie/send-message'
        body = {
          message: userMessage.content,
          space_key: selectedSpace,
          conversation_id: conversationId
        }
      } else if (activeTab === 'knowledge') {
        endpoint = '/api/chat/knowledge'
        const apiMessages = messages
          .filter(m => m.id !== 'welcome')
          .concat(userMessage)
          .map(m => ({ role: m.role, content: m.content }))
        body = { messages: apiMessages, max_tokens: 1024 }
      } else {
        endpoint = '/api/chat/multi-agent'
        const apiMessages = messages
          .filter(m => m.id !== 'welcome')
          .concat(userMessage)
          .map(m => ({ role: m.role, content: m.content }))
        body = { messages: apiMessages, max_tokens: 1024 }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      // Get response text first to handle non-JSON responses (like timeout errors)
      const responseText = await response.text()

      // Check for timeout error (Databricks returns plain text "upstream request timeout")
      if (responseText.includes('upstream request timeout') || responseText.includes('timeout')) {
        const timeoutMessage: Message = {
          id: `timeout-${Date.now()}`,
          role: 'assistant',
          content: `⏱️ **Request Timed Out**\n\nThe AI agent is taking longer than expected to respond. This can happen when:\n\n- Complex analysis is being performed\n- Multiple data sources are being queried\n- The agent is processing a large amount of data\n\n**Suggestions:**\n- Try a simpler or more specific question\n- Break your question into smaller parts\n- Try again in a few moments`,
          source: 'timeout',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, timeoutMessage])
        return
      }

      // Try to parse JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch {
        // If JSON parsing fails, handle gracefully
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Unexpected Response**\n\nReceived an unexpected response from the server. Please try again.\n\n_Technical details: Response was not valid JSON_`,
          source: 'error',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        return
      }

      let assistantMessage: Message

      if (activeTab === 'genie') {
        // Update conversation ID for continuity
        if (data.conversation_id) {
          setConversationId(data.conversation_id)
        }

        assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.content || 'No response received',
          source: 'genie',
          timestamp: new Date(),
          sql: data.sql,
          results: data.results
        }
      } else {
        assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.content || data.message || 'No response received',
          source: data.source || activeTab,
          timestamp: new Date(),
          trace: data.trace  // Include trace data for thinking display
        }
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      // Handle network errors, timeouts, etc.
      let errorContent = 'An unexpected error occurred. Please try again.'

      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorContent = `⏱️ **Request Timed Out**\n\nThe request took too long to complete. Please try a simpler query or try again later.`
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          errorContent = `🌐 **Network Error**\n\nUnable to connect to the server. Please check your connection and try again.`
        } else {
          errorContent = `⚠️ **Error**\n\n${error.message}`
        }
      }

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: errorContent,
        source: 'error',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const renderMarkdown = (content: string) => {
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-base font-bold mt-3 mb-1">{line.slice(3)}</h2>
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-sm font-semibold mt-2 mb-1">{line.slice(4)}</h3>
        }
        if (line.startsWith('```')) {
          return null
        }

        let processed = line
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/^- /, '• ')

        if (line.trim() === '') {
          return <br key={i} />
        }

        return (
          <p
            key={i}
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: processed }}
          />
        )
      })
  }

  const renderSqlBlock = (sql: string) => (
    <div className="mt-3 rounded-lg overflow-hidden border border-border">
      <div className="bg-muted px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2">
        <Database className="w-3 h-3" />
        Generated SQL
      </div>
      <pre className="p-3 text-xs bg-background overflow-x-auto">
        <code className="text-foreground">{sql}</code>
      </pre>
    </div>
  )

  const renderResultsTable = (results: Message['results']) => {
    if (!results || !results.rows || results.rows.length === 0) return null

    const columns = results.columns || []
    const rows = results.rows.slice(0, 10) // Show first 10 rows

    return (
      <div className="mt-3 rounded-lg overflow-hidden border border-border">
        <div className="bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
          Results ({results.row_count || results.rows.length} rows)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50">
                {columns.map((col, i) => (
                  <th key={i} className="px-3 py-2 text-left font-medium text-foreground border-b border-border">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-muted/30">
                  {(row as unknown[]).map((cell, j) => (
                    <td key={j} className="px-3 py-2 border-b border-border text-muted-foreground">
                      {formatCellValue(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {results.rows.length > 10 && (
          <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/30">
            Showing 10 of {results.rows.length} rows
          </div>
        )}
      </div>
    )
  }

  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'number') {
      return value >= 1000000 ? `$${(value / 1000000).toFixed(1)}M` :
             value >= 1000 ? `${(value / 1000).toFixed(1)}K` :
             value.toLocaleString()
    }
    return String(value)
  }

  const renderTraceStep = (step: TraceStep, index: number) => {
    const getIcon = () => {
      switch (step.type) {
        case 'tool_call':
          return <Wrench className="w-3 h-3 text-blue-500" />
        case 'tool_result':
          return <Database className="w-3 h-3 text-green-500" />
        case 'reasoning':
          return <Cpu className="w-3 h-3 text-purple-500" />
        case 'agent_handoff':
          return <ArrowRight className="w-3 h-3 text-orange-500" />
        default:
          return <MessageSquare className="w-3 h-3 text-gray-500" />
      }
    }

    const getLabel = () => {
      switch (step.type) {
        case 'tool_call':
          return `Calling: ${step.name || 'tool'}`
        case 'tool_result':
          return 'Tool Result'
        case 'reasoning':
          return 'Thinking'
        case 'agent_handoff':
          return `Handoff to: ${step.agent || 'agent'}`
        default:
          return step.type
      }
    }

    return (
      <div key={index} className="flex items-start gap-2 py-1">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-muted-foreground">{getLabel()}</div>
          {step.content && (
            <div className="text-xs text-muted-foreground/70 truncate">{step.content}</div>
          )}
          {step.input && (
            <pre className="text-xs text-muted-foreground/70 mt-1 overflow-x-auto max-h-20">
              {JSON.stringify(step.input, null, 2)}
            </pre>
          )}
        </div>
      </div>
    )
  }

  const renderTrace = (messageId: string, trace: TraceStep[]) => {
    if (!trace || trace.length === 0) return null

    const isExpanded = expandedTraces.has(messageId)

    return (
      <div className="mt-3 border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleTrace(messageId)}
          className="w-full px-3 py-2 bg-muted/50 flex items-center gap-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          <Cpu className="w-3 h-3" />
          Agent Thinking ({trace.length} steps)
        </button>
        {isExpanded && (
          <div className="px-3 py-2 bg-background space-y-1 max-h-60 overflow-y-auto">
            {trace.map((step, i) => renderTraceStep(step, i))}
          </div>
        )}
      </div>
    )
  }

  const currentSpace = genieSpaces.find(s => s.key === selectedSpace)

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
              "fixed z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col",
              isExpanded
                ? "inset-4"
                : "right-4 top-20 bottom-4 w-[520px]"
            )}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="h-14 px-4 border-b border-border flex items-center justify-between bg-card flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-teal to-brand-teal/60 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Supply Chain AI</h3>
                  <p className="text-xs text-muted-foreground">
                    {tabs.find(t => t.id === activeTab)?.description}
                  </p>
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
            <div className="h-12 px-2 border-b border-border flex items-center gap-1 bg-background/50 flex-shrink-0">
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

            {/* Genie Space Selector */}
            {activeTab === 'genie' && genieSpaces.length > 0 && (
              <div className="px-4 py-2 border-b border-border bg-muted/30 flex-shrink-0">
                <div className="relative">
                  <button
                    onClick={() => setShowSpaceDropdown(!showSpaceDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-background border border-input rounded-lg text-sm hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-brand-teal" />
                      <span className="font-medium">{currentSpace?.name || 'Select Space'}</span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform",
                      showSpaceDropdown && "rotate-180"
                    )} />
                  </button>

                  {showSpaceDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                      {genieSpaces.map((space) => (
                        <button
                          key={space.key}
                          onClick={() => {
                            setSelectedSpace(space.key)
                            setShowSpaceDropdown(false)
                          }}
                          className={cn(
                            "w-full px-3 py-2 text-left hover:bg-accent transition-colors",
                            selectedSpace === space.key && "bg-accent"
                          )}
                        >
                          <div className="font-medium text-sm">{space.name}</div>
                          <div className="text-xs text-muted-foreground">{space.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.role === 'user'
                      ? "bg-primary/20"
                      : "bg-brand-teal/20"
                  )}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-primary" />
                    ) : (
                      <Bot className="w-4 h-4 text-brand-teal" />
                    )}
                  </div>
                  <div className={cn(
                    "flex-1 p-3 rounded-lg text-sm",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground ml-auto max-w-[85%]"
                      : "bg-accent text-foreground max-w-[95%]"
                  )}>
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {renderMarkdown(message.content)}
                        {message.sql && renderSqlBlock(message.sql)}
                        {message.results && renderResultsTable(message.results)}
                        {message.results && message.results.columns && message.results.rows && (
                          <DataVisualization
                            columns={message.results.columns}
                            rows={message.results.rows}
                          />
                        )}
                        {message.trace && renderTrace(message.id, message.trace)}
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-teal/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-brand-teal" />
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-accent text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {activeTab === 'genie' ? 'Generating SQL and querying data...' : 'Analyzing your supply chain data...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border flex-shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    activeTab === 'genie'
                      ? `Ask about ${currentSpace?.name || 'data'}...`
                      : "Ask about supply chain risks..."
                  }
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground text-center">
                {activeTab === 'multi-agent' && 'Powered by Multi-Agent Supervisor'}
                {activeTab === 'knowledge' && 'Powered by Knowledge Assistant'}
                {activeTab === 'genie' && `Querying ${currentSpace?.name || 'Genie Space'}`}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
