import { useEffect, useRef, useCallback } from 'react'
import cytoscape, { Core, ElementDefinition } from 'cytoscape'
// @ts-ignore
import fcose from 'cytoscape-fcose'

// Register the fcose layout
cytoscape.use(fcose)

type Stylesheet = cytoscape.StylesheetStyle

export interface NetworkNode {
  id: string
  label: string
  type: 'supplier' | 'material' | 'product' | 'customer'
  risk?: 'critical' | 'high' | 'medium' | 'low'
  tier?: number
  value?: number
}

export interface NetworkEdge {
  source: string
  target: string
  weight?: number
  flow?: number
  capacity?: number
  label?: string
}

interface NetworkGraphProps {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
  layout?: 'fcose' | 'circle' | 'grid' | 'breadthfirst' | 'concentric'
  height?: string
  className?: string
  onNodeClick?: (node: NetworkNode) => void
  highlightPath?: string[]
  showLabels?: boolean
}

const typeColors: Record<string, string> = {
  supplier: '#3b82f6',
  material: '#8b5cf6',
  product: '#06b6d4',
  customer: '#10b981'
}

const riskColors: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e'
}

const defaultStylesheet: Stylesheet[] = [
  {
    selector: 'node',
    style: {
      'background-color': '#666',
      'label': 'data(label)',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'font-size': '10px',
      'color': '#374151',
      'text-margin-y': 5,
      'width': 30,
      'height': 30,
      'border-width': 2,
      'border-color': '#fff',
      'text-wrap': 'ellipsis',
      'text-max-width': '80px'
    }
  },
  {
    selector: 'node[type="supplier"]',
    style: {
      'background-color': typeColors.supplier,
      'shape': 'ellipse'
    }
  },
  {
    selector: 'node[type="material"]',
    style: {
      'background-color': typeColors.material,
      'shape': 'diamond'
    }
  },
  {
    selector: 'node[type="product"]',
    style: {
      'background-color': typeColors.product,
      'shape': 'rectangle'
    }
  },
  {
    selector: 'node[type="customer"]',
    style: {
      'background-color': typeColors.customer,
      'shape': 'triangle'
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
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#94a3b8',
      'target-arrow-color': '#94a3b8',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'opacity': 0.7
    }
  },
  {
    selector: 'edge.highlighted',
    style: {
      'line-color': '#3b82f6',
      'target-arrow-color': '#3b82f6',
      'width': 4,
      'opacity': 1
    }
  },
  {
    selector: 'node.highlighted',
    style: {
      'border-color': '#3b82f6',
      'border-width': 4,
      'background-opacity': 1
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-color': '#1d4ed8',
      'border-width': 4
    }
  }
]

export default function NetworkGraph({
  nodes,
  edges,
  layout = 'fcose',
  height = '500px',
  className = '',
  onNodeClick,
  highlightPath = [],
  showLabels = true
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)

  const getElements = useCallback((): ElementDefinition[] => {
    const nodeElements: ElementDefinition[] = nodes.map(node => ({
      data: {
        id: node.id,
        label: showLabels ? node.label : '',
        type: node.type,
        risk: node.risk,
        tier: node.tier,
        value: node.value
      }
    }))

    const edgeElements: ElementDefinition[] = edges.map((edge, index) => ({
      data: {
        id: `edge-${index}`,
        source: edge.source,
        target: edge.target,
        weight: edge.weight || 1,
        flow: edge.flow,
        capacity: edge.capacity,
        label: edge.label
      }
    }))

    return [...nodeElements, ...edgeElements]
  }, [nodes, edges, showLabels])

  useEffect(() => {
    if (!containerRef.current) return

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: getElements(),
      style: defaultStylesheet,
      layout: {
        name: layout,
        animate: true,
        animationDuration: 500,
        fit: true,
        padding: 50,
        // fcose specific options
        ...(layout === 'fcose' && {
          quality: 'proof',
          randomize: true,
          nodeDimensionsIncludeLabels: true,
          uniformNodeDimensions: false,
          packComponents: true,
          nodeRepulsion: 4500,
          idealEdgeLength: 100,
          edgeElasticity: 0.45,
          nestingFactor: 0.1
        })
      },
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.3
    })

    // Node click handler
    cyRef.current.on('tap', 'node', (event) => {
      const nodeData = event.target.data()
      if (onNodeClick) {
        onNodeClick({
          id: nodeData.id,
          label: nodeData.label,
          type: nodeData.type,
          risk: nodeData.risk,
          tier: nodeData.tier,
          value: nodeData.value
        })
      }
    })

    // Hover effects
    cyRef.current.on('mouseover', 'node', (event) => {
      event.target.style('cursor', 'pointer')
      containerRef.current!.style.cursor = 'pointer'
    })

    cyRef.current.on('mouseout', 'node', () => {
      containerRef.current!.style.cursor = 'default'
    })

    return () => {
      cyRef.current?.destroy()
      cyRef.current = null
    }
  }, [layout, getElements, onNodeClick])

  // Handle highlight path changes
  useEffect(() => {
    if (!cyRef.current) return

    // Remove existing highlights
    cyRef.current.elements().removeClass('highlighted')

    // Add highlights for path
    if (highlightPath.length > 0) {
      highlightPath.forEach(nodeId => {
        cyRef.current!.$(`#${nodeId}`).addClass('highlighted')
      })

      // Highlight edges between consecutive nodes in path
      for (let i = 0; i < highlightPath.length - 1; i++) {
        const source = highlightPath[i]
        const target = highlightPath[i + 1]
        cyRef.current!.edges(`[source="${source}"][target="${target}"]`).addClass('highlighted')
        cyRef.current!.edges(`[source="${target}"][target="${source}"]`).addClass('highlighted')
      }
    }
  }, [highlightPath])

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={containerRef} className="w-full h-full rounded-lg bg-gray-50 dark:bg-gray-900/50" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Node Types</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3"
                style={{
                  backgroundColor: color,
                  borderRadius: type === 'supplier' ? '50%' : type === 'material' ? '0' : type === 'product' ? '2px' : '0',
                  transform: type === 'material' ? 'rotate(45deg)' : type === 'customer' ? 'none' : 'none',
                  clipPath: type === 'customer' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
                }}
              />
              <span className="text-xs capitalize text-gray-600 dark:text-gray-400">{type}</span>
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
        <button
          onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)}
          className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Zoom in"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)}
          className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Zoom out"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
