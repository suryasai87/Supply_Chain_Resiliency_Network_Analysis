import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface CountryTariff {
  country: string
  code: string
  tariffRate: number
  exposure: number
  materials: number
}

interface TariffChoroplethProps {
  data?: CountryTariff[]
  height?: string
  className?: string
  onCountryClick?: (country: CountryTariff) => void
}

const defaultTariffData: CountryTariff[] = [
  { country: 'China', code: 'CHN', tariffRate: 25, exposure: 28500000, materials: 47 },
  { country: 'Taiwan', code: 'TWN', tariffRate: 15, exposure: 8200000, materials: 23 },
  { country: 'Vietnam', code: 'VNM', tariffRate: 8, exposure: 3100000, materials: 15 },
  { country: 'Germany', code: 'DEU', tariffRate: 3, exposure: 1200000, materials: 8 },
  { country: 'Japan', code: 'JPN', tariffRate: 4, exposure: 1800000, materials: 12 },
  { country: 'South Korea', code: 'KOR', tariffRate: 5, exposure: 2100000, materials: 10 },
  { country: 'Mexico', code: 'MEX', tariffRate: 0, exposure: 0, materials: 18 },
  { country: 'India', code: 'IND', tariffRate: 10, exposure: 1500000, materials: 9 },
  { country: 'Thailand', code: 'THA', tariffRate: 7, exposure: 980000, materials: 7 },
  { country: 'Malaysia', code: 'MYS', tariffRate: 6, exposure: 750000, materials: 5 },
]

const getColorForTariff = (rate: number): string => {
  if (rate >= 20) return '#ef4444'
  if (rate >= 15) return '#f97316'
  if (rate >= 10) return '#eab308'
  if (rate >= 5) return '#84cc16'
  return '#22c55e'
}

export default function TariffChoropleth({
  data = defaultTariffData,
  height = '400px',
  className = '',
  onCountryClick
}: TariffChoroplethProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<CountryTariff | null>(null)

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
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
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
            maxzoom: 19,
            paint: {
              'raster-saturation': -0.5,
              'raster-brightness-min': 0.1
            }
          }
        ],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
      },
      center: [80, 25],
      zoom: 2,
      attributionControl: false
    })

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

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
    const existingMarkers = document.querySelectorAll('.tariff-marker')
    existingMarkers.forEach(m => m.remove())

    // Country approximate centers
    const countryCenters: Record<string, [number, number]> = {
      'CHN': [104.1954, 35.8617],
      'TWN': [121.5654, 25.0330],
      'VNM': [108.2772, 14.0583],
      'DEU': [10.4515, 51.1657],
      'JPN': [138.2529, 36.2048],
      'KOR': [127.7669, 35.9078],
      'MEX': [-102.5528, 23.6345],
      'IND': [78.9629, 20.5937],
      'THA': [100.9925, 15.8700],
      'MYS': [101.9758, 4.2105],
    }

    // Add tariff markers for each country
    data.forEach(country => {
      const center = countryCenters[country.code]
      if (!center) return

      const el = document.createElement('div')
      el.className = 'tariff-marker'
      const size = Math.max(40, Math.min(80, 40 + (country.exposure / 1000000)))
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background-color: ${getColorForTariff(country.tariffRate)};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        transition: transform 0.2s;
        opacity: 0.85;
      `
      el.innerHTML = `
        <span style="font-size: 14px; font-weight: bold; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${country.tariffRate}%</span>
      `
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.15)'
        el.style.opacity = '1'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
        el.style.opacity = '0.85'
      })
      el.addEventListener('click', () => {
        setSelectedCountry(country)
        onCountryClick?.(country)
      })

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 12px; font-family: system-ui; min-width: 180px;">
          <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; border-bottom: 1px solid #eee; padding-bottom: 8px;">${country.country}</h3>
          <div style="display: grid; gap: 6px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 12px; color: #666;">Tariff Rate:</span>
              <span style="font-size: 12px; font-weight: 600; color: ${getColorForTariff(country.tariffRate)}">${country.tariffRate}%</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 12px; color: #666;">Exposure:</span>
              <span style="font-size: 12px; font-weight: 600;">$${(country.exposure / 1000000).toFixed(1)}M</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 12px; color: #666;">Materials:</span>
              <span style="font-size: 12px; font-weight: 600;">${country.materials}</span>
            </div>
          </div>
        </div>
      `)

      new maplibregl.Marker({ element: el })
        .setLngLat(center)
        .setPopup(popup)
        .addTo(map.current!)
    })
  }, [data, loaded, onCountryClick])

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Tariff Rate</p>
        <div className="space-y-1">
          {[
            { label: '20%+', color: '#ef4444' },
            { label: '15-19%', color: '#f97316' },
            { label: '10-14%', color: '#eab308' },
            { label: '5-9%', color: '#84cc16' },
            { label: '0-4%', color: '#22c55e' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected country panel */}
      {selectedCountry && (
        <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-900/95 rounded-lg p-4 shadow-lg max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{selectedCountry.country}</h3>
            <button
              onClick={() => setSelectedCountry(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tariff Rate:</span>
              <span className="font-semibold" style={{ color: getColorForTariff(selectedCountry.tariffRate) }}>
                {selectedCountry.tariffRate}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Annual Exposure:</span>
              <span className="font-semibold">${(selectedCountry.exposure / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Materials Affected:</span>
              <span className="font-semibold">{selectedCountry.materials}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
