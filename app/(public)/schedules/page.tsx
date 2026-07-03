'use client'

import React, { useState } from 'react'
import useSWR from 'swr'
import { Clock, Calendar, Search, X, MapPin, Map } from 'lucide-react'
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

  const schedulesByZone = schedulesSafe.reduce<Record<string, FlatSchedule[]>>((acc, s) => {
    const zoneName = s.zoneName || 'Sin Zona'
    
    if (!/^ZONA\s*0?[1-5]$/i.test(zoneName)) {
      return acc
    }

    if (!acc[zoneName]) acc[zoneName] = []
    acc[zoneName].push(s)
    return acc
  }, {})

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

      <div className="max-w-[1600px] mx-auto px-4 xl:px-12 mt-8 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 flex flex-col gap-6">
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
            ) : Object.keys(schedulesByZone).length === 0 ? (
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
                {Object.entries(schedulesByZone).map(([zoneName, zoneSchedules], i) => (
                  <div key={zoneName} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ZONE_COLORS[i % ZONE_COLORS.length]} flex items-center justify-center text-white shadow-md`}>
                          <MapPin size={22} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{zoneName}</h2>
                          <p className="text-emerald-600 text-sm font-semibold">{zoneSchedules.length} puntos de recolección encontrados</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid gap-5">
                        {zoneSchedules.map((schedule) => (
                          <div key={schedule.id} className="relative flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                              <div className="flex items-center gap-2.5 text-slate-800 font-bold">
                                <div className="p-1.5 bg-emerald-100/50 rounded-lg">
                                  <Calendar size={18} className="text-emerald-600" />
                                </div>
                                <span className="leading-tight text-[15px]">{schedule.days?.join(', ') || ''}</span>
                              </div>
                              <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold border w-fit shadow-sm ${SHIFT_COLORS[schedule.shift] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                TURNO {formatShift(schedule.shift)}
                              </div>
                            </div>
                            <div className="grid sm:grid-cols-[1fr_auto] gap-6 sm:gap-10 items-center mt-1">
                              <div className="flex flex-col gap-5">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Punto de Inicio</span>
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 shadow-sm shrink-0"></div>
                                    <span className="font-semibold text-slate-700 text-[13px] leading-relaxed">{schedule.originPoint}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Punto de Destino</span>
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40 shrink-0"></div>
                                    <span className="font-semibold text-slate-700 text-[13px] leading-relaxed">{schedule.destinationPoint}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:pl-8 sm:border-l border-slate-200 bg-white sm:bg-transparent p-4 sm:p-0 rounded-xl shadow-sm border sm:border-0 sm:shadow-none">
                                <div className="flex flex-col sm:items-end">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 hidden sm:block">Salida</span>
                                  <div className="flex items-center gap-1.5 text-slate-600">
                                    <Clock size={14} className="text-slate-400" />
                                    <span className="font-mono font-medium text-[13px]">{formatTime(schedule.waypointDepartureTime)}</span>
                                  </div>
                                </div>
                                <div className="hidden sm:block w-px h-6 bg-slate-200/80 my-1"></div>
                                <div className="flex flex-col sm:items-end">
                                  <span className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-widest mb-1 hidden sm:block">Llegada Estimada</span>
                                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50/80 px-2 py-1 rounded-md">
                                    <Clock size={14} className="text-emerald-600" />
                                    <span className="font-mono text-[13px]">{formatTime(schedule.waypointArrivalTime)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-4 lg:sticky lg:top-8">
            <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Calendario</h3>
                  <p className="text-sm font-medium text-emerald-600 mt-1 capitalize">{currentMonth} {currentYear}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                  <Calendar size={20} />
                </div>
              </div>
              <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-6">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                  <div key={i} className="text-xs font-bold text-slate-400">{d}</div>
                ))}
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                  <div key={`empty-${i}`}></div>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                  const dateObj = new Date(currentYear, today.getMonth(), d)
                  const dayOfWeek = dateObj.getDay()
                  const dayIndex = todayDayMap[dayOfWeek]
                  const isCollectionDay = collectionDayIndices.has(dayIndex)
                  const isToday = d === todayDate
                  return (
                    <div key={d} className="relative flex justify-center items-center">
                      <div
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-all duration-300
                          ${isToday 
                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold shadow-md shadow-emerald-500/30 scale-110 z-10' 
                            : isCollectionDay 
                              ? 'bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 cursor-pointer border border-emerald-100/50' 
                              : 'text-slate-600 hover:bg-white hover:shadow-sm font-medium'
                          }
                        `}
                      >
                        {d}
                      </div>
                      {isCollectionDay && !isToday && (
                        <div className="absolute bottom-0 w-1 h-1 rounded-full bg-emerald-500"></div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="mt-6 pt-5 border-t border-slate-200/60 flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-md bg-emerald-500 shadow-sm shadow-emerald-500/30"></div>
                    <span className="font-medium text-slate-600">Día Actual</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-100"></div>
                    <span className="font-medium text-slate-600">Día de Recolección</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}