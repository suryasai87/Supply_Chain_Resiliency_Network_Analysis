import { useEffect, useRef, useState } from 'react'
import cytoscape, { Core, ElementDefinition } from 'cytoscape'
// @ts-ignore
import fcose from 'cytoscape-fcose'

cytoscape.use(fcose)

type Stylesheet = cytoscape.StylesheetStyle

export interface TierNode {
  id: string
  label: string
  tier: number
  risk?: 'critical' | 'high' | 'medium' | 'low'
  isHidden?: boolean
}

export interface TierEdge {
  source: string
  target: string
  weight?: number
}

interface TierNetworkProps {
  nodes?: TierNode[]
  edges?: TierEdge[]
  height?: string
  className?: string
  onNodeClick?: (node: TierNode) => void
  showHiddenDependencies?: boolean
}

const defaultNodes: TierNode[] = [
  // Tier 1
  { id: 't1-1', label: 'Acme Electronics', tier: 1, risk: 'medium' },
  { id: 't1-2', label: 'Global Components', tier: 1, risk: 'high' },
  { id: 't1-3', label: 'Pacific Materials', tier: 1, risk: 'low' },
  { id: 't1-4', label: 'Euro Parts', tier: 1, risk: 'low' },
  // Tier 2
  { id: 't2-1', label: 'Shenzhen Semi', tier: 2, risk: 'critical' },
  { id: 't2-2', label: 'Taiwan Foundry', tier: 2, risk: 'critical' },
  { id: 't2-3', label: 'Korea Chem', tier: 2, risk: 'high' },
  { id: 't2-4', label: 'Vietnam Assembly', tier: 2, risk: 'medium' },
  { id: 't2-5', label: 'India Tech', tier: 2, risk: 'medium' },
  // Tier 3
  { id: 't3-1', label: 'Rare Earth Co', tier: 3, risk: 'critical', isHidden: true },
  { id: 't3-2', label: 'Mining Corp', tier: 3, risk: 'high' },
  { id: 't3-3', label: 'Chemical Base', tier: 3, risk: 'medium' },
  { id: 't3-4', label: 'Raw Materials', tier: 3, risk: 'low' },
  // Hidden Dependencies
  { id: 'hidden-1', label: 'Single Source X', tier: 4, risk: 'critical', isHidden: true },
]

const defaultEdges: TierEdge[] = [
  // Tier 1 to Tier 2
  { source: 't1-1', target: 't2-1', weight: 100 },
  { source: 't1-1', target: 't2-2', weight: 80 },
  { source: 't1-2', target: 't2-2', weight: 90 },
  { source: 't1-2', target: 't2-3', weight: 60 },
  { source: 't1-3', target: 't2-4', weight: 70 },
  { source: 't1-3', target: 't2-5', weight: 50 },
  { source: 't1-4', target: 't2-5', weight: 40 },
  // Tier 2 to Tier 3
  { source: 't2-1', target: 't3-1', weight: 100 },
  { source: 't2-1', target: 't3-2', weight: 60 },
  { source: 't2-2', target: 't3-1', weight: 90 },
  { source: 't2-3', target: 't3-2', weight: 70 },
  { source: 't2-3', target: 't3-3', weight: 50 },
  { source: 't2-4', target: 't3-3', weight: 60 },
  { source: 't2-5', target: 't3-4', weight: 40 },
  // Hidden dependencies
  { source: 't3-1', target: 'hidden-1', weight: 100 },
  { source: 't3-2', target: 'hidden-1', weight: 80 },
]

const tierColors: Record<number, string> = {
  1: '#3b82f6',
  2: '#8b5cf6',
  3: '#f97316',
  4: '#ef4444'
}

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
      'background-color': '#666',
      'label': 'data(label)',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'font-size': '9px',
      'color': '#374151',
      'text-margin-y': 5,
      'width': 40,
      'height': 40,
      'border-width': 3,
      'border-color': '#fff',
      'text-wrap': 'ellipsis',
      'text-max-width': '70px'
    }
  },
  {
    selector: 'node[tier=1]',
    style: {
      'background-color': tierColors[1],
      'width': 50,
      'height': 50
    }
  },
  {
    selector: 'node[tier=2]',
    style: {
      'background-color': tierColors[2],
      'width': 45,
      'height': 45
    }
  },
  {
    selector: 'node[tier=3]',
    style: {
      'background-color': tierColors[3],
      'width': 40,
      'height': 40
    }
  },
  {
    selector: 'node[tier=4]',
    style: {
      'background-color': tierColors[4],
      'width': 50,
      'height': 50,
      'shape': 'star'
    }
  },
  {
    selector: 'node[isHidden]',
    style: {
      'border-style': 'dashed'
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
      'width': 2,
      'line-color': '#94a3b8',
      'target-arrow-color': '#94a3b8',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'opacity': 0.5
    }
  },
  {
    selector: 'edge[?hidden]',
    style: {
      'line-style': 'dashed',
      'line-color': '#ef4444',
      'target-arrow-color': '#ef4444'
    }
  }
]

