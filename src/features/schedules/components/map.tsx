'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// ─── Coordenadas de respaldo por zona ───────────────────────────────────────
const ZONE_MOCKS: Record<string, [number, number][]> = {
  'ZONA 01': [
    [-13.528, -71.962], [-13.529, -71.960], [-13.530, -71.958], [-13.531, -71.957], [-13.533, -71.956],
    [-13.534, -71.954], [-13.535, -71.952], [-13.536, -71.950], [-13.538, -71.948], [-13.540, -71.945],
  ],
  'ZONA 02': [
    [-13.540, -71.975], [-13.541, -71.973], [-13.542, -71.971], [-13.543, -71.970], [-13.544, -71.968],
    [-13.545, -71.966], [-13.546, -71.964], [-13.547, -71.962], [-13.548, -71.960], [-13.549, -71.958],
  ],
  'ZONA 03': [
    [-13.535, -71.915], [-13.534, -71.913], [-13.533, -71.911], [-13.532, -71.909], [-13.531, -71.907],
    [-13.530, -71.905], [-13.529, -71.903], [-13.528, -71.901], [-13.527, -71.899], [-13.526, -71.897],
  ],
  'ZONA 04': [
    [-13.515, -71.980], [-13.516, -71.978], [-13.517, -71.976], [-13.518, -71.974], [-13.519, -71.972],
    [-13.520, -71.970], [-13.521, -71.968], [-13.522, -71.966], [-13.523, -71.964], [-13.524, -71.962],
  ],
  'ZONA 05': [
    [-13.545, -71.940], [-13.546, -71.938], [-13.547, -71.936], [-13.548, -71.934], [-13.549, -71.932],
    [-13.550, -71.930], [-13.551, -71.928], [-13.552, -71.926], [-13.553, -71.924], [-13.554, -71.922],
  ],
}

function getBaseCoord(zoneName: string, index: number): [number, number] {
  const zoneKey = (zoneName || '').toUpperCase().trim()
  const mocks = ZONE_MOCKS[zoneKey] || ZONE_MOCKS['ZONA 01']
  return mocks[Math.min(index, mocks.length - 1)]
}

// ─── Icono numerado con DivIcon ──────────────────────────────────────────────
function createNumberedIcon(sequence: number, isFirst: boolean, isLast: boolean) {
  const bg = isFirst ? '#2563eb' : isLast ? '#1e293b' : '#3b82f6'
  const border = isFirst ? '#1d4ed8' : isLast ? '#0f172a' : '#2563eb'

  return L.divIcon({
    className: '',
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
    html: `
      <div style="
        width: 36px; height: 36px;
        background: ${bg};
        border: 3px solid ${border};
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: 800; font-size: 13px;
        font-family: system-ui, sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      ">${sequence}</div>
    `,
  })
}

