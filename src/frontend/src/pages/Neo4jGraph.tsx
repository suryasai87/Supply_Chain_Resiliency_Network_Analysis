import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Database,
  RefreshCw,
  ExternalLink,
  Server,
  Activity,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Copy,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Neo4jGraphView from '@/components/graphs/Neo4jGraphView'

interface Neo4jInstance {
  id: string
  name: string
  status: string
  host: string
  database: string
  uri: string
}

interface ConnectionStatus {
  connected: boolean
  message: string
  instance?: Neo4jInstance
}

interface NeoDashConfig {
  configured: boolean
  protocol?: string
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  uri?: string
  message?: string
}

export default function Neo4jGraph() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  const [neodashConfig, setNeodashConfig] = useState<NeoDashConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch Neo4j connection status
  useEffect(() => {
    fetchNeo4jStatus()
  }, [])

  const fetchNeo4jStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statusRes, configRes] = await Promise.all([
        fetch('/api/neo4j/status'),
        fetch('/api/neo4j/neodash-config')
      ])

      const statusData = await statusRes.json()
      const configData = await configRes.json()

      setConnectionStatus(statusData)
      setNeodashConfig(configData)
    } catch (err) {
      setConnectionStatus({
        connected: false,
        message: 'Failed to connect to Neo4j API'
      })
      setError('Failed to fetch connection status')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchNeo4jStatus()
  }

  const handleOpenNeo4jConsole = () => {
    window.open('https://console.neo4j.io', '_blank')
  }

  const copyConnectionString = async () => {
    if (connectionStatus?.instance?.uri) {
      await navigator.clipboard.writeText(connectionStatus.instance.uri)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleGraphError = (errorMsg: string) => {
    setError(errorMsg)
  }

  return (
    <motion.div
      className="space-y-4 h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            Neo4j Graph Explorer
          </h1>
          <p className="text-muted-foreground mt-1">
            Query and visualize your Neo4j graph database
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border hover:bg-accent transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </button>
          <button
            onClick={handleOpenNeo4jConsole}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Neo4j Console
          </button>
        </div>
      </div>

      {/* Connection Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-shrink-0">
        {/* Connection Status Card */}
        <motion.div
          className="p-4 rounded-xl bg-card border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Server className="w-4 h-4 text-muted-foreground" />
              Connection
            </h3>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : connectionStatus?.connected ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>

          {loading ? (
            <span className="text-sm text-muted-foreground">Connecting...</span>
          ) : (
            <div className="space-y-1">
              <div className={cn(
                "text-sm font-medium",
                connectionStatus?.connected ? "text-green-500" : "text-red-500"
              )}>
                {connectionStatus?.connected ? 'Connected' : 'Disconnected'}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {connectionStatus?.message || 'Neo4j Aura'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Instance Info Card */}
        <motion.div
          className="p-4 rounded-xl bg-card border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-muted-foreground" />
              Instance
            </h3>
          </div>

          {connectionStatus?.instance ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Name</span>
                <span className="text-xs font-medium text-foreground">{connectionStatus.instance.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Database</span>
                <span className="text-xs font-medium text-foreground">{connectionStatus.instance.database}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Host</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-foreground truncate max-w-[100px]">
                    {connectionStatus.instance.host}
                  </span>
                  <button
                    onClick={copyConnectionString}
                    className="p-0.5 hover:bg-accent rounded transition-colors"
                    title="Copy URI"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {loading ? 'Loading...' : 'Not configured'}
            </p>
          )}
        </motion.div>

        {/* Status Card */}
        <motion.div
          className="p-4 rounded-xl bg-card border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Database className="w-4 h-4 text-muted-foreground" />
              Status
            </h3>
          </div>

          {error ? (
            <div className="text-xs text-red-500">{error}</div>
          ) : connectionStatus?.connected ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-500">Ready to query</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a Cypher query below to explore your graph
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Configure Neo4j credentials to enable queries
            </p>
          )}
        </motion.div>
      </div>

      {/* Graph Visualization */}
      <motion.div
        className="flex-1 rounded-xl bg-card border border-border overflow-hidden min-h-[500px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Neo4jGraphView
          config={neodashConfig}
          onError={handleGraphError}
        />
      </motion.div>
    </motion.div>
  )
}
