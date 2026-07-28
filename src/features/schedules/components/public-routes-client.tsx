'use client'

import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Search, MapPin, Clock, Calendar, Truck, ChevronDown, ChevronUp, X, List, Maximize, Minimize } from 'lucide-react'
import type { FlatSchedule } from '@/features/schedules/services/schedule.service'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

// Cargamos el map viewer dinámicamente
const RouteMapViewer = dynamic<{ routeKey: string; dataset: FlatSchedule[]; isFullscreen?: boolean }>(
  () => import('@/features/schedules/components/route-map-viewer').then((m) => m.RouteMapViewer as any),
  { ssr: false, loading: () => <div className="h-[320px] bg-slate-100 animate-pulse rounded-2xl" /> }
)

interface PublicRoutesClientProps {
  dataset: FlatSchedule[]
}

const ZONE_COLORS = [
  'from-emerald-400 to-emerald-600',
  'from-teal-400 to-teal-600',
  'from-green-400 to-green-600',
  'from-lime-500 to-lime-700',
  'from-emerald-500 to-teal-500',
]

const SHIFT_LABELS: Record<string, string> = {
  MANANA: 'Turno Mañana',
  TARDE: 'Turno Tarde',
  NOCHE: 'Turno Noche',
  DOMINGO: 'Turno Domingo',
}

const SHIFT_COLORS: Record<string, string> = {
  MANANA: 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 border-sky-200',
  TARDE:  'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200',
  NOCHE:  'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200',
  DOMINGO:'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border-rose-200',
}

