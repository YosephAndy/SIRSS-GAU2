import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DriverDashboardClient } from '@/features/schedules/components/driver-dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DriverDashboardPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'DRIVER') {
    redirect('/login?role=driver')
  }

  // Buscar asignaciones para hoy usando un rango UTC para evitar problemas de zona horaria
  const todayStr = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD' en UTC
  const startOfDay = new Date(`${todayStr}T00:00:00.000Z`)
  const endOfDay   = new Date(`${todayStr}T23:59:59.999Z`)

  const assignment = await prisma.driverAssignment.findFirst({
    where: {
      driverId: session.user.id,
      date: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      schedule: {
        include: {
          route: { include: { zone: true } },
          waypoints: { orderBy: { sequence: 'asc' } }
        }
      }
    }
  })

  let assignedRoute = null
  if (assignment) {
    // Filtrar solo los waypoints numerados (excluir VIA_POINT)
    const namedWaypoints = assignment.schedule.waypoints.filter(
      w => w.originPoint !== 'VIA_POINT'
    )
    const allWaypoints = assignment.schedule.waypoints // todos (para la ruta completa del camion)

    assignedRoute = {
      assignmentId: assignment.id,
      scheduleId: assignment.scheduleId,
      status: assignment.status as string,
      routeName: `${assignment.schedule.zoneName || 'Sin Zona'} - ${assignment.schedule.route.shift}`,
      totalWaypoints: namedWaypoints.length,
      // waypoints numerados (marcadores azules)
      waypoints: namedWaypoints.map(w => ({
        id: w.id,
        lat: w.lat,
        lng: w.lng,
        originPoint: w.originPoint,
        isViaPoint: false
      })),
      // todos los waypoints ordenados para trazar la ruta completa del camión
      routeWaypoints: allWaypoints.map(w => ({
        id: w.id,
        lat: w.lat,
        lng: w.lng,
        originPoint: w.originPoint,
        isViaPoint: w.originPoint === 'VIA_POINT'
      }))
    }
  }

  return (
    <div className="min-h-screen bg-[#101010] text-slate-200 font-sans">
      <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Portal del Conductor</h1>
          <p className="text-slate-400 text-sm mt-1">Gestión de ruta diaria y reportes operativos</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          GPS Activo y Compartiendo
        </div>
      </header>
      <main className="p-8 max-w-7xl mx-auto">
        <DriverDashboardClient route={assignedRoute} />
      </main>
    </div>
  )
}
