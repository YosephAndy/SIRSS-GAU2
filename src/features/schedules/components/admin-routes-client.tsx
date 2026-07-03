'use client'

import React, { useState, useTransition, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Route, Filter, Save, CheckCircle2, AlertCircle, Info, List, ChevronDown, ChevronUp } from 'lucide-react'
import { saveWaypointCoordsAction } from '../actions/schedule.actions'
import type { FlatSchedule } from '../services/schedule.service'

// Cargamos el mapa dinámicamente (SSR disabled por Leaflet)
const EditableMapComponent = dynamic(() => import('./editable-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium">
      Cargando mapa editable...
    </div>
  ),
})

interface AdminRoutesClientProps {
  dataset: FlatSchedule[]
}

export function AdminRoutesClient({ dataset }: AdminRoutesClientProps) {
  const uniqueRoutes = useMemo(() => {
    return Array.from(
      new Map(
        dataset.map((s) => {
          const key = `${s.zoneName || 'Sin Zona'}|${s.days.join(',')}|${s.shift}`
          const label = `${s.zoneName || 'Sin Zona'} — ${s.days.join(', ')} (${s.shift})`
          return [key, { key, label }]
        })
      ).values()
    )
  }, [dataset])

  const [selectedRouteKey, setSelectedRouteKey] = useState<string>(uniqueRoutes[0]?.key || '')
  const [pendingCoords, setPendingCoords] = useState<Map<number, { lat: number; lng: number }>>(new Map())
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showSequence, setShowSequence] = useState(false)

  const dirtyIds = new Set(pendingCoords.keys())

  // Resetear cambios al cambiar de ruta
  useEffect(() => {
    setPendingCoords(new Map())
    setMessage(null)
  }, [selectedRouteKey])

  const handleCoordChange = (waypointId: number, lat: number, lng: number) => {
    setPendingCoords((prev) => {
      const next = new Map(prev)
      next.set(waypointId, { lat, lng })
      return next
    })
    setMessage(null)
  }

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      const updates = Array.from(pendingCoords.entries()).map(([id, coords]) => ({
        id,
        lat: coords.lat,
        lng: coords.lng,
      }))
      const result = await saveWaypointCoordsAction(updates)
      setMessage({ type: result.success ? 'success' : 'error', text: result.message })
      if (result.success) setPendingCoords(new Map())
    })
  }

  const currentRoute = uniqueRoutes.find((r) => r.key === selectedRouteKey)

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Route size={22} className="text-blue-600" />
              Gestión de Rutas en el Mapa
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Arrastra los marcadores azules para ajustar las posiciones de la ruta
            </p>
          </div>
          {dirtyIds.size > 0 && (
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm disabled:opacity-60"
            >
              <Save size={16} />
              {isPending ? 'Guardando...' : `Guardar ${dirtyIds.size} cambio${dirtyIds.size > 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-5">
        {/* Selector de ruta */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Filter size={16} className="text-blue-500" />
            Seleccionar Ruta
          </label>
          <select
            value={selectedRouteKey}
            onChange={(e) => setSelectedRouteKey(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50 transition-all"
          >
            {uniqueRoutes.map((route) => (
              <option key={route.key} value={route.key}>
                {route.label}
              </option>
            ))}
          </select>
        </div>

        {/* Secuencia Vertical Desplegable */}
        {currentRoute && (() => {
          const waypoints = dataset.filter((s) => {
            const k = `${s.zoneName || 'Sin Zona'}|${s.days.join(',')}|${s.shift}`
            return k === selectedRouteKey
          }).sort((a, b) => a.sequence - b.sequence)

          if (waypoints.length === 0) return null

          const nodes = []
          waypoints.forEach((w, i) => {
            if (i === 0) {
              nodes.push({ title: w.originPoint, isFirst: true, isLast: false })
            } else {
              nodes.push({ title: w.originPoint, isFirst: false, isLast: false })
            }
          })
          if (waypoints.length > 0) {
            const lastW = waypoints[waypoints.length - 1]
            nodes.push({ title: lastW.destinationPoint, isFirst: false, isLast: true })
          }

          return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowSequence(!showSequence)}
                className="w-full px-5 py-4 flex items-center justify-between text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <List size={18} className="text-blue-500" />
                  Secuencia de la ruta
                </div>
                {showSequence ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {showSequence && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                  <div className="relative">
                    <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-blue-100 to-transparent" />
                    <ul className="space-y-4 relative">
                      {nodes.map((node, i) => (
                        <li key={i} className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm border-2 ${
                            node.isFirst
                              ? 'bg-blue-600 text-white border-blue-600'
                              : node.isLast
                              ? 'bg-slate-800 text-white border-slate-800'
                              : 'bg-white text-blue-600 border-blue-200'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-24 shrink-0 sm:mt-1">
                                {node.isFirst ? 'Inicio' : node.isLast ? 'Destino Final' : 'Paso'}
                              </span>
                              <p className="text-sm font-semibold text-slate-700 break-words leading-relaxed">{node.title}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* Instrucción */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3.5 text-blue-700 text-sm">
          <Info size={18} className="shrink-0 mt-0.5" />
          <p>
            <span className="font-bold">Cómo editar:</span> Haz clic y arrastra cualquier marcador azul (
            <span className="font-mono bg-blue-100 px-1 rounded">📍</span>) para mover el punto de esa parada a la
            ubicación correcta. Los marcadores en rojo son los que aún no han sido guardados. Cuando termines, pulsa
            &quot;Guardar Cambios&quot;.
          </p>
        </div>

        {/* Feedback */}
        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        {/* Mapa editable */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 text-sm">{currentRoute?.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {dataset.filter((s) => {
                  const k = `${s.zoneName || 'Sin Zona'}|${s.days.join(',')}|${s.shift}`
                  return k === selectedRouteKey
                }).length} puntos en el mapa
              </p>
            </div>
            {dirtyIds.size > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-3 py-1 rounded-full border border-amber-200">
                {dirtyIds.size} punto{dirtyIds.size > 1 ? 's' : ''} modificado{dirtyIds.size > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="p-3">
            <EditableMapComponent
              routeKey={selectedRouteKey}
              dataset={dataset}
              onCoordChange={handleCoordChange}
              dirtyIds={dirtyIds}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
