'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AlertTriangle, Navigation, CheckCircle2, MapPin, Clock, Activity, Shield, Loader2, Pause, Play, Maximize, Minimize, StopCircle } from 'lucide-react'
import { startDriverRouteAction, reportEmergencyAction, finishDriverRouteAction } from '../actions/schedule.actions'

// Load Leaflet map dynamically (SSR disabled)
const DriverMap = dynamic(() => import('./driver-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#1a1a1a] rounded-xl flex items-center justify-center text-slate-500">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin mx-auto" />
        <p className="text-sm">Cargando mapa...</p>
      </div>
    </div>
  )
})

interface Waypoint {
  id: number
  lat: number | null
  lng: number | null
  originPoint: string
  isViaPoint?: boolean
}

interface AssignedRoute {
  assignmentId: number
  scheduleId: number
  status: string
  routeName: string
  totalWaypoints: number
  waypoints: Waypoint[]
  routeWaypoints?: Waypoint[]
}

interface DriverDashboardClientProps {
  route: AssignedRoute | null
}

type EmergencyType = 'SPILL' | 'BLOCKED_ROAD' | 'VEHICLE_BREAKDOWN' | 'OTHER'

const EMERGENCY_BUTTONS: { label: string; type: EmergencyType; color: string }[] = [
  { label: 'Reportar Obstrucción de Vía', type: 'BLOCKED_ROAD', color: 'bg-red-500 hover:bg-red-600 text-white shadow-sm' },
  { label: 'Reportar Falla Mecánica', type: 'VEHICLE_BREAKDOWN', color: 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm' },
  { label: 'Reportar Incidencia de Tránsito', type: 'SPILL', color: 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm' },
]

export function DriverDashboardClient({ route }: DriverDashboardClientProps) {
  const [isPending, startTransition] = useTransition()
  const [isActive, setIsActive] = useState(route?.status === 'IN_PROGRESS')
  const [isPaused, setIsPaused] = useState(false)
  const [simStartTime, setSimStartTime] = useState<Date | null>(
    route?.status === 'IN_PROGRESS' ? new Date() : null
  )
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [reportingType, setReportingType] = useState<EmergencyType | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mapContainerRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Si no hay ruta asignada o la actual ya fue completada, hacer polling cada 15s para revisar si el admin asignó una nueva
    if (!route || route.status === 'COMPLETED') {
      const interval = setInterval(() => {
        router.refresh()
      }, 15000)
      return () => clearInterval(interval)
    }
  }, [route, isActive, router])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleStartRoute = () => {
    if (!route) return
    startTransition(async () => {
      const res = await startDriverRouteAction(route.assignmentId, route.scheduleId)
      if (res.success) {
        setIsActive(true)
        setIsPaused(false)
        setSimStartTime(new Date())
        showNotification('success', '🚛 ¡Ruta iniciada! El camión está en camino.')
      } else {
        showNotification('error', res.message || 'Error al iniciar ruta.')
      }
    })
  }

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false)
      showNotification('success', '▶️ Ruta retomada. Camión en movimiento.')
    } else {
      setIsPaused(true)
      showNotification('success', '⏸️ Ruta detenida. Camión en pausa.')
    }
  }

  const handleFinishRoute = () => {
    if (!route) return
    if (!window.confirm("¿Estás seguro que deseas finalizar esta ruta? Ya no podrás retomarla.")) return

    startTransition(async () => {
      const res = await finishDriverRouteAction(route.assignmentId, route.scheduleId)
      if (res.success) {
        setIsActive(false)
        setIsPaused(false)
        setSimStartTime(null)
        showNotification('success', '✅ Ruta finalizada.')
      } else {
        showNotification('error', res.message || 'Error al finalizar ruta.')
      }
    })
  }

  const handleEmergency = (type: EmergencyType) => {
    setReportingType(type)
    startTransition(async () => {
      const res = await reportEmergencyAction(type)
      if (res.success) {
        showNotification('success', `✅ Emergencia reportada: ${type}`)
      } else {
        showNotification('error', res.message || 'Error al reportar emergencia.')
      }
      setReportingType(null)
    })
  }

  const validWaypoints = route?.waypoints.filter(w => w.lat !== null && w.lng !== null) ?? []
  const validRouteWaypoints = route?.routeWaypoints?.filter(w => w.lat !== null && w.lng !== null) ?? validWaypoints

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-3 border transition-all
          ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {notification.text}
        </div>
      )}

      {/* Left: Route card + Map */}
      <div className="lg:col-span-2 space-y-4">
        {/* Route Info Card */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          {route ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-slate-400 text-xs font-extrabold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <MapPin size={12} /> Código de Ruta
                </p>
                <h2 className="text-xl font-black text-slate-800">{route.routeName}</h2>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
                    <Activity size={12} /> Puntos
                  </p>
                  <p className="text-slate-800 font-black text-sm">{route.totalWaypoints} <span className="text-slate-400 text-xs font-semibold">restantes</span></p>
                </div>
                {!isActive ? (
                  route?.status !== 'COMPLETED' ? (
                    <button
                      onClick={handleStartRoute}
                      disabled={isPending}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 shadow-md"
                    >
                      {isPending ? (
                        <><Loader2 size={16} className="animate-spin" /> Iniciando...</>
                      ) : (
                        <><Navigation size={16} /> Iniciar Navegación</>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm">
                      <CheckCircle2 size={16} />
                      Ruta Completada
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePauseResume}
                      disabled={isPending}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg ${isPaused ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                    >
                      {isPaused ? <><Play size={16} /> Retomar</> : <><Pause size={16} /> Pausar</>}
                    </button>
                    <button
                      onClick={handleFinishRoute}
                      disabled={isPending}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-lg"
                    >
                      {isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <><StopCircle size={16} /> Finalizar Ruta</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Clock size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-800 font-extrabold text-lg">Sin ruta asignada para hoy</p>
              <p className="text-slate-500 font-medium text-sm mt-1">El administrador aún no te ha asignado una ruta.</p>
            </div>
          )}
        </div>

        {/* Map Area */}
        <div ref={mapContainerRef} className={`${isFullscreen ? 'fixed inset-0 z-[100] m-0 rounded-none' : 'relative h-[400px] border border-slate-200/60 rounded-3xl shadow-sm mt-4'} bg-slate-100 overflow-hidden transition-all`}>
          <button 
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-[9999] bg-white/90 hover:bg-white text-slate-700 p-2.5 rounded-xl backdrop-blur shadow-md border border-slate-200 transition-colors"
            title={isFullscreen ? 'Contraer Mapa' : 'Agrandar Mapa'}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>

          {validRouteWaypoints.length > 0 ? (
            <DriverMap waypoints={validWaypoints} routeWaypoints={validRouteWaypoints} simStartTime={simStartTime} isPaused={isPaused} isFullscreen={isFullscreen} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3 text-slate-400">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-2 text-slate-300">
                  <MapPin size={32} />
                </div>
                <p className="text-sm font-bold text-slate-500">Navegador GPS e Indicación de Paradas</p>
                <p className="text-xs font-medium text-slate-400">Aparecerá cuando inicie la navegación</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Emergency actions */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <Shield size={16} />
            </div>
            <h2 className="text-slate-800 font-extrabold">Acciones de Emergencia</h2>
          </div>
          <div className="space-y-3">
            {EMERGENCY_BUTTONS.map((btn) => (
              <button
                key={btn.type}
                onClick={() => handleEmergency(btn.type)}
                disabled={isPending}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${btn.color} ${reportingType === btn.type ? 'scale-95' : 'hover:scale-[1.02]'}`}
              >
                {reportingType === btn.type ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Reportando...
                  </span>
                ) : btn.label}
              </button>
            ))}
          </div>
          <p className="text-slate-500 font-medium text-xs mt-4 text-center">
            Los reportes se envían automáticamente al administrador
          </p>
        </div>

        {/* Route status */}
        {route && (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold mb-4 text-xs uppercase tracking-widest text-slate-400">Estado de Turno</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500 text-sm font-medium">Estado</span>
                <span className={`font-bold text-sm px-3 py-1 rounded-full ${
                  isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                  route.status === 'COMPLETED' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                  'bg-slate-50 text-slate-500 border border-slate-200'
                }`}>
                  {isActive ? 'En Ruta' : route.status === 'COMPLETED' ? 'Completado' : 'Pendiente'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm font-medium">Puntos de Control</span>
                <span className="text-slate-800 font-black text-sm">{route.totalWaypoints}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
