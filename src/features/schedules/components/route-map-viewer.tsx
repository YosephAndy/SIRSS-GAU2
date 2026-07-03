'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Importar el mapa dinámicamente para evitar problemas de SSR con Leaflet
const MapComponent = dynamic(() => import('./map'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium">Cargando mapa en vivo...</div>
})

interface RouteMapViewerProps {
  routeKey: string
  dataset: any[]
}

export function RouteMapViewer({ routeKey, dataset }: RouteMapViewerProps) {
  return <MapComponent routeKey={routeKey} dataset={dataset} />
}
