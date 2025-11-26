import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from 'd3-sankey'

interface SankeyNodeData {
  id: string
  name: string
  category: 'supplier' | 'material' | 'product' | 'customer'
}

interface SankeyLinkData {
  source: string
  target: string
  value: number
}

interface SankeyDiagramProps {
  nodes?: SankeyNodeData[]
  links?: SankeyLinkData[]
  height?: string
  className?: string
  onNodeClick?: (node: SankeyNodeData) => void
}

const categoryColors: Record<string, string> = {
  supplier: '#3b82f6',
  material: '#8b5cf6',
  product: '#06b6d4',
  customer: '#10b981'
}

// Default data for demonstration
const defaultNodes: SankeyNodeData[] = [
  // Suppliers
  { id: 'supp-1', name: 'Acme Electronics', category: 'supplier' },
  { id: 'supp-2', name: 'Global Components', category: 'supplier' },
  { id: 'supp-3', name: 'Pacific Materials', category: 'supplier' },
  { id: 'supp-4', name: 'Euro Parts', category: 'supplier' },
  // Materials
  { id: 'mat-1', name: 'Semiconductor IC', category: 'material' },
  { id: 'mat-2', name: 'PCB Substrate', category: 'material' },
  { id: 'mat-3', name: 'Capacitors', category: 'material' },
  { id: 'mat-4', name: 'Aluminum Housing', category: 'material' },
  // Products
  { id: 'prod-1', name: 'Controller Unit', category: 'product' },
  { id: 'prod-2', name: 'Sensor Module', category: 'product' },
  { id: 'prod-3', name: 'Power Supply', category: 'product' },
  // Customers
  { id: 'cust-1', name: 'TechCorp', category: 'customer' },
  { id: 'cust-2', name: 'Manufacturing Co', category: 'customer' },
]

const defaultLinks: SankeyLinkData[] = [
  // Supplier to Material
  { source: 'supp-1', target: 'mat-1', value: 100 },
  { source: 'supp-1', target: 'mat-2', value: 80 },
  { source: 'supp-2', target: 'mat-2', value: 60 },
  { source: 'supp-2', target: 'mat-3', value: 90 },
  { source: 'supp-3', target: 'mat-3', value: 70 },
  { source: 'supp-3', target: 'mat-4', value: 50 },
  { source: 'supp-4', target: 'mat-4', value: 40 },
  // Material to Product
  { source: 'mat-1', target: 'prod-1', value: 80 },
  { source: 'mat-1', target: 'prod-2', value: 20 },
  { source: 'mat-2', target: 'prod-1', value: 70 },
  { source: 'mat-2', target: 'prod-3', value: 70 },
  { source: 'mat-3', target: 'prod-2', value: 100 },
  { source: 'mat-3', target: 'prod-3', value: 60 },
  { source: 'mat-4', target: 'prod-1', value: 50 },
  { source: 'mat-4', target: 'prod-3', value: 40 },
  // Product to Customer
  { source: 'prod-1', target: 'cust-1', value: 120 },
  { source: 'prod-1', target: 'cust-2', value: 80 },
  { source: 'prod-2', target: 'cust-1', value: 70 },
  { source: 'prod-2', target: 'cust-2', value: 50 },
  { source: 'prod-3', target: 'cust-1', value: 90 },
  { source: 'prod-3', target: 'cust-2', value: 80 },
]

type D3SankeyNode = SankeyNode<SankeyNodeData, SankeyLinkData>
type D3SankeyLink = SankeyLink<SankeyNodeData, SankeyLinkData>

