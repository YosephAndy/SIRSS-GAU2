'use client'

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Corrección para los iconos de leaflet en React
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
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

function MapUpdater({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, positions])
  return null
}

export default function Map({ routeKey, dataset }: { routeKey: string, dataset: any[] }) {
  // Filtramos la data por el routeKey (ej. "ZONA 01|LUNES,MIERCOLES,VIERNES|MAÑANA")
  const zoneData = dataset
    .filter(d => {
      if (!routeKey) return true
      const key = `${d.zoneName || 'Sin Zona'}|${d.days.join(',')}|${d.shift}`
      return key === routeKey
    })
    .sort((a, b) => a.sequence - b.sequence)

  // Asignamos las coordenadas de la BD si existen, de lo contrario usamos mocks
  const waypoints = zoneData.map((d, i) => {
    const baseCoord = getBaseCoord(d.zoneName, i)
    const mocksLength = ZONE_MOCKS[(d.zoneName || '').toUpperCase().trim()]?.length || 10
    // Agregar pequeño offset si se pasan de la cantidad de mocks para no solapar
    const latOffset = i >= mocksLength ? (i - mocksLength) * -0.001 : 0
    
    return {
      ...d,
      lat: d.lat ?? baseCoord[0] + latOffset,
      lng: d.lng ?? baseCoord[1],
    }
  })

  const positions = waypoints.map(w => [w.lat, w.lng] as [number, number])

  if (waypoints.length === 0) {
    return (
      <div className="h-[400px] w-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
        No hay datos de ruta para mostrar en el mapa de esta zona.
      </div>
    )
  }

  const center = positions[0]

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={positions} color="#3b82f6" weight={5} opacity={0.8} />
        {waypoints.map((w, i) => (
          <Marker key={w.id} position={[w.lat, w.lng]} icon={icon}>
            <Popup>
              <div className="font-sans min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                    {w.sequence}
                  </div>
                  <p className="font-bold text-slate-800 m-0">Secuencia {w.sequence}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-600 m-0"><b>De:</b> {w.originPoint}</p>
                  <p className="text-xs text-slate-600 m-0"><b>A:</b> {w.destinationPoint}</p>
                </div>
                {w.waypointDepartureTime && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[11px] text-blue-600 font-mono m-0 font-semibold">
                      {w.waypointDepartureTime} - {w.waypointArrivalTime}
                    </p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        <MapUpdater positions={positions} />
      </MapContainer>
    </div>
  )
}
