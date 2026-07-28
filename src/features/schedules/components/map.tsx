'use client'

import React, { useEffect, useMemo } from 'react'
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

// ─── Utilidad de interpolación ───────────────────────────────────────────────
function getDistance(p1: [number, number], p2: [number, number]) {
  const dx = p1[0] - p2[0]
  const dy = p1[1] - p2[1]
  return Math.sqrt(dx*dx + dy*dy)
}

function getInterpolatedPosition(
  positions: [number, number][],
  progress: number // 0 to 1
): [number, number] {
  if (positions.length === 0) return [0, 0]
  if (positions.length === 1) return positions[0]
  if (progress <= 0) return positions[0]
  if (progress >= 1) return positions[positions.length - 1]

  let totalDist = 0
  const dists = []
  for (let i = 0; i < positions.length - 1; i++) {
    const d = getDistance(positions[i], positions[i + 1])
    dists.push(d)
    totalDist += d
  }

  const targetDist = totalDist * progress
  let currentDist = 0

  for (let i = 0; i < positions.length - 1; i++) {
    if (currentDist + dists[i] >= targetDist) {
      const segmentProgress = (targetDist - currentDist) / dists[i]
      const p1 = positions[i]
      const p2 = positions[i + 1]
      return [
        p1[0] + (p2[0] - p1[0]) * segmentProgress,
        p1[1] + (p2[1] - p1[1]) * segmentProgress,
      ]
    }
    currentDist += dists[i]
  }

  return positions[positions.length - 1]
}

const truckIcon = L.divIcon({
  className: '',
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
  html: `
    <div style="
      width: 40px; height: 40px;
      background: white;
      border: 3px solid #f59e0b;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    ">🚛</div>
  `,
})

// ─── Simulador del Camión ────────────────────────────────────────────────────
function TruckSimulator({ positions, startTime }: { positions: [number, number][], startTime: Date }) {
  const [currentPos, setCurrentPos] = React.useState<[number, number]>(positions[0])
  const SIMULATION_DURATION = 180000 // 3 minutos

  useEffect(() => {
    let animationFrameId: number
    const startMs = new Date(startTime).getTime()

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startMs
      // Bucle infinito: calculamos el progreso (0 a 1)
      const progress = (elapsed % SIMULATION_DURATION) / SIMULATION_DURATION
      setCurrentPos(getInterpolatedPosition(positions, progress))
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationFrameId)
  }, [positions, startTime])

  return (
    <Marker position={currentPos} icon={truckIcon} zIndexOffset={1000}>
      <Popup>
        <div className="font-bold text-orange-600 text-center">¡El camión está en camino!</div>
      </Popup>
    </Marker>
  )
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

  const containerHeight = isFullscreen ? '100%' : '500px'

  if (waypoints.length === 0) {
    return (
      <div style={{ height: containerHeight }} className="w-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
        No hay datos de ruta para mostrar en el mapa de esta zona.
      </div>
    )
  }

  const isSimulating = zoneData.length > 0 && zoneData[0].isSimulating
  const simulationStartTime = zoneData.length > 0 ? zoneData[0].simulationStartTime : null

  return (
    <div className="flex flex-col gap-4">
      {/* Banner de estado de simulación */}
      {isSimulating ? (
        <div className="bg-orange-100 text-orange-800 px-4 py-3 rounded-xl flex items-center justify-center gap-2 border border-orange-200 font-medium">
          <span className="animate-pulse">🚛</span> ¡Simulación de Recorrido Activa! El camión está en ruta.
        </div>
      ) : (
        <div className="bg-slate-50 text-slate-500 px-4 py-3 rounded-xl flex items-center justify-center gap-2 border border-slate-200 font-medium text-sm">
          No hay camión en servicio en este momento para esta ruta.
        </div>
      )}

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

        {/* Línea de ruta en modo recta */}
        <Polyline
          positions={positions}
          color="#3b82f6"
          weight={4}
          opacity={0.85}
        />

        {(() => {
          let displayNumber = 0;
          const realStops = waypoints.filter(w => w.originPoint !== 'VIA_POINT');
          return realStops.map((w, i) => {
            displayNumber++;
            return (
              <Marker
                key={w.id}
                position={[w.lat, w.lng]}
                icon={createNumberedIcon(
                  displayNumber,
                  i === 0,
                  i === realStops.length - 1
                )}
              >
                <Popup>
                  <div className="font-sans min-w-[180px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                        {displayNumber}
                      </div>
                      <p className="font-bold text-slate-800 m-0 text-sm">Parada {displayNumber}</p>
                    </div>
                    <p className="text-xs text-slate-600 m-0"><b>De:</b> {w.originPoint}</p>
                    <p className="text-xs text-slate-600 mt-1 m-0"><b>A:</b> {w.destinationPoint}</p>
                  </div>
                </Popup>
              </Marker>
            )
          })
        })()}

        {isSimulating && simulationStartTime && (
          <TruckSimulator positions={positions} startTime={simulationStartTime} />
        )}

        <MapUpdater routeKey={routeKey} positions={positions} isFullscreen={isFullscreen} />
      </MapContainer>
    </div>
    </div>
  )
}
