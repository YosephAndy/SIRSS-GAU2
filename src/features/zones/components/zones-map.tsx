'use client'

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import type { ZoneRecord } from '../types/zone.types'

const ZONE_COLORS: Record<string, string> = {
  'ZONA 01': '#3b82f6',
  'ZONA 02': '#10b981',
  'ZONA 03': '#f59e0b',
  'ZONA 04': '#ef4444',
  'ZONA 05': '#8b5cf6',
}

const ZONE_MOCKS: Record<string, [number, number][]> = {
  'ZONA 01': [
    [-13.528, -71.962], [-13.529, -71.960], [-13.530, -71.958], [-13.531, -71.957],
    [-13.533, -71.956], [-13.532, -71.955], [-13.530, -71.956], [-13.528, -71.958],
    [-13.527, -71.960], [-13.528, -71.962],
  ],
  'ZONA 02': [
    [-13.540, -71.975], [-13.541, -71.973], [-13.542, -71.971], [-13.543, -71.970],
    [-13.544, -71.968], [-13.543, -71.966], [-13.541, -71.967], [-13.539, -71.970],
    [-13.539, -71.973], [-13.540, -71.975],
  ],
  'ZONA 03': [
    [-13.535, -71.915], [-13.534, -71.913], [-13.533, -71.911], [-13.532, -71.909],
    [-13.531, -71.907], [-13.530, -71.908], [-13.531, -71.911], [-13.533, -71.913],
    [-13.534, -71.915], [-13.535, -71.915],
  ],
  'ZONA 04': [
    [-13.515, -71.980], [-13.516, -71.978], [-13.517, -71.976], [-13.518, -71.974],
    [-13.519, -71.972], [-13.518, -71.970], [-13.516, -71.971], [-13.515, -71.974],
    [-13.514, -71.977], [-13.515, -71.980],
  ],
  'ZONA 05': [
    [-13.545, -71.940], [-13.546, -71.938], [-13.547, -71.936], [-13.548, -71.934],
    [-13.549, -71.932], [-13.548, -71.930], [-13.546, -71.931], [-13.544, -71.934],
    [-13.544, -71.937], [-13.545, -71.940],
  ],
}

function getZoneColor(zoneName: string): string {
  return ZONE_COLORS[zoneName.toUpperCase()] || '#6b7280'
}

function getZonePolygon(zoneName: string): [number, number][] {
  return ZONE_MOCKS[zoneName.toUpperCase()] || ZONE_MOCKS['ZONA 01']
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

interface ZonesMapProps {
  zones: ZoneRecord[]
}

export default function ZonesMap({ zones }: ZonesMapProps) {
  const allPositions = zones.flatMap(z => getZonePolygon(z.name))

  if (zones.length === 0) {
    return (
      <div className="h-[500px] w-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
        No hay zonas para mostrar en el mapa.
      </div>
    )
  }

  const center: [number, number] = allPositions.length > 0
    ? [
        allPositions.reduce((sum, p) => sum + p[0], 0) / allPositions.length,
        allPositions.reduce((sum, p) => sum + p[1], 0) / allPositions.length,
      ]
    : [-13.531, -71.967]

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {zones.map((zone) => {
          const positions = getZonePolygon(zone.name)
          const color = getZoneColor(zone.name)
          return (
            <Polygon
              key={zone.id}
              positions={positions}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.3,
                weight: 2,
              }}
            >
              <Popup>
                <div className="font-sans min-w-[180px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: color }}
                    />
                    <p className="font-bold text-slate-800 m-0">{zone.name}</p>
                  </div>
                  {zone.description && (
                    <p className="text-xs text-slate-600 m-0">{zone.description}</p>
                  )}
                </div>
              </Popup>
            </Polygon>
          )
        })}
        <MapUpdater positions={allPositions} />
      </MapContainer>
    </div>
  )
}