export default function TierNetwork({
  nodes = defaultNodes,
  edges = defaultEdges,
  height = '500px',
  className = '',
  onNodeClick,
  showHiddenDependencies = true
}: TierNetworkProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const [selectedNode, setSelectedNode] = useState<TierNode | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const filteredNodes = showHiddenDependencies
      ? nodes
      : nodes.filter(n => !n.isHidden)

    const filteredEdges = showHiddenDependencies
      ? edges
      : edges.filter(e => {
          const sourceNode = nodes.find(n => n.id === e.source)
          const targetNode = nodes.find(n => n.id === e.target)
          return sourceNode && targetNode && !sourceNode.isHidden && !targetNode.isHidden
        })

    const elements: ElementDefinition[] = [
      ...filteredNodes.map(node => ({
        data: {
          id: node.id,
          label: node.label,
          tier: node.tier,
          risk: node.risk,
          isHidden: node.isHidden
        }
      })),
      ...filteredEdges.map((edge, index) => {
        const targetNode = nodes.find(n => n.id === edge.target)
        return {
          data: {
            id: `edge-${index}`,
            source: edge.source,
            target: edge.target,
            weight: edge.weight,
            hidden: targetNode?.isHidden
          }
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
        spacingFactor: 1.2,
        animate: true,
        animationDuration: 500,
        roots: filteredNodes.filter(n => n.tier === 1).map(n => `#${n.id}`)
      },
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.3
    })

    // Node click handler
    cyRef.current.on('tap', 'node', (event) => {
      const nodeData = event.target.data()
      const node: TierNode = {
        id: nodeData.id,
        label: nodeData.label,
        tier: nodeData.tier,
        risk: nodeData.risk,
        isHidden: nodeData.isHidden
      }
      setSelectedNode(node)
      if (onNodeClick) {
        onNodeClick(node)
      }
    })

    // Background click to deselect
    cyRef.current.on('tap', (event) => {
      if (event.target === cyRef.current) {
        setSelectedNode(null)
      }
    })

    return () => {
      cyRef.current?.destroy()
      cyRef.current = null
    }
  }, [nodes, edges, showHiddenDependencies, onNodeClick])

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={containerRef} className="w-full h-full rounded-lg bg-gray-50 dark:bg-gray-900/50" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Supplier Tiers</p>
        <div className="space-y-1 mb-3">
          {Object.entries(tierColors).map(([tier, color]) => (
            <div key={tier} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 ${tier === '4' ? '' : 'rounded-full'}`}
                style={{
                  backgroundColor: color,
                  clipPath: tier === '4' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : undefined
                }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {tier === '4' ? 'Hidden' : `Tier ${tier}`}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Risk Level</p>
        <div className="space-y-1">
          {Object.entries(riskColors).map(([risk, color]) => (
            <div key={risk} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border-2"
                style={{ borderColor: color }}
              />
              <span className="text-xs capitalize text-gray-600 dark:text-gray-400">{risk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-900/95 rounded-lg p-4 shadow-lg max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{selectedNode.label}</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tier:</span>
              <span
                className="font-semibold px-2 py-0.5 rounded text-white text-xs"
                style={{ backgroundColor: tierColors[selectedNode.tier] }}
              >
                {selectedNode.tier === 4 ? 'Hidden' : `Tier ${selectedNode.tier}`}
              </span>
            </div>
            {selectedNode.risk && (
              <div className="flex justify-between">
                <span className="text-gray-500">Risk:</span>
                <span
                  className="font-semibold capitalize"
                  style={{ color: riskColors[selectedNode.risk] }}
                >
                  {selectedNode.risk}
                </span>
              </div>
            )}
            {selectedNode.isHidden && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
                Hidden dependency detected
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
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
