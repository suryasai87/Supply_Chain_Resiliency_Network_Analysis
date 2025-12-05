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
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Neo4jInstance {
  id: string
  name: string
  status: string
  connection_url: string
  region: string
  memory: string
  storage: string
  cloud_provider: string
}

interface ConnectionStatus {
  connected: boolean
  message: string
  instance?: Neo4jInstance
}

export default function Neo4jGraph() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [instances, setInstances] = useState<Neo4jInstance[]>([])
  const [selectedInstance, setSelectedInstance] = useState<Neo4jInstance | null>(null)
  const [neodashUrl, setNeodashUrl] = useState<string>('')
  const [iframeLoading, setIframeLoading] = useState(false)

  // Fetch Neo4j connection status and instances
  useEffect(() => {
    fetchNeo4jStatus()
  }, [])

  const fetchNeo4jStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/neo4j/status')
      const data = await response.json()
      setConnectionStatus(data)
      if (data.instances) {
        setInstances(data.instances)
        if (data.instances.length > 0) {
          setSelectedInstance(data.instances[0])
          // Set default NeoDash URL with instance connection
          setNeodashUrl(`https://neodash.graphapp.io/?share&dashboardDatabase=${data.instances[0].name}`)
        }
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

  const handleRefresh = () => {
    fetchNeo4jStatus()
  }

  const handleLaunchNeoDash = () => {
    if (selectedInstance) {
      setIframeLoading(true)
      // NeoDash standalone URL - user can connect to their instance
      setNeodashUrl('https://neodash.graphapp.io/')
    }
  }

  const handleOpenNeo4jConsole = () => {
    window.open('https://console-preview.neo4j.io/projects/c140d01a-eba1-4360-937b-173fd661595d/instances', '_blank')
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
            Open Neo4j Console
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
              <span>Connecting to Neo4j Aura...</span>
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
                {connectionStatus?.message || 'Neo4j Aura API'}
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

          {selectedInstance ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium text-foreground">{selectedInstance.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={cn(
                  "text-sm font-medium px-2 py-0.5 rounded-full",
                  selectedInstance.status === 'running' ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                )}>
                  {selectedInstance.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Region</span>
                <span className="text-sm font-medium text-foreground">{selectedInstance.region || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading instance details...' : 'No instances found'}
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
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors border border-green-500/20"
            >
              <Play className="w-4 h-4" />
              Launch NeoDash
            </button>
            <button
              onClick={handleOpenNeo4jConsole}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border hover:bg-accent transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Manage in Console
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
            <a
              href="https://neodash.graphapp.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Open in New Tab
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="relative" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
          {neodashUrl ? (
            <iframe
              src={neodashUrl}
              className="w-full h-full border-0"
              title="NeoDash Graph Visualization"
              onLoad={() => setIframeLoading(false)}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-background">
              <div className="text-center">
                <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Connect to Neo4j
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Click "Launch NeoDash" to open the graph visualization tool.
                  You'll need to connect using your Neo4j Aura credentials.
                </p>
                <button
                  onClick={handleLaunchNeoDash}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Launch NeoDash
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Help Section */}
      <motion.div
        className="rounded-xl bg-card border border-border p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-semibold text-foreground mb-4">Getting Started with Neo4j</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-background border border-border">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
              <span className="text-blue-500 font-bold">1</span>
            </div>
            <h4 className="font-medium text-foreground mb-1">Connect Your Database</h4>
            <p className="text-sm text-muted-foreground">
              Use your Neo4j Aura connection URL and credentials to connect NeoDash to your graph database.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-background border border-border">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
              <span className="text-green-500 font-bold">2</span>
            </div>
            <h4 className="font-medium text-foreground mb-1">Create Visualizations</h4>
            <p className="text-sm text-muted-foreground">
              Build interactive dashboards with charts, graphs, maps, and tables using Cypher queries.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-background border border-border">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
              <span className="text-purple-500 font-bold">3</span>
            </div>
            <h4 className="font-medium text-foreground mb-1">Explore Relationships</h4>
            <p className="text-sm text-muted-foreground">
              Discover hidden patterns in your supply chain data through graph traversals and analytics.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
