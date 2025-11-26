import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface SupplierLocation {
  id: string
  name: string
  lat: number
  lng: number
  risk: 'critical' | 'high' | 'medium' | 'low'
  materials?: number
  tier?: number
}

interface SupplyChainMapProps {
  suppliers?: SupplierLocation[]
  showFlows?: boolean
  height?: string
  className?: string
}

const defaultSuppliers: SupplierLocation[] = [
  { id: 'SUPP-001', name: 'Acme Electronics', lat: 31.2304, lng: 121.4737, risk: 'critical', materials: 15, tier: 1 },
  { id: 'SUPP-002', name: 'Global Components', lat: 25.0330, lng: 121.5654, risk: 'high', materials: 8, tier: 1 },
  { id: 'SUPP-003', name: 'Pacific Materials', lat: 21.0285, lng: 105.8542, risk: 'medium', materials: 12, tier: 1 },
  { id: 'SUPP-004', name: 'Euro Parts GmbH', lat: 52.5200, lng: 13.4050, risk: 'low', materials: 6, tier: 1 },
  { id: 'SUPP-005', name: 'US Components Inc', lat: 37.7749, lng: -122.4194, risk: 'low', materials: 10, tier: 1 },
  { id: 'SUPP-006', name: 'Shenzhen Electronics', lat: 22.5431, lng: 114.0579, risk: 'critical', materials: 20, tier: 2 },
  { id: 'SUPP-007', name: 'Korea Tech', lat: 37.5665, lng: 126.9780, risk: 'medium', materials: 7, tier: 2 },
  { id: 'SUPP-008', name: 'Japan Precision', lat: 35.6762, lng: 139.6503, risk: 'low', materials: 9, tier: 1 },
  { id: 'SUPP-009', name: 'India Components', lat: 19.0760, lng: 72.8777, risk: 'medium', materials: 5, tier: 2 },
  { id: 'SUPP-010', name: 'Thailand Assembly', lat: 13.7563, lng: 100.5018, risk: 'high', materials: 11, tier: 2 },
]

const riskColors = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e'
}

export default function SupplyChainMap({
  suppliers = defaultSuppliers,
  showFlows = true,
  height = '400px',
  className = ''
}: SupplyChainMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
      },
      center: [80, 30],
      zoom: 1.5,
      attributionControl: false
    })

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

    map.current.on('load', () => {
      setLoaded(true)
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    if (!map.current || !loaded) return

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.supplier-marker')
    existingMarkers.forEach(m => m.remove())

    // Add supplier markers
    suppliers.forEach(supplier => {
      const el = document.createElement('div')
      el.className = 'supplier-marker'
      el.style.cssText = `
        width: ${12 + (supplier.materials || 5) * 1.5}px;
        height: ${12 + (supplier.materials || 5) * 1.5}px;
        background-color: ${riskColors[supplier.risk]};
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      `
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
      })

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; font-family: system-ui;">
          <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 600;">${supplier.name}</h3>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">ID: ${supplier.id}</p>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">Materials: ${supplier.materials || 'N/A'}</p>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">Tier: ${supplier.tier || 'N/A'}</p>
          <p style="margin: 4px 0; font-size: 12px;">
            Risk: <span style="color: ${riskColors[supplier.risk]}; font-weight: 600; text-transform: capitalize;">${supplier.risk}</span>
          </p>
        </div>
      `)

      new maplibregl.Marker({ element: el })
        .setLngLat([supplier.lng, supplier.lat])
        .setPopup(popup)
        .addTo(map.current!)
    })

    // Add supply flow lines if enabled
    if (showFlows && map.current.getSource('flows')) {
      map.current.removeLayer('flow-lines')
      map.current.removeSource('flows')
    }

    if (showFlows) {
      const hqLocation: [number, number] = [-95.7129, 37.0902] // US HQ

      const flowFeatures = suppliers.map(supplier => ({
        type: 'Feature' as const,
        properties: { risk: supplier.risk },
        geometry: {
          type: 'LineString' as const,
          coordinates: [
            [supplier.lng, supplier.lat],
            hqLocation
          ]
        }
      }))

      if (!map.current.getSource('flows')) {
        map.current.addSource('flows', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: flowFeatures
          }
        })

        map.current.addLayer({
          id: 'flow-lines',
          type: 'line',
          source: 'flows',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': [
              'match',
              ['get', 'risk'],
              'critical', riskColors.critical,
              'high', riskColors.high,
              'medium', riskColors.medium,
              'low', riskColors.low,
              '#666'
            ],
            'line-width': 1.5,
            'line-opacity': 0.4,
            'line-dasharray': [2, 2]
          }
        })
      }
    }
  }, [suppliers, showFlows, loaded])

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Risk Level</p>
        <div className="space-y-1">
          {Object.entries(riskColors).map(([risk, color]) => (
            <div key={risk} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs capitalize text-gray-600 dark:text-gray-400">{risk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