export function PublicRoutesClient({ dataset }: PublicRoutesClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [expandedRouteKey, setExpandedRouteKey] = useState<string | null>(null)

  const { data: currentDataset = dataset } = useSWR<FlatSchedule[]>('/api/schedules', fetcher, {
    fallbackData: dataset,
    refreshInterval: 5000,
  })

  // Pool de sugerencias de calles y zonas
  const suggestionsPool = useMemo(() => {
    const pool = new Set<string>()
    currentDataset.forEach((s) => {
      if (s.zoneName) pool.add(s.zoneName)
      if (s.originPoint && s.originPoint !== 'VIA_POINT') pool.add(s.originPoint)
      if (s.destinationPoint && s.destinationPoint !== 'VIA_POINT') pool.add(s.destinationPoint)
    })
    return Array.from(pool).sort()
  }, [currentDataset])

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return suggestionsPool.filter((s) => s.toLowerCase().includes(q)).slice(0, 6)
  }, [searchQuery, suggestionsPool])

  // Agrupar rutas únicas por Zona + Días + Turno
  const groupedRoutes = useMemo(() => {
    const map = new Map<string, {
      key: string
      zoneName: string
      days: string[]
      shift: string
      schedule: string
      coverage: string
      waypoints: FlatSchedule[]
    }>()
    currentDataset.forEach((s) => {
      const key = `${s.zoneName || 'Sin Zona'}|${s.days.join(',')}|${s.shift}`
      if (!map.has(key)) {
        map.set(key, {
          key,
          zoneName: s.zoneName || 'Sin Zona',
          days: s.days,
          shift: s.shift,
          schedule: `${s.departureTime || '--:--'} – ${s.arrivalTime || '--:--'}`,
          coverage: '',
          waypoints: [],
        })
      }
      map.get(key)!.waypoints.push(s)
    })
    Array.from(map.values()).forEach((g) => {
      g.waypoints.sort((a, b) => a.sequence - b.sequence)
      const realWaypoints = g.waypoints.filter(w => w.originPoint !== 'VIA_POINT')
      if (realWaypoints.length > 0) {
        const last = realWaypoints[realWaypoints.length - 1]
        g.coverage = `${realWaypoints[0].originPoint} → ${last.destinationPoint || last.originPoint}`
      }
    })
    return Array.from(map.values())
  }, [currentDataset])

  // Filtrar según búsqueda
  const filteredRoutes = useMemo(() => {
    if (!activeSearch.trim()) return groupedRoutes
    const term = activeSearch.toLowerCase()
    return groupedRoutes.filter((route) => {
      if (route.zoneName.toLowerCase().includes(term)) return true
      if (route.days.join(', ').toLowerCase().includes(term)) return true
      return route.waypoints.some(
        (w) =>
          (w.originPoint.toLowerCase().includes(term) && w.originPoint !== 'VIA_POINT') ||
          (w.destinationPoint.toLowerCase().includes(term) && w.destinationPoint !== 'VIA_POINT')
      )
    })
  }, [groupedRoutes, activeSearch])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveSearch(searchQuery.trim())
      setShowSuggestions(false)
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    setActiveSearch('')
    setShowSuggestions(false)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      {/* Header / Hero */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-16 px-4 relative shadow-sm">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
            Rutas de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Recolección
            </span>
          </h1>
          <p className="text-slate-500 text-base max-w-2xl mx-auto mb-8 font-medium">
            Consulta el trazado, horarios y puntos de paso del camión recolector en tu zona.
          </p>

          {/* Buscador estilo schedules */}
          <div className="max-w-2xl mx-auto relative">
            <div className="bg-white p-2 rounded-2xl shadow-md shadow-emerald-500/5 border border-slate-200 flex items-center transition-all focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/20 hover:shadow-lg">
              <div className="pl-4 pr-2 text-emerald-500">
                <Search size={22} />
              </div>
              <input
                type="text"
                placeholder="Busca tu calle, zona o referencia..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 outline-none text-base px-2"
              />
              {searchQuery && (
                <button onClick={handleClear} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                  <X size={20} />
                </button>
              )}
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
              >
                Buscar
              </button>
            </div>

            {/* Sugerencias */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 text-left">
                <ul className="py-2">
                  {filteredSuggestions.map((s, idx) => (
                    <li key={idx}>
                      <button
                        className="w-full text-left px-5 py-3 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-medium transition-colors flex items-center gap-3"
                        onMouseDown={() => {
                          setSearchQuery(s)
                          setActiveSearch(s)
                          setShowSuggestions(false)
                        }}
                      >
                        <MapPin size={16} className="text-emerald-400 shrink-0" />
                        <span className="truncate">{s}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-[1200px] mx-auto px-4 mt-8">
        {/* Estado inicial sin búsqueda */}
        {!activeSearch ? (
          <div className="space-y-6">
            <p className="text-slate-500 text-sm font-medium">{groupedRoutes.length} rutas disponibles</p>
            {groupedRoutes.map((route, i) => {
              const isExpanded = expandedRouteKey === route.key
              return (
                <RouteCard
                  key={route.key}
                  route={route}
                  isExpanded={isExpanded}
                  colorIdx={i}
                  dataset={currentDataset}
                  onToggle={() => setExpandedRouteKey(isExpanded ? null : route.key)}
                />
              )
            })}
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-slate-200 shadow-sm text-center mt-6">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Sin resultados</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              No encontramos rutas que pasen por "{activeSearch}".
            </p>
            <button onClick={handleClear} className="mt-6 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold hover:bg-slate-200 transition-colors">
              Ver todas las rutas
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-slate-500 text-sm font-medium mt-2">
              {filteredRoutes.length} ruta{filteredRoutes.length > 1 ? 's' : ''} encontrada{filteredRoutes.length > 1 ? 's' : ''} para "{activeSearch}"
            </p>
            {filteredRoutes.map((route, i) => {
              const isExpanded = expandedRouteKey === route.key
              return (
                <RouteCard
                  key={route.key}
                  route={route}
                  isExpanded={isExpanded}
                  colorIdx={i}
                  dataset={currentDataset}
                  onToggle={() => setExpandedRouteKey(isExpanded ? null : route.key)}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Componente de tarjeta de ruta ──────────────────────────────────────────
function RouteCard({ route, isExpanded, colorIdx, dataset, onToggle }: {
  route: { key: string; zoneName: string; days: string[]; shift: string; schedule: string; coverage: string; waypoints: FlatSchedule[] }
  isExpanded: boolean
  colorIdx: number
  dataset: FlatSchedule[]
  onToggle: () => void
}) {
  const [showSequence, setShowSequence] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      {/* Header de la tarjeta */}
      <div
        className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ZONE_COLORS[colorIdx % ZONE_COLORS.length]} flex items-center justify-center text-white shadow-md`}>
            <Truck size={22} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{route.zoneName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold border ${SHIFT_COLORS[route.shift] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {SHIFT_LABELS[route.shift] || route.shift}
              </span>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <Calendar size={13} className="text-slate-400" />
                {route.days.join(', ')}
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <Clock size={13} className="text-slate-400" />
                <span className="font-mono font-semibold">{route.schedule}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 shrink-0">
          {isExpanded ? <><ChevronUp size={18} /> Ocultar</> : <><ChevronDown size={18} /> Ver ruta</>}
        </div>
      </div>

      {/* Resumen del recorrido */}
      <div className="px-6 py-4 flex items-start gap-3">
        <MapPin size={15} className="text-slate-400 mt-0.5 shrink-0" />
        <p className="text-sm text-slate-500 leading-snug">{route.coverage}</p>
      </div>

      {/* Contenido expandido: paso a paso + mapa */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-6 md:p-8 space-y-6">
          
          {/* Botón desplegable para la secuencia */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowSequence(!showSequence)}
              className="w-full px-5 py-4 flex items-center justify-between text-slate-700 font-bold hover:bg-emerald-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <List size={18} className="text-emerald-500" />
                Secuencia de la ruta
              </div>
              {showSequence ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showSequence && (
              <div className="p-6 border-t border-slate-100 bg-emerald-50/30">
                <div className="relative">
                  <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 via-emerald-100 to-transparent" />
                  <ul className="space-y-4 relative">
                    {(() => {
                      const nodes = []
                      const realWaypoints = route.waypoints.filter(w => w.originPoint !== 'VIA_POINT')
                      
                      realWaypoints.forEach((w, i) => {
                        if (i === 0) {
                          nodes.push({ title: w.originPoint, arrival: null, departure: w.waypointDepartureTime, isFirst: true, isLast: false })
                        } else {
                          nodes.push({ title: w.originPoint, arrival: realWaypoints[i - 1].waypointArrivalTime, departure: w.waypointDepartureTime, isFirst: false, isLast: false })
                        }
                      })
                      if (realWaypoints.length > 0) {
                        const lastW = realWaypoints[realWaypoints.length - 1]
                        nodes.push({ title: lastW.destinationPoint || lastW.originPoint, arrival: lastW.waypointArrivalTime, departure: null, isFirst: false, isLast: true })
                      }
                      return nodes.map((node, i) => (
                        <li key={i} className="flex gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm border-2 ${
                            node.isFirst
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : node.isLast
                              ? 'bg-slate-800 text-white border-slate-800'
                              : 'bg-white text-emerald-600 border-emerald-200'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-start gap-3">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {node.isFirst ? 'Punto de Inicio' : node.isLast ? 'Punto de Destino Final' : 'Punto de Paso'}
                                </span>
                                <div className="flex items-start gap-2 mt-0.5">
                                  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${node.isLast ? 'bg-emerald-500 shadow-sm shadow-emerald-500/40' : 'bg-slate-300'}`} />
                                  <p className="text-sm font-semibold text-slate-700">{node.title}</p>
                                </div>
                              </div>
                            </div>
                            {(node.arrival || node.departure) && (
                              <div className="flex items-center gap-3 mt-2 p-2 bg-white border border-slate-100 rounded-lg shadow-sm w-fit">
                                {node.arrival && (
                                  <div>
                                    <span className="text-[10px] font-bold text-emerald-600/80 uppercase">Llegada</span>
                                    <p className="font-mono text-xs font-semibold text-emerald-700">{node.arrival}</p>
                                  </div>
                                )}
                                {node.arrival && node.departure && <div className="w-px h-6 bg-slate-200" />}
                                {node.departure && (
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Salida</span>
                                    <p className="font-mono text-xs font-semibold text-slate-700">{node.departure}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </li>
                      ))
                    })()}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Mapa Grande */}
          <div className={isFullscreen ? "fixed inset-0 z-[100] bg-slate-50 flex flex-col h-screen w-screen p-4 md:p-8" : ""}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Mapa del recorrido {isFullscreen && `- ${route.zoneName}`}
              </h4>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                {isFullscreen ? <><Minimize size={14} /> Salir de pantalla completa</> : <><Maximize size={14} /> Pantalla completa</>}
              </button>
            </div>
            
            <div className={`rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white ${isFullscreen ? 'flex-1' : 'h-[500px]'}`}>
              <RouteMapViewer routeKey={route.key} dataset={dataset} isFullscreen={isFullscreen} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