// ─── OSRM: obtener ruta por segmentos de máx 25 puntos ──────────────────────
async function fetchOsrmSegmented(coords: [number, number][]): Promise<[number, number][]> {
  const CHUNK = 25 // OSRM público: hasta ~25 waypoints por petición
  const segments: [number, number][][] = []

  for (let i = 0; i < coords.length - 1; i += CHUNK - 1) {
    segments.push(coords.slice(i, i + CHUNK))
  }

  const results = await Promise.all(
    segments.map(async (seg) => {
      const coordsStr = seg.map(p => `${p[1]},${p[0]}`).join(';')
      const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`
      try {
        const res = await fetch(url)
        const data = await res.json()
        if (data.code === 'Ok' && data.routes?.[0]) {
          return data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number])
        }
      } catch {}
      // fallback: línea recta para ese segmento
      return seg
    })
  )

  // Unir segmentos eliminando el punto duplicado de la unión
  return results.reduce<[number, number][]>((acc, seg, i) => {
    return i === 0 ? acc.concat(seg) : acc.concat(seg.slice(1))
  }, [])
}

// ─── MapUpdater ──────────────────────────────────────────────────────────────
function MapUpdater({ routeKey, positions, isFullscreen }: {
  routeKey: string
  positions: [number, number][]
  isFullscreen?: boolean
}) {
  const map = useMap()

  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(L.latLngBounds(positions), { padding: [50, 50] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, routeKey])

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 150)
    return () => clearTimeout(timer)
  }, [map, isFullscreen])

  return null
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface WaypointCoord {
  id: number
  sequence: number
  originPoint: string
  destinationPoint: string
  lat: number
  lng: number
}

interface MapProps {
  routeKey: string
  dataset: any[]
  isFullscreen?: boolean
}

// ─── Componente principal (Vista Ciudadano) ──────────────────────────────────
export default function Map({ routeKey, dataset, isFullscreen }: MapProps) {
  const [routeLine, setRouteLine] = useState<[number, number][]>([])

  const zoneData = useMemo(() =>
    dataset
      .filter((d) => {
        if (!routeKey) return true
        return `${d.zoneName || 'Sin Zona'}|${d.days.join(',')}|${d.shift}` === routeKey
      })
      .sort((a, b) => a.sequence - b.sequence),
    [dataset, routeKey]
  )

  const waypoints: WaypointCoord[] = useMemo(() =>
    zoneData.map((d, i) => {
      const base = getBaseCoord(d.zoneName, i)
      const mocksLength = ZONE_MOCKS[(d.zoneName || '').toUpperCase().trim()]?.length || 10
      const latOffset = i >= mocksLength ? (i - mocksLength) * -0.001 : 0
      return {
        id: d.id,
        sequence: d.sequence,
        originPoint: d.originPoint,
        destinationPoint: d.destinationPoint,
        lat: d.lat ?? base[0] + latOffset,
        lng: d.lng ?? base[1],
      }
    }),
    [zoneData]
  )

  const positions = useMemo(() =>
    waypoints.map((w) => [w.lat, w.lng] as [number, number]),
    [waypoints]
  )

  // Stringify para evitar loop infinito en useEffect
  const positionsString = JSON.stringify(positions)

  // OSRM routing con debounce y segmentación
  useEffect(() => {
    if (positions.length < 2) {
      setRouteLine(positions)
      return
    }

    // Línea recta inmediata mientras llega la respuesta de OSRM
    setRouteLine(positions)

    const timer = setTimeout(async () => {
      const line = await fetchOsrmSegmented(positions)
      setRouteLine(line)
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionsString])

  const containerHeight = isFullscreen ? '100%' : '500px'

  if (waypoints.length === 0) {
    return (
      <div style={{ height: containerHeight }} className="w-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
        No hay datos de ruta para mostrar en el mapa de esta zona.
      </div>
    )
  }

  return (
    <div style={{ height: containerHeight }} className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
      <MapContainer
        center={[waypoints[0].lat, waypoints[0].lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Línea de ruta por calles (OSRM) o recta como fallback */}
        <Polyline
          positions={routeLine.length > 1 ? routeLine : positions}
          color="#3b82f6"
          weight={4}
          opacity={0.85}
        />

        {waypoints.map((w, i) => (
          <Marker
            key={w.id}
            position={[w.lat, w.lng]}
            icon={createNumberedIcon(
              w.sequence,
              i === 0,
              i === waypoints.length - 1
            )}
          >
            <Popup>
              <div className="font-sans min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                    {w.sequence}
                  </div>
                  <p className="font-bold text-slate-800 m-0 text-sm">Parada {w.sequence}</p>
                </div>
                <p className="text-xs text-slate-600 m-0"><b>De:</b> {w.originPoint}</p>
                <p className="text-xs text-slate-600 mt-1 m-0"><b>A:</b> {w.destinationPoint}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapUpdater routeKey={routeKey} positions={positions} isFullscreen={isFullscreen} />
      </MapContainer>
    </div>
  )
}
