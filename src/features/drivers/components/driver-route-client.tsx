'use client'

import React from 'react'
import useSWR from 'swr'
import { RouteStatus } from '@/app/generated/prisma/client'
import type { Prisma } from '@/app/generated/prisma/client'
import { updateDailyRouteStatusAction } from '@/features/routes/actions/daily-route.actions'
import { CheckCircle, Clock, Truck } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

type DailyRouteWithDetails = Prisma.DailyRouteGetPayload<{
  include: { schedule: { include: { route: { include: { zone: true } } } } }
}>

export function DriverRouteClient({ driverId }: { driverId: string }) {
  const { data: routes, mutate, isLoading } = useSWR<DailyRouteWithDetails[]>(`/api/daily-routes?today=true&driverId=${driverId}`, fetcher, {
    refreshInterval: 5000 // Polling opcional para mantener sincronizado
  })

  const handleStatusChange = async (id: number, newStatus: RouteStatus) => {
    try {
      // Optimistic update
      mutate(
        routes?.map((r: DailyRouteWithDetails) => r.id === id ? { ...r, status: newStatus } : r),
        false
      )

      const result = await updateDailyRouteStatusAction({ id, status: newStatus })
      
      if (!result.success) {
        alert(result.message)
        // Revert optimistic update
        mutate()
      } else {
        mutate() // Refetch exact state from server
      }
    } catch (error) {
      console.error(error)
      alert("Error al actualizar la ruta")
      mutate()
    }
  }

  if (isLoading) return <div className="p-8 text-center">Cargando tu ruta de hoy...</div>
  if (!routes || routes.length === 0) return <div className="p-8 text-center text-gray-500">No tienes rutas asignadas para hoy.</div>

  return (
    <div className="space-y-6">
      {routes.map((dailyRoute: DailyRouteWithDetails) => (
        <div key={dailyRoute.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Truck className="text-green-600" />
              Ruta Asignada: {dailyRoute.schedule.route.zone?.name || 'Zona General'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Horario: {dailyRoute.schedule.departureTime || '--:--'} - {dailyRoute.schedule.arrivalTime || '--:--'}
            </p>
          </div>
          
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Estado actual:</span>
              <div className="mt-1 flex items-center gap-2">
                {dailyRoute.status === RouteStatus.PENDING && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
                    <Clock size={16} /> Pendiente
                  </span>
                )}
                {dailyRoute.status === RouteStatus.IN_PROGRESS && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
                    <Truck size={16} /> En Progreso
                  </span>
                )}
                {dailyRoute.status === RouteStatus.FINISHED && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                    <CheckCircle size={16} /> Finalizada
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {dailyRoute.status === RouteStatus.PENDING && (
                <button
                  onClick={() => handleStatusChange(dailyRoute.id, RouteStatus.IN_PROGRESS)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  Iniciar Ruta
                </button>
              )}
              {dailyRoute.status === RouteStatus.IN_PROGRESS && (
                <button
                  onClick={() => handleStatusChange(dailyRoute.id, RouteStatus.FINISHED)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  Finalizar Ruta
                </button>
              )}
              {dailyRoute.status === RouteStatus.FINISHED && (
                <button
                  disabled
                  className="px-6 py-2 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                >
                  Ruta Completada
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