export default function SankeyDiagram({
  nodes = defaultNodes,
  links = defaultLinks,
  height = '500px',
  className = '',
  onNodeClick
}: SankeyDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return

    const container = containerRef.current
    const svg = d3.select(svgRef.current)

    // Clear previous content
    svg.selectAll('*').remove()

    const width = container.clientWidth
    const heightNum = parseInt(height)
    const margin = { top: 20, right: 150, bottom: 20, left: 150 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = heightNum - margin.top - margin.bottom

    // Create node index map
    const nodeMap = new Map(nodes.map((n, i) => [n.id, i]))

    // Convert links to use indices
    const sankeyLinks = links.map(link => ({
      source: nodeMap.get(link.source) as number,
      target: nodeMap.get(link.target) as number,
      value: link.value
    })).filter(link => link.source !== undefined && link.target !== undefined)

    // Create sankey generator
    const sankeyGenerator = sankey<SankeyNodeData, SankeyLinkData>()
      .nodeWidth(20)
      .nodePadding(15)
      .extent([[0, 0], [innerWidth, innerHeight]])

    // Generate layout
    const sankeyData = sankeyGenerator({
      nodes: nodes.map(n => ({ ...n })),
      links: sankeyLinks as any
    })

    const g = svg
      .attr('width', width)
      .attr('height', heightNum)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Draw links
    const link = g.append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(sankeyData.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d: D3SankeyLink) => {
        const sourceNode = d.source as D3SankeyNode
        return categoryColors[sourceNode.category] || '#999'
      })
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', (d: D3SankeyLink) => Math.max(1, d.width || 0))
      .style('cursor', 'pointer')

    link.on('mouseover', function() {
      d3.select(this as SVGPathElement).attr('stroke-opacity', 0.7)
    })
    link.on('mouseout', function() {
      d3.select(this as SVGPathElement).attr('stroke-opacity', 0.4)
    })

    // Add link titles
    link.append('title')
      .text((d: D3SankeyLink) => {
        const sourceNode = d.source as D3SankeyNode
        const targetNode = d.target as D3SankeyNode
        return `${sourceNode.name} → ${targetNode.name}\nValue: ${d.value}`
      })

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(sankeyData.nodes)
      .join('g')
      .style('cursor', 'pointer')

    node.append('rect')
      .attr('x', (d: D3SankeyNode) => d.x0 || 0)
      .attr('y', (d: D3SankeyNode) => d.y0 || 0)
      .attr('height', (d: D3SankeyNode) => Math.max(1, (d.y1 || 0) - (d.y0 || 0)))
      .attr('width', (d: D3SankeyNode) => (d.x1 || 0) - (d.x0 || 0))
      .attr('fill', (d: D3SankeyNode) => categoryColors[d.category] || '#999')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('rx', 3)
      .attr('ry', 3)

    node.on('mouseover', function() {
      d3.select(this as SVGGElement).select('rect').attr('stroke', '#333').attr('stroke-width', 2)
    })
    node.on('mouseout', function() {
      d3.select(this as SVGGElement).select('rect').attr('stroke', '#fff').attr('stroke-width', 1)
    })
    node.on('click', (_event: MouseEvent, d: D3SankeyNode) => {
      if (onNodeClick) {
        onNodeClick({
          id: d.id,
          name: d.name,
          category: d.category
        })
      }
    })

    // Add node labels
    node.append('text')
      .attr('x', (d: D3SankeyNode) => (d.x0 || 0) < innerWidth / 2 ? (d.x0 || 0) - 6 : (d.x1 || 0) + 6)
      .attr('y', (d: D3SankeyNode) => ((d.y1 || 0) + (d.y0 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: D3SankeyNode) => (d.x0 || 0) < innerWidth / 2 ? 'end' : 'start')
      .attr('font-size', '11px')
      .attr('fill', '#374151')
      .text((d: D3SankeyNode) => d.name)

    // Add node value
    node.append('text')
      .attr('x', (d: D3SankeyNode) => ((d.x0 || 0) + (d.x1 || 0)) / 2)
      .attr('y', (d: D3SankeyNode) => ((d.y1 || 0) + (d.y0 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('fill', '#fff')
      .attr('font-weight', 'bold')
      .text((d: D3SankeyNode) => d.value || '')

  }, [nodes, links, height, onNodeClick])

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ height }}>
      <svg ref={svgRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Flow Categories</p>
        <div className="space-y-1">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs capitalize text-gray-600 dark:text-gray-400">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
