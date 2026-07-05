'use client'

import React, { useState } from 'react'
import useSWR from 'swr'
import { Clock, Calendar, Search, X, MapPin, Map, Truck } from 'lucide-react'
import type { FlatSchedule } from '@/features/schedules/services/schedule.service'

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Error al cargar los horarios')
  return res.json()
})

const DAY_ORDER = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']

const ZONE_COLORS = [
  'from-emerald-400 to-emerald-600',
  'from-teal-400 to-teal-600',
  'from-green-400 to-green-600',
  'from-lime-400 to-lime-600',
  'from-emerald-500 to-teal-500',
]

const SHIFT_COLORS: Record<string, string> = {
  'MANANA': 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 border-sky-200',
  'TARDE': 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200',
  'NOCHE': 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200',
  'DOMINGO': 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border-rose-200',
}

const formatShift = (shift: string) => {
  return shift === 'MANANA' ? 'MAÑANA' : shift;
}

const formatTime = (timeStr: string | null | undefined) => {
  if (!timeStr) return '--:--'
  try {
    const [hourStr, minStr] = timeStr.split(':')
    const hour = parseInt(hourStr, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const formattedHour = hour % 12 || 12
    const paddedHour = formattedHour.toString().padStart(2, '0')
    return `${paddedHour}:${minStr} ${ampm}`
  } catch (e) {
    return timeStr
  }
}

const DAY_NAMES: Record<string, string> = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves', VIERNES: 'Viernes', SABADO: 'Sábado', DOMINGO: 'Domingo',
}

