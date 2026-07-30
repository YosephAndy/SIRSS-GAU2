'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface Waypoint {
  id: number
  lat: number | null
  lng: number | null
  originPoint: string
}

interface DriverMapProps {
  waypoints: Waypoint[]
  routeWaypoints: Waypoint[]
  simStartTime: Date | null
  isPaused?: boolean
  isFullscreen?: boolean
}

function MapSizeUpdater({ isFullscreen }: { isFullscreen?: boolean }) {
  const map = useMap()
  useEffect(() => {
    // Timeout allows CSS transition to finish before calculating new size
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 300)
    return () => clearTimeout(timer)
  }, [isFullscreen, map])
  return null
}

// Interpolate truck position along route
function getDistance(a: [number, number], b: [number, number]): number {
  return Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2)
}

function getInterpolatedPosition(positions: [number, number][], progress: number): [number, number] {
  if (positions.length === 1) return positions[0]
  if (progress <= 0) return positions[0]
  if (progress >= 1) return positions[positions.length - 1]

  let totalDist = 0
  const dists: number[] = []
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
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
  html: `<div style="
    width:44px;height:44px;
    background:white;
    border:3px solid #f59e0b;
    border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:22px;
    box-shadow:0 4px 15px rgba(245,158,11,0.5);
    animation: pulse 2s infinite;
  ">🚛</div>`,
})

const waypointIcon = (seq: number) => L.divIcon({
  className: '',
  iconAnchor: [14, 14],
  html: `<div style="
    width:28px;height:28px;
    background:#3b82f6;
    border:2px solid #1d4ed8;
    border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    color:white;font-weight:bold;font-size:11px;
    box-shadow:0 2px 8px rgba(59,130,246,0.4);
  ">${seq}</div>`,
})

function MapResizer() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100)
  }, [map])
  return null
}

function TruckSimulator({ positions, startTime, isPaused }: { positions: [number, number][]; startTime: Date; isPaused: boolean }) {
  const [pos, setPos] = useState<[number, number]>(positions[0])
  const DURATION = 180000 // 3 min
  const elapsedRef = React.useRef(0)
  const lastTickRef = React.useRef(Date.now())

  useEffect(() => {
    lastTickRef.current = Date.now()
    if (isPaused) return

    let raf: number
    const animate = () => {
      const now = Date.now()
      const delta = now - lastTickRef.current
      lastTickRef.current = now
      elapsedRef.current += delta

      const progress = (elapsedRef.current % DURATION) / DURATION
      setPos(getInterpolatedPosition(positions, progress))
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [positions, isPaused, startTime])

  return (
    <Marker position={pos} icon={truckIcon} zIndexOffset={1000}>
      <Popup><div className="font-bold text-orange-600 text-center">¡Camión en ruta!</div></Popup>
    </Marker>
  )
}

export default function DriverMap({ waypoints, routeWaypoints, simStartTime, isPaused = false, isFullscreen }: DriverMapProps) {
  const validWaypoints = waypoints.filter(w => w.lat !== null && w.lng !== null)
  const validRouteWaypoints = routeWaypoints.filter(w => w.lat !== null && w.lng !== null)
  
  if (validRouteWaypoints.length === 0) return null

  // Truck and route line use ALL points (including via_points)
  const routePositions = validRouteWaypoints.map(w => [w.lat!, w.lng!] as [number, number])
  const center = routePositions[0]

  return (
    <MapContainer
      center={center}
      zoom={15}
      className="w-full h-full rounded-2xl z-0"
    >
      <MapSizeUpdater isFullscreen={isFullscreen} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* Route polyline (all points) */}
      <Polyline positions={routePositions} color="#3b82f6" weight={4} opacity={0.8} />

      {/* Waypoint markers (only numbered points) */}
      {validWaypoints.map((w, i) => (
        <Marker key={w.id} position={[w.lat!, w.lng!]} icon={waypointIcon(i + 1)}>
          <Popup>
            <div className="font-medium text-slate-700">{w.originPoint}</div>
          </Popup>
        </Marker>
      ))}

      {/* Truck simulation runs over all points */}
      {simStartTime && routePositions.length > 1 && (
        <TruckSimulator positions={routePositions} startTime={simStartTime} isPaused={isPaused} />
      )}
    </MapContainer>
  )
}
