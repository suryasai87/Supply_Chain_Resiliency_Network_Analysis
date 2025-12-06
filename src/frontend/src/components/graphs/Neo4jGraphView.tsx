import { useEffect, useRef, useState, useCallback } from 'react'
import cytoscape, { Core, ElementDefinition } from 'cytoscape'
import { Loader2, Play, ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Neo4jConfig {
  configured: boolean
  protocol?: string
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  uri?: string
}

interface GraphNode {
  id: string
  labels: string[]
  properties: Record<string, any>
}

interface GraphRelationship {
  id: string
  type: string
  startNodeId: string
  endNodeId: string
  properties: Record<string, any>
}

interface GraphData {
  nodes: GraphNode[]
  relationships: GraphRelationship[]
}

interface Neo4jGraphViewProps {
  config: Neo4jConfig | null
  onError?: (error: string) => void
}

// Color palette for different node labels
const labelColors: Record<string, string> = {
  Supplier: '#10b981',      // green
  Material: '#3b82f6',      // blue
  Product: '#8b5cf6',       // purple
  Customer: '#f59e0b',      // amber
  Part: '#ec4899',          // pink
  Location: '#06b6d4',      // cyan
  Country: '#ef4444',       // red
  default: '#6b7280'        // gray
}

const getNodeColor = (labels: string[]): string => {
  for (const label of labels) {
    if (labelColors[label]) return labelColors[label]
  }
  return labelColors.default
}

export default function Neo4jGraphView({ config, onError }: Neo4jGraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const [loading, setLoading] = useState(false)
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [query, setQuery] = useState('MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 100')
  const [nodeCount, setNodeCount] = useState(0)
  const [edgeCount, setEdgeCount] = useState(0)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return

    cyRef.current = cytoscape({
      container: containerRef.current,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '10px',
            'text-wrap': 'wrap',
            'text-max-width': '80px',
            'width': 'data(size)',
            'height': 'data(size)',
            'border-width': 2,
            'border-color': '#1e293b'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#22c55e'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#475569',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '8px',
            'color': '#94a3b8',
            'text-rotation': 'autorotate',
            'text-margin-y': -10
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#22c55e',
            'target-arrow-color': '#22c55e',
            'width': 3
          }
        }
      ],
      layout: { name: 'cose', animate: false },
      minZoom: 0.1,
      maxZoom: 3
    })

    // Node click handler
    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target
      const nodeData = node.data()
      setSelectedNode({
        id: nodeData.id,
        labels: nodeData.labels || [],
        properties: nodeData.properties || {}
      })
    })

    // Background click to deselect
    cyRef.current.on('tap', (evt) => {
      if (evt.target === cyRef.current) {
        setSelectedNode(null)
      }
    })

    return () => {
      cyRef.current?.destroy()
    }
  }, [])

  // Fetch graph data from backend
  const fetchGraphData = useCallback(async () => {
    if (!config?.configured) {
      onError?.('Neo4j not configured')
      return
    }

    setLoading(true)
    setSelectedNode(null)

    try {
      const response = await fetch('/api/neo4j/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to execute query')
      }

      const data: GraphData = await response.json()
      setGraphData(data)
      renderGraph(data)
    } catch (error) {
      console.error('Failed to fetch graph data:', error)
      onError?.(error instanceof Error ? error.message : 'Failed to fetch graph data')
    } finally {
      setLoading(false)
    }
  }, [config, query, onError])

  // Render graph data in Cytoscape
  const renderGraph = (data: GraphData) => {
    if (!cyRef.current) return

    const elements: ElementDefinition[] = []
    const nodeIds = new Set<string>()

    // Add nodes
    data.nodes.forEach(node => {
      if (!nodeIds.has(node.id)) {
        nodeIds.add(node.id)
        const label = node.properties.name || node.properties.id || node.labels[0] || 'Node'
        elements.push({
          data: {
            id: node.id,
            label: String(label).substring(0, 20),
            color: getNodeColor(node.labels),
            size: 40 + (Object.keys(node.properties).length * 2),
            labels: node.labels,
            properties: node.properties
          }
        })
      }
    })

    // Add edges
    data.relationships.forEach(rel => {
      if (nodeIds.has(rel.startNodeId) && nodeIds.has(rel.endNodeId)) {
        elements.push({
          data: {
            id: rel.id,
            source: rel.startNodeId,
            target: rel.endNodeId,
            label: rel.type,
            properties: rel.properties
          }
        })
      }
    })

    cyRef.current.elements().remove()
    cyRef.current.add(elements)

    // Run layout
    cyRef.current.layout({
      name: 'cose',
      animate: true,
      animationDuration: 500,
      nodeRepulsion: () => 8000,
      idealEdgeLength: () => 100,
      gravity: 0.25
    }).run()

    setNodeCount(data.nodes.length)
    setEdgeCount(data.relationships.length)
  }

  // Zoom controls
  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() / 1.2)
  const handleFit = () => cyRef.current?.fit(undefined, 50)
  const handleRefreshLayout = () => {
    cyRef.current?.layout({
      name: 'cose',
      animate: true,
      animationDuration: 500
    }).run()
  }

  // Sample queries
  const sampleQueries = [
    { label: 'All Nodes & Relationships', query: 'MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 100' },
    { label: 'Suppliers', query: 'MATCH (s:Supplier) RETURN s LIMIT 50' },
    { label: 'Materials', query: 'MATCH (m:Material) RETURN m LIMIT 50' },
    { label: 'Supply Chain Path', query: 'MATCH path = (s:Supplier)-[*1..3]->(p:Product) RETURN path LIMIT 50' },
    { label: 'All Connections', query: 'MATCH (n) OPTIONAL MATCH (n)-[r]-(m) RETURN n, r, m LIMIT 150' }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Query Bar */}
      <div className="p-4 border-b border-border bg-background/50 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Cypher query..."
            className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={fetchGraphData}
            disabled={loading || !config?.configured}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              config?.configured
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Query
          </button>
        </div>

        {/* Sample Queries */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">Quick queries:</span>
          {sampleQueries.map((sq) => (
            <button
              key={sq.label}
              onClick={() => setQuery(sq.query)}
              className="px-2 py-1 text-xs rounded bg-accent hover:bg-accent/80 transition-colors"
            >
              {sq.label}
            </button>
          ))}
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex-1 relative">
        <div ref={containerRef} className="absolute inset-0 bg-slate-900" />

        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFit}
            className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors"
            title="Fit to Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefreshLayout}
            className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors"
            title="Refresh Layout"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
          <span className="px-2 py-1 rounded bg-card/80 border border-border">
            Nodes: {nodeCount}
          </span>
          <span className="px-2 py-1 rounded bg-card/80 border border-border">
            Edges: {edgeCount}
          </span>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 p-3 rounded-lg bg-card/90 border border-border">
          <p className="text-xs font-medium mb-2">Node Types</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(labelColors).filter(([k]) => k !== 'default').map(([label, color]) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <div className="flex items-center gap-2 text-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading graph...</span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !graphData && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="mb-2">Click "Run Query" to load graph data</p>
              <p className="text-sm">Or select a sample query above</p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Node Panel */}
      {selectedNode && (
        <div className="p-4 border-t border-border bg-background/50">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getNodeColor(selectedNode.labels) }}
            />
            <span className="font-medium">{selectedNode.labels.join(', ')}</span>
            <span className="text-xs text-muted-foreground">ID: {selectedNode.id}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {Object.entries(selectedNode.properties).slice(0, 8).map(([key, value]) => (
              <div key={key} className="p-2 rounded bg-accent/50">
                <p className="text-xs text-muted-foreground">{key}</p>
                <p className="truncate">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
