import { useEffect, useRef } from 'react'
import cytoscape, { Core, ElementDefinition, Stylesheet } from 'cytoscape'

export interface BipartiteNode {
  id: string
  label: string
  side: 'left' | 'right'
  value?: number
  risk?: 'critical' | 'high' | 'medium' | 'low'
}

export interface BipartiteEdge {
  source: string
  target: string
  weight?: number
}

interface BipartiteGraphProps {
  leftNodes: BipartiteNode[]
  rightNodes: BipartiteNode[]
  edges: BipartiteEdge[]
  leftLabel?: string
  rightLabel?: string
  height?: string
  className?: string
  onNodeClick?: (node: BipartiteNode) => void
}

const defaultLeftNodes: BipartiteNode[] = [
  { id: 'mat-1', label: 'Semiconductor IC', side: 'left', value: 87, risk: 'critical' },
  { id: 'mat-2', label: 'PCB Substrate', side: 'left', value: 68, risk: 'high' },
  { id: 'mat-3', label: 'Capacitor Array', side: 'left', value: 72, risk: 'medium' },
  { id: 'mat-4', label: 'Aluminum Housing', side: 'left', value: 54, risk: 'low' },
  { id: 'mat-5', label: 'Battery Cell', side: 'left', value: 49, risk: 'high' },
]

const defaultRightNodes: BipartiteNode[] = [
  { id: 'part-1', label: 'Controller Unit', side: 'right', value: 82 },
  { id: 'part-2', label: 'Sensor Module', side: 'right', value: 45 },
  { id: 'part-3', label: 'Power Supply', side: 'right', value: 78 },
  { id: 'part-4', label: 'Display Assembly', side: 'right', value: 34 },
  { id: 'part-5', label: 'Battery Pack', side: 'right', value: 56 },
]

const defaultEdges: BipartiteEdge[] = [
  { source: 'mat-1', target: 'part-1', weight: 100 },
  { source: 'mat-1', target: 'part-2', weight: 50 },
  { source: 'mat-2', target: 'part-1', weight: 80 },
  { source: 'mat-2', target: 'part-3', weight: 60 },
  { source: 'mat-3', target: 'part-1', weight: 70 },
  { source: 'mat-3', target: 'part-2', weight: 90 },
  { source: 'mat-3', target: 'part-4', weight: 40 },
  { source: 'mat-4', target: 'part-3', weight: 50 },
  { source: 'mat-4', target: 'part-4', weight: 30 },
  { source: 'mat-5', target: 'part-5', weight: 100 },
  { source: 'mat-5', target: 'part-3', weight: 45 },
]

const riskColors: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e'
}

const stylesheet: Stylesheet[] = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': '10px',
      'color': '#fff',
      'font-weight': 'bold',
      'width': 50,
      'height': 50,
      'border-width': 3,
      'border-color': '#fff',
      'text-wrap': 'wrap',
      'text-max-width': '45px'
    }
  },
  {
    selector: 'node[side="left"]',
    style: {
      'background-color': '#8b5cf6',
      'shape': 'diamond'
    }
  },
  {
    selector: 'node[side="right"]',
    style: {
      'background-color': '#06b6d4',
      'shape': 'roundrectangle'
    }
  },
  {
    selector: 'node[risk="critical"]',
    style: {
      'border-color': riskColors.critical,
      'border-width': 4
    }
  },
  {
    selector: 'node[risk="high"]',
    style: {
      'border-color': riskColors.high,
      'border-width': 3
    }
  },
  {
    selector: 'node[risk="medium"]',
    style: {
      'border-color': riskColors.medium,
      'border-width': 2
    }
  },
  {
    selector: 'node[risk="low"]',
    style: {
      'border-color': riskColors.low,
      'border-width': 2
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 'data(width)',
      'line-color': '#94a3b8',
      'opacity': 0.6,
      'curve-style': 'unbundled-bezier',
      'control-point-distances': [40],
      'control-point-weights': [0.5]
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-color': '#1d4ed8',
      'border-width': 4
    }
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#3b82f6',
      'opacity': 1
    }
  }
]

export default function BipartiteGraph({
  leftNodes = defaultLeftNodes,
  rightNodes = defaultRightNodes,
  edges = defaultEdges,
  leftLabel = 'Materials',
  rightLabel = 'Parts',
  height = '500px',
  className = '',
  onNodeClick
}: BipartiteGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = parseInt(height)
    const padding = 80
    const leftX = padding
    const rightX = containerWidth - padding

    // Position nodes
    const leftSpacing = (containerHeight - 2 * padding) / (leftNodes.length - 1 || 1)
    const rightSpacing = (containerHeight - 2 * padding) / (rightNodes.length - 1 || 1)

    const elements: ElementDefinition[] = [
      ...leftNodes.map((node, index) => ({
        data: {
          id: node.id,
          label: node.label,
          side: node.side,
          value: node.value,
          risk: node.risk
        },
        position: {
          x: leftX,
          y: padding + index * leftSpacing
        }
      })),
      ...rightNodes.map((node, index) => ({
        data: {
          id: node.id,
          label: node.label,
          side: node.side,
          value: node.value,
          risk: node.risk
        },
        position: {
          x: rightX,
          y: padding + index * rightSpacing
        }
      })),
      ...edges.map((edge, index) => ({
        data: {
          id: `edge-${index}`,
          source: edge.source,
          target: edge.target,
          width: Math.max(1, Math.min(8, (edge.weight || 50) / 20))
        }
      }))
    ]

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: stylesheet,
      layout: { name: 'preset' },
      minZoom: 0.5,
      maxZoom: 2,
      wheelSensitivity: 0.3,
      userPanningEnabled: true,
      userZoomingEnabled: true,
      boxSelectionEnabled: false,
      autoungrabify: false
    })

    // Node click handler
    cyRef.current.on('tap', 'node', (event) => {
      const nodeData = event.target.data()
      if (onNodeClick) {
        onNodeClick({
          id: nodeData.id,
          label: nodeData.label,
          side: nodeData.side,
          value: nodeData.value,
          risk: nodeData.risk
        })
      }
    })

    // Highlight connected edges on node hover
    cyRef.current.on('mouseover', 'node', (event) => {
      const node = event.target
      node.connectedEdges().style({ 'line-color': '#3b82f6', 'opacity': 1 })
    })

    cyRef.current.on('mouseout', 'node', (event) => {
      const node = event.target
      node.connectedEdges().style({ 'line-color': '#94a3b8', 'opacity': 0.6 })
    })

    return () => {
      cyRef.current?.destroy()
      cyRef.current = null
    }
  }, [leftNodes, rightNodes, edges, height, onNodeClick])

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={containerRef} className="w-full h-full rounded-lg bg-gray-50 dark:bg-gray-900/50" />

      {/* Column Labels */}
      <div className="absolute top-2 left-0 right-0 flex justify-between px-12">
        <div className="bg-purple-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {leftLabel}
        </div>
        <div className="bg-cyan-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {rightLabel}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Risk Levels</p>
        <div className="space-y-1">
          {Object.entries(riskColors).map(([risk, color]) => (
            <div key={risk} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded border-2"
                style={{ borderColor: color, backgroundColor: 'transparent' }}
              />
              <span className="text-xs capitalize text-gray-600 dark:text-gray-400">{risk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-12 right-4 flex flex-col gap-2">
        <button
          onClick={() => cyRef.current?.fit()}
          className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Fit to screen"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    </div>
  )
}
