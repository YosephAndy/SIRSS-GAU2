'use client'

import React, { useState, useTransition, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Route, Filter, Save, CheckCircle2, AlertCircle, Info, List, ChevronDown, ChevronUp, Maximize, Minimize, Search, X, ArrowLeft, MapPin, Plus, Trash2, Play, Square } from 'lucide-react'
import { saveWaypointCoordsAction, addMapWaypointAction, deleteMapWaypointAction, createFullRouteAction, deleteFullRouteAction, insertViaPointAction, toggleSimulationAction } from '../actions/schedule.actions'
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
  const router = useRouter()
  const uniqueRoutes = useMemo(() => {
    return Array.from(
      new Map(
        dataset.map((s) => {
          const key = `${s.zoneName || 'Sin Zona'}|${s.days.join(',')}|${s.shift}`
          const label = `${s.zoneName || 'Sin Zona'} — ${s.days.join(', ')} (${s.shift})`
          return [key, { key, label, scheduleId: s.scheduleId, isSimulating: s.isSimulating }]
        })
      ).values()
    )
  }, [dataset])

  const [selectedRouteKey, setSelectedRouteKey] = useState<string>(uniqueRoutes[0]?.key || '')
  const [pendingCoords, setPendingCoords] = useState<Map<number, { lat: number; lng: number }>>(new Map())
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showSequence, setShowSequence] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Creation Mode State
  const [isCreatingRoute, setIsCreatingRoute] = useState(false)
  const [newRouteData, setNewRouteData] = useState({
    zoneName: '',
    shift: 'MANANA',
    routeType: 'NORMAL',
    days: [] as string[]
  })
  const [newWaypoints, setNewWaypoints] = useState<{
    lat: number; 
    lng: number; 
    originPoint: string;
    destinationPoint: string;
    departureTime: string;
    arrivalTime: string;
    hasCampanio: boolean;
    observations: string;
  }[]>([])
  const [pendingPoint, setPendingPoint] = useState<{ lat: number; lng: number } | null>(null)
  
  // Formulario temporal para el nuevo punto
  const [pointForm, setPointForm] = useState({
    originPoint: '',
    destinationPoint: '',
    departureTime: '06:00',
    arrivalTime: '06:30',
    hasCampanio: false,
    observations: ''
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<{ lat: number; lng: number; label: string } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const [suggestions, setSuggestions] = useState<{ lat: number; lng: number; label: string }[]>([])

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setTimeout(() => setSuggestions([]), 0)
      return
    }
    
    const timeout = setTimeout(async () => {
      setIsSearching(true)
      setSearchError(null)
      try {
        const encoded = encodeURIComponent(searchQuery)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encoded},+Cusco&format=json&limit=5&countrycodes=pe&viewbox=-72.010,-13.570,-71.900,-13.480&bounded=1`,
          { headers: { 'Accept-Language': 'es' } }
        )
        const data = await res.json()
        if (data && data.length > 0) {
          setSuggestions(data.map((item: any) => ({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            label: item.display_name
          })))
        } else {
          setSuggestions([])
          setSearchError('No se encontraron sugerencias.')
        }
      } catch {
        setSearchError('Error al buscar.')
      } finally {
        setIsSearching(false)
      }
    }, 400)
    
    return () => clearTimeout(timeout)
  }, [searchQuery])

  const handleSelectSuggestion = (suggestion: { lat: number; lng: number; label: string }) => {
    setSearchResult(suggestion)
    setSuggestions([])
    setSearchQuery(suggestion.label.split(',')[0])
  }

  const searchStreetUI = (
    <div className="px-5 py-4 border-b border-slate-100 relative">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Buscar calle</p>
      <div className="flex gap-2 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ej: Av. Tupac Amaru"
          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-700"
        />
        {isSearching && (
          <div className="absolute right-3 top-2.5">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      
      {suggestions.length > 0 && (
        <ul className="absolute left-5 right-5 top-[75px] bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden z-[500] max-h-60 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <li key={idx}>
              <button 
                onClick={() => handleSelectSuggestion(s)}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0 flex items-start gap-2"
              >
                <MapPin size={14} className="text-slate-400 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{s.label.split(',')[0]}</p>
                  <p className="text-xs text-slate-500 truncate">{s.label}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      
      {searchError && suggestions.length === 0 && searchQuery.length > 2 && (
        <p className="text-xs text-red-500 mt-2">{searchError}</p>
      )}

      {searchResult && (
        <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-start gap-2">
          <MapPin size={14} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-emerald-700 font-semibold">Marcado en el mapa</p>
            <p className="text-[11px] text-emerald-600 truncate">{searchResult.label.split(',')[0]}</p>
          </div>
          <button onClick={() => { setSearchResult(null); setSearchQuery('') }} className="text-emerald-500 hover:text-emerald-700 shrink-0"><X size={14} /></button>
        </div>
      )}
    </div>
  )

  const [isAddMode, setIsAddMode] = useState(false)

  const dirtyIds = new Set(pendingCoords.keys())

  const currentRoute = uniqueRoutes.find((r) => r.key === selectedRouteKey)
  const currentScheduleId = currentRoute?.scheduleId ?? null

  const handleToggleSimulation = async (scheduleId: number, isSimulating: boolean) => {
    startTransition(async () => {
      const res = await toggleSimulationAction(scheduleId, !isSimulating)
      if (!res.success) {
        setMessage({ type: 'error', text: res.message })
      } else {
        router.refresh()
      }
    })
  }

  // Resetear cambios al cambiar de ruta
  useEffect(() => {
    setTimeout(() => {
      setPendingCoords(new Map())
      setMessage(null)
      setIsAddMode(false)
    }, 0)
  }, [selectedRouteKey])

  const handleCoordChange = (waypointId: number, lat: number, lng: number) => {
    setPendingCoords((prev) => {
      const next = new Map(prev)
      next.set(waypointId, { lat, lng })
      return next
    })
    setMessage(null)
  }

  const handleAddWaypoint = (lat: number, lng: number) => {
    if (!currentScheduleId) return
    startTransition(async () => {
      const result = await addMapWaypointAction({
        scheduleId: currentScheduleId,
        lat,
        lng,
        originPoint: `Punto (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        destinationPoint: `Punto (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      })
      if (result.success) {
        setMessage({ type: 'success', text: '📍 Punto añadido correctamente.' })
        router.refresh()   // refresca el Server Component para recibir el dataset actualizado
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    })
  }

  const handleDeleteWaypoint = (waypointId: number) => {
    startTransition(async () => {
      const result = await deleteMapWaypointAction(waypointId)
      setMessage({ type: result.success ? 'success' : 'error', text: result.message })
      if (result.success) router.refresh()  // refresca para reflejar el punto eliminado
    })
  }

  const handleInsertViaPoint = (lat: number, lng: number, afterSequence: number) => {
    if (!currentScheduleId) return
    startTransition(async () => {
      const result = await insertViaPointAction({
        scheduleId: currentScheduleId,
        lat,
        lng,
        afterSequence,
      })
      if (result.success) {
        setMessage({ type: 'success', text: '📍 Desvío añadido.' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    })
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

  const handleSaveNewRoute = () => {
    if (!newRouteData.zoneName) return setMessage({ type: 'error', text: 'La zona es requerida.' })
    if (newRouteData.days.length === 0) return setMessage({ type: 'error', text: 'Selecciona al menos un día.' })
    if (newWaypoints.length === 0) return setMessage({ type: 'error', text: 'Añade al menos un punto en el mapa.' })

    setMessage(null)
    startTransition(async () => {
      const result = await createFullRouteAction({
        zoneName: newRouteData.zoneName,
        shift: newRouteData.shift,
        routeType: newRouteData.routeType,
        days: newRouteData.days,
        waypoints: newWaypoints
      })
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        setIsCreatingRoute(false)
        setNewWaypoints([])
        setNewRouteData({ zoneName: '', shift: 'MANANA', routeType: 'NORMAL', days: [] })
        // Seleccionar la nueva ruta (el refresh de next traerá los nuevos datos, seleccionaremos el primero aproximado)
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    })
  }

  const handleCancelCreate = () => {
    setIsCreatingRoute(false)
    setIsFullscreen(false)
    setNewWaypoints([])
    setNewRouteData({ zoneName: '', shift: 'MANANA', routeType: 'NORMAL', days: [] })
    setPendingPoint(null)
    setMessage(null)
  }

  const handleSavePoint = () => {
    if (!pendingPoint) return
    if (!pointForm.originPoint) {
      setMessage({ type: 'error', text: 'El Punto de Salida es requerido.' })
      return
    }
    setNewWaypoints([...newWaypoints, {
      lat: pendingPoint.lat,
      lng: pendingPoint.lng,
      ...pointForm
    }])
    setPendingPoint(null)
    setPointForm({ originPoint: '', destinationPoint: '', departureTime: '06:00', arrivalTime: '06:30', hasCampanio: false, observations: '' })
    setMessage(null)
  }

  const handleDeleteRoute = () => {
    if (!currentScheduleId) return
    startTransition(async () => {
      const result = await deleteFullRouteAction(currentScheduleId)
      if (result.success) {
        setShowDeleteConfirm(false)
        setMessage({ type: 'success', text: result.message })
        router.refresh()
      } else {
        setShowDeleteConfirm(false)
        setMessage({ type: 'error', text: result.message })
      }
    })
  }


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
        {/* Selector de ruta / Crear nueva */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Filter size={16} className="text-blue-500" />
              {isCreatingRoute ? 'Modo Creación' : 'Seleccionar Ruta'}
            </label>
            {!isCreatingRoute ? (
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
            ) : (
              <div className="text-sm text-slate-600 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl font-medium">
                Estás creando una nueva ruta. Define los datos a la derecha y dibuja en el mapa.
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {/* Botón volver (solo en modo creación) */}
            {isCreatingRoute && (
              <button
                onClick={handleCancelCreate}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-colors border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <ArrowLeft size={16} />
                Regresar
              </button>
            )}
            {/* Botón eliminar ruta (solo en modo selección con ruta activa) */}
            {!isCreatingRoute && currentRoute && (
              <>
                <button
                  onClick={() => handleToggleSimulation(currentRoute.scheduleId, !currentRoute.isSimulating)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-colors border shadow-sm ${
                    currentRoute.isSimulating 
                    ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {currentRoute.isSimulating ? (
                    <><Square size={16} /> Detener Simulación</>
                  ) : (
                    <><Play size={16} /> Simular Recorrido</>
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-colors border border-red-200 bg-white text-red-600 hover:bg-red-50 shadow-sm"
                >
                  <Trash2 size={16} />
                  Eliminar Ruta
                </button>
              </>
            )}
            <button
              onClick={() => {
                if (isCreatingRoute) {
                  handleCancelCreate()
                } else {
                  setIsCreatingRoute(true)
                  setIsFullscreen(true)
                }
              }}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-colors border shadow-sm ${
                isCreatingRoute 
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' 
                : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
              }`}
            >
              {isCreatingRoute ? 'Cancelar Creación' : 'Crear Nueva Ruta'}
            </button>
          </div>
        </div>


        {/* Secuencia Vertical Desplegable */}
        {!isCreatingRoute && currentRoute && (() => {
          const waypoints = dataset.filter((s) => {
            const k = `${s.zoneName || 'Sin Zona'}|${s.days.join(',')}|${s.shift}`
            return k === selectedRouteKey
          }).sort((a, b) => a.sequence - b.sequence)

          if (waypoints.length === 0) return null

          const nodes = []
          const visibleWaypoints = waypoints.filter(w => w.originPoint !== 'VIA_POINT')
          
          visibleWaypoints.forEach((w, i) => {
            if (i === 0) {
              nodes.push({ title: w.originPoint, isFirst: true, isLast: false })
            } else {
              nodes.push({ title: w.originPoint, isFirst: false, isLast: false })
            }
          })
          if (visibleWaypoints.length > 0) {
            const lastW = visibleWaypoints[visibleWaypoints.length - 1]
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
        {message && !isFullscreen && (
          <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        {/* Mapa editable / creador */}
        {(currentRoute || isCreatingRoute) && (
          <div className={isFullscreen
            ? "fixed inset-0 z-[100] bg-slate-50 flex flex-col md:flex-row h-screen w-screen overflow-hidden"
            : "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          }>

            {/* Zona del mapa */}
            <div className={isFullscreen ? "flex-1 h-full relative flex flex-col" : "flex flex-col"}>

              {/* Toolbar */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  {isCreatingRoute ? (
                    <>
                      <p className="font-bold text-slate-800 text-sm">Nueva Ruta</p>
                      <p className="text-xs text-slate-400 mt-0.5">{newWaypoints.length} puntos añadidos</p>
                    </>
                  ) : currentRoute ? (
                    <>
                      <p className="font-bold text-slate-800 text-sm">{currentRoute.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {dataset.filter((s) => {
                          const k = `${s.zoneName || 'Sin Zona'}|${s.days.join(',')}|${s.shift}`
                          return k === selectedRouteKey
                        }).length} puntos
                      </p>
                    </>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {!isCreatingRoute && dirtyIds.size > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-3 py-1 rounded-full border border-amber-200">
                      {dirtyIds.size} modificado{dirtyIds.size > 1 ? 's' : ''}
                    </span>
                  )}

                  {/* Botón añadir punto (solo modo edición normal) */}
                  {!isCreatingRoute && (
                    <button
                      onClick={() => setIsAddMode((v) => !v)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        isAddMode
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'text-slate-600 border-slate-200 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <Plus size={14} />
                      {isAddMode ? 'Cancelar' : 'Añadir punto'}
                    </button>
                  )}

                  {!isFullscreen && !isCreatingRoute && dirtyIds.size > 0 && (
                    <button
                      onClick={handleSave}
                      disabled={isPending}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 transition-colors disabled:opacity-60"
                    >
                      <Save size={13} />
                      {isPending ? 'Guardando...' : 'Guardar'}
                    </button>
                  )}

                  {!isFullscreen && (
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Maximize size={18} />
                    </button>
                  )}
                  {isFullscreen && !isCreatingRoute && (
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Minimize size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Mapa Componente */}
              <div className={isFullscreen ? 'flex-1' : 'min-h-[500px]'}>
                <EditableMapComponent
                  routeKey={selectedRouteKey}
                  dataset={dataset}
                  onCoordChange={handleCoordChange}
                  dirtyIds={dirtyIds}
                  pendingCoords={pendingCoords}
                  isFullscreen={isFullscreen}
                  searchMarker={searchResult}
                  isAddMode={isAddMode}
                  onAddWaypoint={(lat, lng) => { handleAddWaypoint(lat, lng); setIsAddMode(false) }}
                  onDeleteWaypoint={handleDeleteWaypoint}
                  onInsertViaPoint={handleInsertViaPoint}
                  isCreatingRoute={isCreatingRoute}
                  newWaypoints={newWaypoints}
                  setNewWaypoints={setNewWaypoints}
                  onMapClickForCreate={(lat, lng) => setPendingPoint({ lat, lng })}
                />
              </div>
            </div>

            {/* Sidebar en Fullscreen */}
            {isFullscreen && (
              <div className="w-full md:w-96 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden shadow-2xl relative z-[200]">
                {/* Header sidebar */}
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                  {isCreatingRoute ? (
                    <button
                      onClick={handleCancelCreate}
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                      title="Regresar"
                    >
                      <ArrowLeft size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                    >
                      <ArrowLeft size={20} />
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">
                      {isCreatingRoute ? 'Configurar Nueva Ruta' : currentRoute?.label}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isCreatingRoute ? 'Detalles de la ruta' : 'Editor de ruta'}
                    </p>
                  </div>
                </div>

                {isCreatingRoute ? (
                  // Formulario de creación
                  <>
                    {searchStreetUI}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                      <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Zona</label>
                      <input 
                        type="text" 
                        value={newRouteData.zoneName}
                        onChange={e => setNewRouteData({...newRouteData, zoneName: e.target.value})}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300"
                        placeholder="Ej: Centro Histórico"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Turno</label>
                        <select 
                          value={newRouteData.shift}
                          onChange={e => setNewRouteData({...newRouteData, shift: e.target.value})}
                          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300"
                        >
                          <option value="MANANA">Mañana</option>
                          <option value="TARDE">Tarde</option>
                          <option value="NOCHE">Noche</option>
                          <option value="DOMINGO">Domingo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tipo</label>
                        <select 
                          value={newRouteData.routeType}
                          onChange={e => setNewRouteData({...newRouteData, routeType: e.target.value})}
                          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300"
                        >
                          <option value="NORMAL">Normal</option>
                          <option value="REPECHAJE">Repechaje</option>
                          <option value="FURGON">Furgón</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Días</label>
                      <div className="flex flex-wrap gap-2">
                        {['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'].map(day => (
                          <label key={day} className="flex items-center gap-1 text-sm bg-slate-50 px-2 py-1 border rounded-lg cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={newRouteData.days.includes(day)}
                              onChange={(e) => {
                                if (e.target.checked) setNewRouteData({...newRouteData, days: [...newRouteData.days, day]})
                                else setNewRouteData({...newRouteData, days: newRouteData.days.filter(d => d !== day)})
                              }}
                            />
                            {day.substring(0,3)}
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Puntos de la ruta ({newWaypoints.length})</p>
                      <div className="relative">
                        <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 via-emerald-100 to-transparent" />
                        <ul className="space-y-3 relative">
                          {newWaypoints.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Haz clic en el mapa para añadir puntos.</p>
                          ) : newWaypoints.map((wp, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-white border-2 border-emerald-500 text-emerald-600 flex flex-col items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm">
                                {i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-700">{wp.originPoint}</p>
                                <p className="text-[10px] text-slate-500 truncate">A: {wp.destinationPoint}</p>
                                <button onClick={() => setNewWaypoints(newWaypoints.filter((_, idx) => idx !== i))} className="text-[10px] text-red-500 hover:underline mt-1 block">Eliminar</button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  </>
                ) : (
                  // Normal Sidebar
                  <>
                    {searchStreetUI}

                    <div className="flex-1 overflow-y-auto p-5">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Secuencia</p>
                      <div className="relative">
                        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-blue-100 to-transparent" />
                        <ul className="space-y-4 relative">
                          {dataset.filter((s) => `${s.zoneName || 'Sin Zona'}|${s.days.join(',')}|${s.shift}` === selectedRouteKey)
                             .sort((a,b)=>a.sequence-b.sequence)
                             .filter(w => w.originPoint !== 'VIA_POINT')
                             .map((w, i, arr) => (
                            <li key={i} className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-200 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm">{i + 1}</div>
                              <div className="flex-1 min-w-0 pt-1">
                                <p className="text-sm font-semibold text-slate-700 break-words">{w.originPoint}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )}

                <div className="p-5 border-t border-slate-100 bg-slate-50">
                  {message && (
                    <div className={`flex items-center gap-2 p-3 mb-3 rounded-lg text-xs font-medium border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {message.text}
                    </div>
                  )}
                  {isCreatingRoute ? (
                    <button
                      onClick={handleSaveNewRoute}
                      disabled={isPending || newWaypoints.length === 0}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl transition-colors shadow-sm disabled:opacity-60"
                    >
                      <Save size={18} />
                      {isPending ? 'Creando...' : 'Guardar Nueva Ruta'}
                    </button>
                  ) : (
                    <button
                      onClick={handleSave}
                      disabled={isPending || dirtyIds.size === 0}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl transition-colors shadow-sm disabled:opacity-60"
                    >
                      <Save size={18} />
                      {isPending ? 'Guardando...' : `Guardar ${dirtyIds.size} cambios`}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modal de confirmación para eliminar ruta */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={22} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Eliminar Ruta</h3>
                <p className="text-sm text-slate-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar la ruta{' '}
              <span className="font-semibold text-slate-800">{currentRoute?.label}</span>?
              Se eliminarán todos los puntos y datos asociados.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteRoute}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm disabled:opacity-60"
              >
                {isPending ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear nuevo punto (horario) en el mapa */}
      {pendingPoint && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <List size={22} className="text-blue-600" />
                <h3 className="font-bold text-slate-800 text-xl">Nuevo Horario (Punto)</h3>
              </div>
              <button onClick={() => setPendingPoint(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Ruta / Días no se editan por punto en la interfaz del cliente, ya están en el sidebar.
                  Solo pedimos los campos del punto específico. */}
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Punto Salida *</label>
                <input 
                  type="text" 
                  value={pointForm.originPoint}
                  onChange={e => setPointForm({...pointForm, originPoint: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej: Av. Principal 123"
                  autoFocus
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Punto Llegada</label>
                <input 
                  type="text" 
                  value={pointForm.destinationPoint}
                  onChange={e => setPointForm({...pointForm, destinationPoint: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej: Plaza Central"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Hora Salida</label>
                <input 
                  type="time" 
                  value={pointForm.departureTime}
                  onChange={e => setPointForm({...pointForm, departureTime: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Hora Llegada</label>
                <input 
                  type="time" 
                  value={pointForm.arrivalTime}
                  onChange={e => setPointForm({...pointForm, arrivalTime: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Campaneo (0 o 1)</label>
                <select
                  value={pointForm.hasCampanio ? '1' : '0'}
                  onChange={e => setPointForm({...pointForm, hasCampanio: e.target.value === '1'})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="0">0 (No)</option>
                  <option value="1">1 (Sí)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Observaciones</label>
                <textarea 
                  value={pointForm.observations}
                  onChange={e => setPointForm({...pointForm, observations: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Opcional..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setPendingPoint(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePoint}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
