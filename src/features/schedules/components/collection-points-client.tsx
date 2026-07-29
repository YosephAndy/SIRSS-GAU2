'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { Schedule, Waypoint, Route, Zone } from '../../../../app/generated/prisma/client'

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

type ExtendedSchedule = Schedule & {
  waypoints: Waypoint[]
  route: Route & { zone: Zone | null }
}

export function CollectionPointsClient({ schedules }: { schedules: ExtendedSchedule[] }) {
  const allWaypoints = useMemo(() => {
    return schedules.flatMap(s => 
      s.waypoints
        .filter(w => w.lat && w.lng)
        .map(w => ({
          ...w,
          schedule: s
        }))
    )
  }, [schedules])

  if (typeof window === 'undefined') {
    return <div className="h-[600px] w-full bg-slate-100 animate-pulse rounded-2xl" />
  }

  // Cusco center coordinates
  const center: [number, number] = [-13.531950, -71.967462]

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
      <div className="h-[600px] w-full relative z-0">
        <MapContainer center={center} zoom={13} className="h-full w-full">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {allWaypoints.map((wp) => (
            <Marker key={wp.id} position={[wp.lat!, wp.lng!]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-slate-800">{wp.originPoint}</p>
                  <p className="text-slate-600 text-xs">Zona: {wp.schedule.route.zone?.name}</p>
                  <p className="text-slate-600 text-xs">Turno: {wp.schedule.route.shift}</p>
                  {(wp.arrivalTime || wp.departureTime) && (
                    <p className="text-slate-500 text-xs mt-1">Horario aprox: {wp.arrivalTime || wp.departureTime}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
