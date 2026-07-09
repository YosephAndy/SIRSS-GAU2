'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet'
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
function createNumberedIcon(sequence: number, isDirty: boolean, isFirst: boolean, isLast: boolean) {
  const bg = isDirty ? '#ef4444' : isFirst ? '#2563eb' : isLast ? '#1e293b' : '#3b82f6'
  const border = isDirty ? '#b91c1c' : isFirst ? '#1d4ed8' : isLast ? '#0f172a' : '#2563eb'

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

// ─── Icono verde de búsqueda ─────────────────────────────────────────────────
const greenSearchIcon = L.divIcon({
  className: '',
  iconAnchor: [18, 18],
  popupAnchor: [0, -22],
  html: `
    <div style="
      width: 36px; height: 36px;
      background: #16a34a;
      border: 3px solid #15803d;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 0 6px rgba(22,163,74,0.25), 0 2px 8px rgba(0,0,0,0.3);
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  `,
})

// ─── FlyTo cuando llega un resultado de búsqueda ─────────────────────────────
function FlyToMarker({ position }: { position: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(position, 17, { duration: 1.2 })
  }, [map, position[0], position[1]])
  return null
}

// ─── Clic en el mapa para añadir un punto ────────────────────────────────────
function MapClickHandler({ isAddMode, onAdd, isCreatingRoute, onAddCreate }: { 
  isAddMode: boolean; 
  onAdd: (lat: number, lng: number) => void;
  isCreatingRoute?: boolean;
  onAddCreate?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (isAddMode) {
        onAdd(e.latlng.lat, e.latlng.lng)
      } else if (isCreatingRoute && onAddCreate) {
        onAddCreate(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
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

interface EditableMapProps {
  routeKey: string
  dataset: any[]
  onCoordChange: (waypointId: number, lat: number, lng: number) => void
  dirtyIds: Set<number>
  pendingCoords: Map<number, { lat: number; lng: number }>
  isFullscreen?: boolean
  searchMarker?: { lat: number; lng: number; label: string } | null
  isAddMode?: boolean
  onAddWaypoint?: (lat: number, lng: number) => void
  onDeleteWaypoint?: (waypointId: number) => void
  isCreatingRoute?: boolean
  newWaypoints?: { 
    lat: number; 
    lng: number; 
    originPoint: string;
    destinationPoint: string;
    departureTime: string;
    arrivalTime: string;
    hasCampanio: boolean;
    observations: string;
  }[]
  onMapClickForCreate?: (lat: number, lng: number) => void
  setNewWaypoints?: (w: any) => void // keep for backwards compatibility with dragend
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function EditableMap({
  routeKey,
  dataset,
  onCoordChange,
  dirtyIds,
  pendingCoords,
  isFullscreen,
  searchMarker,
  isAddMode = false,
  onAddWaypoint,
  onDeleteWaypoint,
  isCreatingRoute = false,
  newWaypoints = [],
  onMapClickForCreate,
  setNewWaypoints,
}: EditableMapProps) {
  const [routeLine, setRouteLine] = useState<[number, number][]>([])
  const [useStraightLine, setUseStraightLine] = useState(false)

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
      const pending = pendingCoords.get(d.id)
      return {
        id: d.id,
        sequence: d.sequence,
        originPoint: d.originPoint,
        destinationPoint: d.destinationPoint,
        lat: pending ? pending.lat : (d.lat ?? base[0] + latOffset),
        lng: pending ? pending.lng : (d.lng ?? base[1]),
      }
    }),
    [zoneData, pendingCoords]
  )

  const positions = useMemo(() => {
    if (isCreatingRoute) {
      return newWaypoints.map((w) => [w.lat, w.lng] as [number, number])
    }
    return waypoints.map((w) => [w.lat, w.lng] as [number, number])
  }, [waypoints, isCreatingRoute, newWaypoints])

  // Stringify para evitar loop infinito en useEffect
  const positionsString = JSON.stringify(positions)

  // OSRM routing con debounce y segmentación
  useEffect(() => {
    if (positions.length < 2) {
      setRouteLine(positions)
      return
    }

    if (useStraightLine) {
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
  }, [positionsString, useStraightLine])

  if (!isCreatingRoute && waypoints.length === 0) {
    return (
      <div className="h-[500px] w-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
        No hay puntos para mostrar en esta ruta.
      </div>
    )
  }

  // Altura: 100% en fullscreen, fija de 500px en vista normal
  const containerHeight = isFullscreen ? '100%' : '500px'

  return (
    <div
      style={{ height: containerHeight, cursor: isAddMode ? 'crosshair' : 'default' }}
      className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0"
    >
      {/* Banner indicador de modo añadir */}
      {isAddMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Modo añadir: clic en el mapa para colocar un punto
        </div>
      )}

      {/* Toggle para línea recta vs calles */}
      <div className="absolute top-3 right-3 z-[500]">
        <button
          onClick={() => setUseStraightLine(!useStraightLine)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold shadow-md transition-colors border ${
            useStraightLine
              ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {useStraightLine ? (
              // Icono de línea recta
              <><path d="M5 19L19 5"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/></>
            ) : (
              // Icono de curva
              <><path d="M5 19c7 0 7-14 14-14"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/></>
            )}
          </svg>
          {useStraightLine ? 'Modo Recta Activado' : 'Ajustar a Calles'}
        </button>
      </div>

      <MapContainer
        center={[waypoints[0].lat, waypoints[0].lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Línea de ruta por calles (OSRM) o recta como fallback */}
        <Polyline
          positions={routeLine.length > 1 ? routeLine : positions}
          color="#3b82f6"
          weight={4}
          opacity={0.85}
        />

        {/* Marcadores modo creación */}
        {isCreatingRoute && newWaypoints.map((w, i) => (
          <Marker
            key={`new-${i}`}
            position={[w.lat, w.lng]}
            icon={createNumberedIcon(i + 1, false, i === 0, i === newWaypoints.length - 1)}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const pos = (e.target as L.Marker).getLatLng()
                if (setNewWaypoints) {
                  const updated = [...newWaypoints]
                  updated[i] = { ...updated[i], lat: pos.lat, lng: pos.lng }
                  setNewWaypoints(updated)
                }
              },
            }}
          >
            <Popup>
              <div className="font-sans min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <p className="font-bold text-slate-800 m-0 text-sm">Nuevo Punto {i + 1}</p>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-slate-600 m-0"><b>De:</b> {w.originPoint}</p>
                  <p className="text-xs text-slate-600 mt-1 m-0"><b>A:</b> {w.destinationPoint}</p>
                </div>
                <button
                  onClick={() => {
                    if (setNewWaypoints) {
                      setNewWaypoints(newWaypoints.filter((_, idx) => idx !== i))
                    }
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg py-1.5 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  Eliminar punto
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marcadores modo edición normal */}
        {!isCreatingRoute && waypoints.map((w, i) => (
          <Marker
            key={w.id}
            position={[w.lat, w.lng]}
            icon={createNumberedIcon(
              w.sequence,
              dirtyIds.has(w.id),
              i === 0,
              i === waypoints.length - 1
            )}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const pos = (e.target as L.Marker).getLatLng()
                onCoordChange(w.id, pos.lat, pos.lng)
              },
            }}
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
                {dirtyIds.has(w.id) && (
                  <p className="text-[11px] text-amber-600 font-semibold mt-2">📍 Posición modificada</p>
                )}
                {onDeleteWaypoint && (
                  <button
                    onClick={() => onDeleteWaypoint(w.id)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg py-1.5 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    Eliminar punto
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marcador verde de búsqueda */}
        {searchMarker && (
          <>
            <FlyToMarker position={[searchMarker.lat, searchMarker.lng]} />
            <Marker
              position={[searchMarker.lat, searchMarker.lng]}
              icon={greenSearchIcon}
            >
              <Popup>
                <div className="font-sans min-w-[180px]">
                  <p className="font-bold text-emerald-700 m-0 text-sm mb-1">📍 Resultado de búsqueda</p>
                  <p className="text-xs text-slate-600 m-0">{searchMarker.label.split(',').slice(0,4).join(',')}</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        <MapClickHandler 
          isAddMode={isAddMode} 
          onAdd={onAddWaypoint ?? (() => {})} 
          isCreatingRoute={isCreatingRoute}
          onAddCreate={(lat, lng) => {
            if (onMapClickForCreate) {
              onMapClickForCreate(lat, lng)
            }
          }}
        />
        <MapUpdater routeKey={routeKey} positions={positions} isFullscreen={isFullscreen} />
      </MapContainer>
    </div>
  )
}
