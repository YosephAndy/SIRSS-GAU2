'use client'

import React from 'react'
import useSWR from 'swr'
import { RouteStatus } from '@/app/generated/prisma/client'
import type { Prisma } from '@/app/generated/prisma/client'
import { CheckCircle, Clock, Truck, User } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

type MonitorDailyRoute = Prisma.DailyRouteGetPayload<{
  include: {
    schedule: { include: { route: { include: { zone: true } } } },
    driver: { select: { id: true, name: true, email: true, driverProfile: true } }
  }
}>

export function AdminDailyRoutesMonitor() {
  // Polling cada 3 segundos para el Criterio 3 (Tiempo real sin recargar la página)
  const { data: routes, isLoading } = useSWR<MonitorDailyRoute[]>('/api/daily-routes?today=true', fetcher, {
    refreshInterval: 3000 
  })

  if (isLoading) return <div className="p-4 bg-slate-50 animate-pulse rounded-xl mb-6">Cargando monitor en tiempo real...</div>
  if (!routes || routes.length === 0) return null // Ocultar si no hay rutas activas hoy

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
      <div className="bg-slate-800 p-4 flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Truck size={18} className="text-blue-400" /> 
          Monitor de Rutas en Vivo (Hoy)
        </h3>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route: MonitorDailyRoute) => (
          <div key={route.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-slate-800 text-sm">
                  {route.schedule.route.zone?.name || 'Zona General'}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <User size={12} /> {route.driver.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placa: {route.driver.driverProfile?.licensePlate || 'N/A'}
                </p>
              </div>
              <div>
                {route.status === RouteStatus.PENDING && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium flex items-center gap-1">
                    <Clock size={12} /> Pendiente
                  </span>
                )}
                {route.status === RouteStatus.IN_PROGRESS && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium flex items-center gap-1 shadow-sm">
                    <Truck size={12} className="animate-pulse" /> En Progreso
                  </span>
                )}
                {route.status === RouteStatus.FINISHED && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium flex items-center gap-1">
                    <CheckCircle size={12} /> Finalizada
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-xs text-slate-500 flex justify-between border-t border-slate-200 pt-2">
              <span>Inicio: {route.startedAt ? new Date(route.startedAt).toLocaleTimeString() : '--:--'}</span>
              <span>Fin: {route.finishedAt ? new Date(route.finishedAt).toLocaleTimeString() : '--:--'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