export default function SchedulesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Obtener TODOS los horarios solo una vez para generar las sugerencias de autocompletado
  const { data: allSchedules = [] } = useSWR<FlatSchedule[]>('/api/schedules', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false
  })

  // Datos estáticos de fallback para cuando la BD no tenga datos cargados aún
  const STATIC_SUGGESTIONS = [
    'ZONA 01', 'ZONA 02', 'ZONA 03', 'ZONA 04', 'ZONA 05',
    'Av. Tupac Amaru', 'Av. Garcilaso', 'Av. El Sol', 'Av. Infancia',
    'Calle Arcopata', 'Calle Lechugal', 'Calle Saphi', 'Calle Suecia',
    'Jr. Tullumayo', 'Jr. Pumacurco', 'Jr. Siete Cuartones',
    'Urb. Ttio', 'Urb. Magisterio', 'Urb. Los Sauces', 'Urb. Santa Monica',
    'APV. Los Geranios', 'APV. Villa el Sol', 'APV. Daniel Paiva',
    'AA.HH. Sol Naciente', 'AA.HH. Villa Hermosa',
    'Prolongacion Av. Cultura', 'Calle Romeritos', 'Calle Ayacucho',
  ]

  // Generar el diccionario de sugerencias únicas (Zonas, Inicios y Destinos de las Zonas 1 al 5)
  // Si la BD tiene datos, los combina con el pool estático; si no, usa solo el estático
  const suggestionsPool = React.useMemo(() => {
    const pool = new Set<string>(STATIC_SUGGESTIONS)
    ;(allSchedules ?? []).forEach(s => {
      const zName = s.zoneName || ''
      if (/^ZONA\s*0?[1-5]$/i.test(zName)) {
        if (zName) pool.add(zName)
        if (s.originPoint) pool.add(s.originPoint)
        if (s.destinationPoint) pool.add(s.destinationPoint)
      }
    })
    return Array.from(pool).sort()
  }, [allSchedules])

  // Filtrar sugerencias en base a lo que el usuario escribe
  const filteredSuggestions = React.useMemo(() => {
    if (searchQuery.trim().length === 0) return []
    const q = searchQuery.toLowerCase()
    return suggestionsPool.filter(item => item.toLowerCase().includes(q)).slice(0, 6) // mostrar máximo 6
  }, [searchQuery, suggestionsPool])

  // SWR maneja el fetching, el estado de carga, errores y el polling automáticamente
  // Si activeSearch está vacío, pasa 'null' para que SWR no haga la petición (Estado Inicial)
  const { data: schedules = [], error, isLoading: loading } = useSWR<FlatSchedule[]>(
    activeSearch.trim().length > 0 ? `/api/schedules?search=${encodeURIComponent(activeSearch.trim())}` : null,
    fetcher,
    { 
      refreshInterval: 15000, // Polling cada 15 segundos para "tiempo real"
      revalidateOnFocus: true // Refrescar si el usuario cambia de pestaña y vuelve
    }
  )

  const handleSearch = () => {
    if (searchQuery.trim().length > 0) {
      setActiveSearch(searchQuery.trim())
      setShowSuggestions(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setActiveSearch('')
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const schedulesSafe = schedules ?? []

  const scheduleGroups = schedulesSafe.reduce<Record<string, {
    scheduleId: number; zoneName: string; shift: string; days: string[]; waypoints: FlatSchedule[]; isSuspended: boolean;
  }>>((acc, s) => {
    const zoneName = s.zoneName || 'Sin Zona'
    if (!/^ZONA\s*0?[1-5]$/i.test(zoneName)) return acc
    const key = `${s.scheduleId}`
    if (!acc[key]) {
      acc[key] = { scheduleId: s.scheduleId, zoneName, shift: s.shift, days: s.days, waypoints: [], isSuspended: s.isSuspended }
    }
    acc[key].waypoints.push(s)
    return acc
  }, {})

  Object.values(scheduleGroups).forEach(g => {
    g.waypoints.sort((a, b) => a.sequence - b.sequence)
  })

  const today = new Date()
  const todayDayMap = [6, 0, 1, 2, 3, 4, 5]

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const currentMonth = monthNames[today.getMonth()]
  const currentYear = today.getFullYear()

  const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, today.getMonth(), 1).getDay()
  const todayDate = today.getDate()

  const collectionDayIndices = new Set<number>()
  schedulesSafe.forEach(s => {
    s.days?.forEach(d => {
      const idx = DAY_ORDER.indexOf(d)
      if (idx !== -1) collectionDayIndices.add(idx)
    })
  })

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      <div className="bg-white border-b border-slate-200 pt-12 pb-16 px-4 relative shadow-sm z-30">
        <div className="max-w-[1200px] mx-auto relative z-30 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
            Horarios de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Recolección</span>
          </h1>
          <p className="text-slate-500 text-base max-w-2xl mx-auto mb-8 font-medium">
            Consulta los días y horas de recolección de residuos en tu zona para mantener nuestra ciudad limpia y ordenada.
          </p>

          {/* Search Bar - Green Theme with Autocomplete */}
          <div className="max-w-2xl mx-auto relative">
            <div className="bg-white p-2 rounded-2xl shadow-md shadow-emerald-500/5 border border-slate-200 flex items-center transition-all focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/10">
              <div className="pl-4 pr-2 text-emerald-500">
                <Search size={22} />
              </div>
              <input
                type="text"
                placeholder="Ingresa tu calle, barrio o punto de referencia..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 outline-none text-base px-2"
              />
              {searchQuery && (
                <button onClick={handleClearSearch} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                  <X size={20} />
                </button>
              )}
              <button
                onClick={handleSearch}
                disabled={searchQuery.trim().length === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
              >
                Buscar
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-2 duration-200">
                <ul className="py-2">
                  {filteredSuggestions.map((suggestion, idx) => (
                    <li key={idx}>
                      <button
                        className="w-full text-left px-5 py-3 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-medium transition-colors flex items-center gap-3"
                        onClick={() => {
                          setSearchQuery(suggestion)
                          setActiveSearch(suggestion)
                          setShowSuggestions(false)
                        }}
                      >
                        <MapPin size={16} className="text-emerald-400 shrink-0" />
                        <span className="truncate">{suggestion}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 xl:px-8 mt-8 relative z-20">
        <div className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-6">
            {!activeSearch ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="w-full h-64 bg-emerald-50 relative overflow-hidden flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1517783999520-f068d7431a60?q=80&w=2070&auto=format&fit=crop" 
                    alt="Ciudad Limpia" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply filter contrast-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
                  <div className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-8">
                    <Map className="text-emerald-500" size={36} />
                  </div>
                </div>
                <div className="p-10 pt-4 max-w-lg">
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">Encuentra tu Horario</h3>
                  <p className="text-slate-500 leading-relaxed mb-6">
                    Ingresa el nombre de tu calle, avenida o barrio en el buscador de arriba para descubrir los días y horas exactas en las que el camión recolector pasará por tu vivienda.
                  </p>
                </div>
              </div>
            ) : loading ? (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-pulse flex flex-col gap-4">
                    <div className="h-6 bg-slate-200 rounded-md w-1/3"></div>
                    <div className="h-20 bg-slate-100 rounded-xl w-full mt-4"></div>
                    <div className="h-20 bg-slate-100 rounded-xl w-full"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full text-red-600"><X size={24}/></div>
                <div>
                  <h4 className="font-bold text-lg">Hubo un problema</h4>
                  <p className="text-red-600/80 mt-1">{error}</p>
                </div>
              </div>
            ) : Object.keys(scheduleGroups).length === 0 ? (
              <div className="bg-white p-16 rounded-3xl border border-slate-200 shadow-sm text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <MapPin size={48} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Sin resultados</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  No encontramos zonas o puntos de recolección que coincidan con "{activeSearch}".
                </p>
                <button onClick={handleClearSearch} className="mt-6 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold hover:bg-slate-200 transition-colors">
                  Intentar con otra búsqueda
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.values(scheduleGroups).map((group) => {
                  // Construir nodos del timeline a partir de los waypoints
                  type TimelineNode = { location: string; time: string | null; type: 'start' | 'stop' | 'end'; obs: string; isSuspended: boolean }
                  const nodes: TimelineNode[] = []
                  group.waypoints.forEach((w, i) => {
                    if (i === 0) {
                      nodes.push({ location: w.originPoint, time: w.waypointDepartureTime, type: 'start', obs: 'Punto de partida del camión.', isSuspended: w.isWaypointSuspended })
                    } else {
                      nodes.push({ location: w.originPoint, time: w.waypointDepartureTime, type: 'stop', obs: w.observations || 'Recolección aquí. Asegúrese de tener sus desechos listos.', isSuspended: w.isWaypointSuspended })
                    }
                  })
                  if (group.waypoints.length > 0) {
                    const last = group.waypoints[group.waypoints.length - 1]
                    nodes.push({ location: last.destinationPoint, time: last.waypointArrivalTime, type: 'end', obs: 'Última parada del recorrido.', isSuspended: last.isWaypointSuspended })
                  }
                  const NODE_LABELS: Record<string, string> = {
                    start: 'INICIO RUTA',
                    stop: 'PARADA DE RECOLECCIÓN',
                    end: 'FIN RUTA',
                  }

                  return (
                    <div key={group.scheduleId} className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-shadow ${group.isSuspended ? 'border-red-200 shadow-red-100/50' : 'border-slate-200 hover:shadow-md'}`}>

                      {/* Banner de Suspensión */}
                      {group.isSuspended && (
                        <div className="bg-red-500 text-white px-6 py-3 flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                          <span className="font-extrabold uppercase tracking-wide text-sm">Servicio Suspendido Temporalmente</span>
                        </div>
                      )}

                      {/* Header verde */}
                      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                          <MapPin size={18} className="text-white stroke-[2.5]" />
                        </div>
                        <h2 className="text-white font-extrabold text-base md:text-lg tracking-widest uppercase">
                          Horario de Recolección — {group.zoneName}
                        </h2>
                      </div>

                      {/* Sub-header: días y turno */}
                      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
                        <p className="text-base font-semibold text-slate-800">
                          <span className="font-extrabold text-slate-900">Días de servicio:</span>{' '}
                          <span className="text-emerald-700 font-bold">
                            {group.days.map(d => DAY_NAMES[d] || d).join(', ')}
                          </span>
                        </p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                          SHIFT_COLORS[group.shift] || 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          TURNO {formatShift(group.shift)}
                        </span>
                      </div>

                      {/* Mensaje informativo para el ciudadano */}
                      {activeSearch && (
                        <div className="px-6 pt-5 pb-1">
                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
                            <p className="text-base text-emerald-900 leading-relaxed font-medium mb-3">
                              <span className="font-bold text-lg">♻️ Estimado(a) ciudadano(a) del distrito de Wanchaq:</span>
                            </p>
                            <p className="text-base text-emerald-900 leading-relaxed font-medium mb-3">
                              Le informamos que el camión recolector de residuos sólidos pasará por <span className="font-bold uppercase">{
                                nodes.find(n => n.location.toLowerCase().includes(activeSearch.toLowerCase().trim()))?.location || activeSearch
                              }</span> los días <span className="font-bold lowercase">{group.days.map(d => DAY_NAMES[d] || d).join(', ')}</span>, aproximadamente a las <span className="font-bold">{
                                nodes.find(n => n.location.toLowerCase().includes(activeSearch.toLowerCase().trim()))?.time 
                                  ? formatTime(nodes.find(n => n.location.toLowerCase().includes(activeSearch.toLowerCase().trim()))!.time) 
                                  : '--:--'
                              }</span>.
                            </p>
                            <p className="text-base text-emerald-900 leading-relaxed font-medium mb-3">
                              Le recomendamos tener sus residuos listos y sacarlos unos minutos antes de la hora programada, para facilitar una recolección oportuna y mantener limpio nuestro distrito.
                            </p>
                            <p className="text-base text-emerald-900 leading-relaxed font-medium">
                              Agradecemos su colaboración y compromiso con el cuidado del medio ambiente. 🌱
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Body: ilustración + timeline */}
                      <div className="p-6 flex flex-col md:flex-row gap-8 items-start">

                        {/* Izquierda: ilustración del camión */}
                        <div className="flex-shrink-0 flex flex-col items-center gap-3 md:w-44">
                          <div className="w-44 h-36 flex items-center justify-center">
                            <img
                              src="/images/garbage-truck.jpg"
                              alt="Camión recolector"
                              className="w-full h-full object-contain drop-shadow-md"
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Camión Recolector</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              {nodes.length} parada{nodes.length !== 1 ? 's' : ''} en ruta
                            </p>
                          </div>
                        </div>

                        {/* Derecha: timeline */}
                        <div className="flex-1 min-w-0">
                          {nodes.map((node, ni) => {
                            // ✅ Solo resaltar en verde si la ubicación contiene la búsqueda activa
                            const searchTerm = activeSearch.toLowerCase().trim()
                            const isMatch = searchTerm.length > 0
                              ? node.location.toLowerCase().includes(searchTerm)
                              : false
                            const isLast = ni === nodes.length - 1
                            return (
                              <div key={ni} className="flex gap-4">

                                {/* Columna del marcador + conector */}
                                <div className="flex flex-col items-center w-14 shrink-0">
                                  {/* Señal STOP octagonal: rojo si está suspendida, verde si coincide, gris por defecto */}
                                  <div
                                    className={`w-12 h-12 flex items-center justify-center text-[9px] font-extrabold text-white tracking-wider shrink-0 z-10 transition-all ${
                                      node.isSuspended
                                        ? 'bg-red-500 shadow-lg shadow-red-500/30 line-through decoration-white/50'
                                        : isMatch
                                          ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                                          : 'bg-slate-400'
                                    }`}
                                    style={{ clipPath: 'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)' }}
                                  >
                                    STOP
                                  </div>
                                  {/* Conector con flecha */}
                                  {!isLast && (
                                    <div className="flex flex-col items-center flex-1 py-1" style={{ minHeight: '44px' }}>
                                      <div className={`w-0.5 flex-1 ${
                                        node.isSuspended ? 'bg-red-200' : isMatch ? 'bg-emerald-400' : 'bg-slate-300'
                                      }`} />
                                      <svg width="10" height="6" viewBox="0 0 10 6" className="shrink-0" fill={node.isSuspended ? '#fecaca' : isMatch ? '#34d399' : '#cbd5e1'}>
                                        <path d="M5 6L0 0h10z"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>

                                {/* Contenido de la parada */}
                                <div className={`flex-1 min-w-0 ${!isLast ? 'pb-6' : 'pb-0'} pt-1 ${node.isSuspended ? 'opacity-60' : ''}`}>
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <p className="font-extrabold text-slate-800 text-sm md:text-base leading-tight">
                                      <span className={`font-mono ${node.isSuspended ? 'line-through text-slate-500' : ''}`}>{node.time ? formatTime(node.time) : '--:--'}</span>{' '}
                                      <span className={isMatch && !node.isSuspended ? 'text-emerald-600' : 'text-slate-700'}>
                                        — {node.isSuspended ? 'PARADA SUSPENDIDA' : NODE_LABELS[node.type]}
                                      </span>
                                    </p>
                                    {isMatch && !node.isSuspended && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1 border border-emerald-200 animate-pulse shadow-sm">
                                        📍 Tu calle
                                      </span>
                                    )}
                                  </div>
                                  <p className={`font-semibold text-slate-800 ${node.isSuspended ? 'line-through text-slate-500' : ''}`}>{node.location}</p>
                                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{node.obs}</p>
                                </div>

                              </div>
                            )
                          })}
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}