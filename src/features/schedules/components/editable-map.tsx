'use client'

import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Icono estándar azul
const blueIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// Icono rojo (marcador modificado)
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

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

interface WaypointCoord {
  id: number
  sequence: number
  originPoint: string
  destinationPoint: string
  lat: number
  lng: number
  isDirty?: boolean
}

function MapUpdater({ routeKey, positions }: { routeKey: string; positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, routeKey])
  return null
}

interface EditableMapProps {
  routeKey: string
  dataset: any[]
  onCoordChange: (waypointId: number, lat: number, lng: number) => void
  dirtyIds: Set<number>
}

export default function EditableMap({ routeKey, dataset, onCoordChange, dirtyIds }: EditableMapProps) {
  const zoneData = dataset
    .filter((d) => {
      if (!routeKey) return true
      const key = `${d.zoneName || 'Sin Zona'}|${d.days.join(',')}|${d.shift}`
      return key === routeKey
    })
    .sort((a, b) => a.sequence - b.sequence)

  // Asignamos coordenadas: usamos lat/lng de la BD si existen, sino mocks
  const waypoints: WaypointCoord[] = zoneData.map((d, i) => {
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
  })

  const positions = waypoints.map((w) => [w.lat, w.lng] as [number, number])

  if (waypoints.length === 0) {
    return (
      <div className="h-[500px] w-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
        No hay puntos para mostrar en esta ruta.
      </div>
    )
  }

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
      <MapContainer center={[waypoints[0].lat, waypoints[0].lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={positions} color="#3b82f6" weight={4} opacity={0.7} dashArray="8 4" />
        {waypoints.map((w, i) => (
          <Marker
            key={w.id}
            position={[w.lat, w.lng]}
            icon={dirtyIds.has(w.id) ? redIcon : blueIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target
                const pos = marker.getLatLng()
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
                  <p className="font-bold text-slate-800 m-0 text-sm">Punto {w.sequence}</p>
                </div>
                <p className="text-xs text-slate-600 m-0"><b>De:</b> {w.originPoint}</p>
                <p className="text-xs text-slate-600 mt-1 m-0"><b>A:</b> {w.destinationPoint}</p>
                {dirtyIds.has(w.id) && (
                  <p className="text-[11px] text-amber-600 font-semibold mt-2">📍 Posición modificada</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        <MapUpdater routeKey={routeKey} positions={positions} />
      </MapContainer>
    </div>
  )
}
