import { useEffect, useRef } from 'react'
import cytoscape, { Core, ElementDefinition } from 'cytoscape'
// @ts-ignore
import fcose from 'cytoscape-fcose'

cytoscape.use(fcose)

type Stylesheet = cytoscape.StylesheetStyle

export interface FlowNode {
  id: string
  label: string
  type: 'source' | 'sink' | 'intermediate'
}

export interface FlowEdge {
  source: string
  target: string
  capacity: number
  flow: number
}

interface FlowNetworkProps {
  nodes?: FlowNode[]
  edges?: FlowEdge[]
  maxFlow?: number
  height?: string
  className?: string
  onEdgeClick?: (edge: FlowEdge) => void
}

const defaultNodes: FlowNode[] = [
  { id: 'source', label: 'SUPP-001', type: 'source' },
  { id: 'mat-1', label: 'MAT-012', type: 'intermediate' },
  { id: 'mat-2', label: 'MAT-045', type: 'intermediate' },
  { id: 'mat-3', label: 'MAT-089', type: 'intermediate' },
  { id: 'prod-1', label: 'PROD-001', type: 'intermediate' },
  { id: 'prod-2', label: 'PROD-003', type: 'intermediate' },
  { id: 'sink', label: 'CUST-001', type: 'sink' },
]

const defaultEdges: FlowEdge[] = [
  { source: 'source', target: 'mat-1', capacity: 3000, flow: 2000 },
  { source: 'source', target: 'mat-2', capacity: 2500, flow: 2500 },
  { source: 'source', target: 'mat-3', capacity: 1500, flow: 920 },
  { source: 'mat-1', target: 'prod-1', capacity: 2000, flow: 2000 },
  { source: 'mat-2', target: 'prod-1', capacity: 1500, flow: 1500 },
  { source: 'mat-2', target: 'prod-2', capacity: 1000, flow: 1000 },
  { source: 'mat-3', target: 'prod-2', capacity: 1200, flow: 920 },
  { source: 'prod-1', target: 'sink', capacity: 4000, flow: 3500 },
  { source: 'prod-2', target: 'sink', capacity: 2500, flow: 1920 },
]

const typeColors: Record<string, string> = {
  source: '#22c55e',
  sink: '#ef4444',
  intermediate: '#3b82f6'
}

const getEdgeColor = (utilization: number): string => {
  if (utilization >= 100) return '#ef4444'
  if (utilization >= 90) return '#f97316'
  if (utilization >= 70) return '#eab308'
  return '#22c55e'
}

const stylesheet: Stylesheet[] = [
  {
    selector: 'node',
    style: {
      'background-color': '#3b82f6',
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': '10px',
      'color': '#fff',
      'font-weight': 'bold',
      'width': 60,
      'height': 60,
      'border-width': 3,
      'border-color': '#fff',
      'text-wrap': 'wrap',
      'text-max-width': '55px'
    }
  },
  {
    selector: 'node[type="source"]',
    style: {
      'background-color': typeColors.source,
      'shape': 'ellipse',
      'width': 70,
      'height': 70
    }
  },
  {
    selector: 'node[type="sink"]',
    style: {
      'background-color': typeColors.sink,
      'shape': 'ellipse',
      'width': 70,
      'height': 70
    }
  },
  {
    selector: 'node[type="intermediate"]',
    style: {
      'background-color': typeColors.intermediate,
      'shape': 'roundrectangle'
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 'data(width)',
      'line-color': 'data(color)',
      'target-arrow-color': 'data(color)',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'label': 'data(flowLabel)',
      'font-size': '9px',
      'color': '#374151',
      'text-rotation': 'autorotate',
      'text-margin-y': -10,
      'text-background-color': '#fff',
      'text-background-opacity': 0.8,
      'text-background-padding': '2px'
    }
  },
  {
    selector: 'edge.bottleneck',
    style: {
      'line-style': 'dashed'
    }
  }
]

export default function FlowNetwork({
  nodes = defaultNodes,
  edges = defaultEdges,
  maxFlow = 5420,
  height = '500px',
  className = '',
  onEdgeClick
}: FlowNetworkProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const elements: ElementDefinition[] = [
      ...nodes.map(node => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type
        }
      })),
      ...edges.map((edge, index) => {
        const utilization = (edge.flow / edge.capacity) * 100
        return {
          data: {
            id: `edge-${index}`,
            source: edge.source,
            target: edge.target,
            capacity: edge.capacity,
            flow: edge.flow,
            width: Math.max(2, Math.min(12, edge.flow / 300)),
            color: getEdgeColor(utilization),
            flowLabel: `${edge.flow}/${edge.capacity}`,
            utilization
          },
          classes: utilization >= 100 ? 'bottleneck' : ''
        }
      })
    ]

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: stylesheet,
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 50,
        spacingFactor: 1.5,
        animate: true,
        animationDuration: 500
      },
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.3
    })

    // Edge click handler
    cyRef.current.on('tap', 'edge', (event) => {
      const edgeData = event.target.data()
      if (onEdgeClick) {
        onEdgeClick({
          source: edgeData.source,
          target: edgeData.target,
          capacity: edgeData.capacity,
          flow: edgeData.flow
        })
      }
    })

    return () => {
      cyRef.current?.destroy()
      cyRef.current = null
    }
  }, [nodes, edges, onEdgeClick])

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={containerRef} className="w-full h-full rounded-lg bg-gray-50 dark:bg-gray-900/50" />

      {/* Max Flow Display */}
      <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-900/95 rounded-lg p-4 shadow-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Maximum Flow</p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {maxFlow.toLocaleString()}
          <span className="text-sm font-normal text-gray-500 ml-1">units/day</span>
        </p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Node Types</p>
        <div className="space-y-1 mb-3">
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs capitalize text-gray-600 dark:text-gray-400">{type}</span>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Edge Utilization</p>
        <div className="space-y-1">
          {[
            { label: '100% (Bottleneck)', color: '#ef4444' },
            { label: '90-99%', color: '#f97316' },
            { label: '70-89%', color: '#eab308' },
            { label: '<70%', color: '#22c55e' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-6 h-1 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
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
