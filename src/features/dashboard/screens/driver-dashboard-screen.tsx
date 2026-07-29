import React from 'react'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function DriverDashboardScreen() {
  const session = await getServerSession(authOptions)
  
  let assignedRoute = null
  let waypointsCount = 0

  if (session?.user?.id) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    assignedRoute = await prisma.routeAssignment.findFirst({
      where: {
        driverId: session.user.id,
        date: { gte: today }
      },
      include: {
        schedule: {
          include: {
            route: { include: { zone: true } },
            waypoints: true
          }
        }
      },
      orderBy: { date: 'asc' }
    })
    
    if (assignedRoute) {
      waypointsCount = assignedRoute.schedule.waypoints.length
    }
  }

  return (
    <div className="p-8 bg-zinc-50 min-h-screen font-sans dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portal del Conductor</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Gestión de ruta diaria y reportes operativos</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20 text-sm font-semibold">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          GPS Activo y Compartiendo
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Ruta Asignada Activa</h2>
            {assignedRoute ? (
              <>
                <div className="flex flex-col md:flex-row justify-between md:items-center p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Zona y Turno</p>
                    <p className="text-lg font-bold">{assignedRoute.schedule.route.zone?.name} - {assignedRoute.schedule.route.shift}</p>
                    <p className="text-sm text-zinc-500">Horario: {assignedRoute.schedule.departureTime} a {assignedRoute.schedule.arrivalTime}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Puntos de Control</p>
                    <p className="text-sm font-medium">{waypointsCount} Puntos restantes</p>
                  </div>
                  <button className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm">
                    Iniciar Navegación
                  </button>
                </div>
                <div className="aspect-[21/9] bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-700">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Navegador GPS e Indicación de Paradas...</p>
                </div>
              </>
            ) : (
              <div className="p-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                <p className="text-zinc-500 font-semibold">No tienes ninguna ruta asignada para hoy.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Acciones de Emergencia</h2>
            <div className="space-y-3">
              <button className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition-colors text-sm">
                Reportar Obstrucción de Vía
              </button>
              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold transition-colors text-sm">
                Reportar Falla Mecánica
              </button>
              <button className="w-full border border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 py-3 rounded-xl font-semibold transition-colors text-sm">
                Reportar Incidencia de Tránsito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

