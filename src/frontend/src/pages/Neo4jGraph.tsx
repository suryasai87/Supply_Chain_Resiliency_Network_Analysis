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
  Settings,
  Play,
  Loader2,
  Copy,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const [neodashUrl, setNeodashUrl] = useState<string>('')
  const [iframeLoading, setIframeLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Fetch Neo4j connection status
  useEffect(() => {
    fetchNeo4jStatus()
  }, [])

  const fetchNeo4jStatus = async () => {
    setLoading(true)
    try {
      // Fetch both status and neodash config
      const [statusRes, configRes] = await Promise.all([
        fetch('/api/neo4j/status'),
        fetch('/api/neo4j/neodash-config')
      ])

      const statusData = await statusRes.json()
      const configData = await configRes.json()

      setConnectionStatus(statusData)
      setNeodashConfig(configData)

      // If configured, auto-launch NeoDash
      if (configData.configured && configData.host) {
        buildNeoDashUrl(configData)
      }
    } catch (error) {
      setConnectionStatus({
        connected: false,
        message: 'Failed to connect to Neo4j API'
      })
    } finally {
      setLoading(false)
    }
  }

  const buildNeoDashUrl = (config: NeoDashConfig) => {
    if (!config.configured || !config.host) return

    // NeoDash standalone with connection parameters
    // Format: https://neodash.graphapp.io/?share&standalone=true&connection=...
    // The connection is base64 encoded JSON
    const connectionConfig = {
      protocol: config.protocol || 'neo4j+s',
      url: config.host,
      port: config.port || 7687,
      database: config.database || 'neo4j',
      username: config.username,
      password: config.password
    }

    // Base64 encode the connection config
    const encodedConnection = btoa(JSON.stringify(connectionConfig))

    // Build NeoDash URL with auto-connect
    const url = `https://neodash.graphapp.io/?share&standalone=true&connection=${encodedConnection}`
    setNeodashUrl(url)
    setIframeLoading(true)
  }

  const handleRefresh = () => {
    setNeodashUrl('')
    fetchNeo4jStatus()
  }

  const handleLaunchNeoDash = () => {
    if (neodashConfig?.configured) {
      buildNeoDashUrl(neodashConfig)
    } else {
      // Open NeoDash without auto-connect
      setNeodashUrl('https://neodash.graphapp.io/')
      setIframeLoading(true)
    }
  }

  const handleOpenNeo4jConsole = () => {
    window.open('https://console.neo4j.io', '_blank')
  }

  const handleOpenNeoDashNewTab = () => {
    if (neodashUrl) {
      window.open(neodashUrl, '_blank')
    } else {
      window.open('https://neodash.graphapp.io/', '_blank')
    }
  }

  const copyConnectionString = async () => {
    if (connectionStatus?.instance?.uri) {
      await navigator.clipboard.writeText(connectionStatus.instance.uri)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            Neo4j Graph Explorer
          </h1>
          <p className="text-muted-foreground mt-1">
            Explore supply chain relationships using Neo4j graph database and NeoDash visualizations
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

      {/* Connection Status & Instance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Connection Status Card */}
        <motion.div
          className="p-6 rounded-xl bg-card border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Server className="w-4 h-4 text-muted-foreground" />
              Connection Status
            </h3>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : connectionStatus?.connected ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Checking Neo4j connection...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className={cn(
                "text-sm font-medium",
                connectionStatus?.connected ? "text-green-500" : "text-red-500"
              )}>
                {connectionStatus?.connected ? 'Connected' : 'Disconnected'}
              </div>
              <p className="text-sm text-muted-foreground">
                {connectionStatus?.message || 'Neo4j Aura'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Instance Info Card */}
        <motion.div
          className="p-6 rounded-xl bg-card border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              Instance Details
            </h3>
          </div>

          {connectionStatus?.instance ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium text-foreground">{connectionStatus.instance.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={cn(
                  "text-sm font-medium px-2 py-0.5 rounded-full",
                  connectionStatus.instance.status === 'running' ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                )}>
                  {connectionStatus.instance.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="text-sm font-medium text-foreground">{connectionStatus.instance.database}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Host</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-foreground truncate max-w-[120px]">{connectionStatus.instance.host}</span>
                  <button
                    onClick={copyConnectionString}
                    className="p-1 hover:bg-accent rounded transition-colors"
                    title="Copy connection URI"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading instance details...' : 'No instance configured'}
            </p>
          )}
        </motion.div>

        {/* Quick Actions Card */}
        <motion.div
          className="p-6 rounded-xl bg-card border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              Quick Actions
            </h3>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleLaunchNeoDash}
              disabled={!connectionStatus?.connected}
              className={cn(
                "w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border",
                connectionStatus?.connected
                  ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
                  : "bg-muted text-muted-foreground border-border cursor-not-allowed"
              )}
            >
              <Play className="w-4 h-4" />
              {neodashUrl ? 'Reconnect NeoDash' : 'Launch NeoDash'}
            </button>
            <button
              onClick={handleOpenNeoDashNewTab}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border hover:bg-accent transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </button>
          </div>
        </motion.div>
      </div>

      {/* NeoDash iFrame */}
      <motion.div
        className="rounded-xl bg-card border border-border overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/50">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Database className="w-5 h-5 text-green-500" />
            NeoDash Graph Visualization
          </h2>
          <div className="flex items-center gap-2">
            {iframeLoading && (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading NeoDash...
              </span>
            )}
            {neodashConfig?.configured && (
              <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                Auto-connected
              </span>
            )}
          </div>
        </div>

        <div className="relative" style={{ height: 'calc(100vh - 420px)', minHeight: '500px' }}>
          {neodashUrl ? (
            <iframe
              src={neodashUrl}
              className="w-full h-full border-0"
              title="NeoDash Graph Visualization"
              onLoad={() => setIframeLoading(false)}
              allow="clipboard-write"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-background">
              <div className="text-center">
                <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {connectionStatus?.connected ? 'Ready to Explore' : 'Connect to Neo4j'}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  {connectionStatus?.connected
                    ? `Connected to ${connectionStatus.instance?.name || 'Neo4j'}. Click "Launch NeoDash" to start exploring your graph data.`
                    : 'Configure your Neo4j credentials to enable graph visualization.'
                  }
                </p>
                {connectionStatus?.connected && (
                  <button
                    onClick={handleLaunchNeoDash}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Launch NeoDash
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Connection Info */}
      {connectionStatus?.connected && connectionStatus.instance && (
        <motion.div
          className="rounded-xl bg-card border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-semibold text-foreground mb-4">Connection Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-background border border-border">
              <p className="text-xs text-muted-foreground mb-1">Connection URI</p>
              <p className="text-sm font-mono text-foreground truncate">{connectionStatus.instance.uri}</p>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border">
              <p className="text-xs text-muted-foreground mb-1">Database</p>
              <p className="text-sm font-medium text-foreground">{connectionStatus.instance.database}</p>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border">
              <p className="text-xs text-muted-foreground mb-1">Instance ID</p>
              <p className="text-sm font-mono text-foreground">{connectionStatus.instance.id}</p>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className="text-sm font-medium text-green-500">{connectionStatus.instance.status}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
