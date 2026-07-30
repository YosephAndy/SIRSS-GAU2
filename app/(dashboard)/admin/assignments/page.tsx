import React from 'react'
import { prisma } from '@/lib/prisma'
import { MapPin, Truck, Calendar, CheckCircle } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function AssignmentsPage() {
  const drivers = await prisma.user.findMany({
    where: { role: { name: 'DRIVER' } },
    include: { driverProfile: true },
  })

  const schedules = await prisma.schedule.findMany({
    include: {
      route: {
        include: { zone: true },
      },
    },
  })

  const assignments = await prisma.driverAssignment.findMany({
    include: {
      driver: { include: { driverProfile: true } },
      schedule: { include: { route: { include: { zone: true } } } },
    },
    orderBy: { date: 'desc' },
  })

  async function createAssignment(formData: FormData) {
    'use server'
    const driverId = formData.get('driverId') as string
    const scheduleId = parseInt(formData.get('scheduleId') as string)
    const dateStr = formData.get('date') as string
    
    if (!driverId || !scheduleId || !dateStr) return

    await prisma.driverAssignment.create({
      data: {
        driverId,
        scheduleId,
        date: new Date(dateStr),
        status: 'PENDING',
      }
    })
    revalidatePath('/admin/assignments')
  }

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Asignación de Rutas</h1>
        <p className="text-slate-500 mt-1">Asigna horarios y rutas a los conductores activos.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 text-slate-800">Nueva Asignación</h2>
            <form action={createAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Conductor</label>
                <select name="driverId" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                  <option value="">Selecciona un conductor...</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.driverProfile?.licensePlate || 'Sin placa'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Ruta y Horario</label>
                <select name="scheduleId" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                  <option value="">Selecciona un horario...</option>
                  {schedules.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.route.zone?.name} - {s.route.shift} ({s.departureTime} - {s.arrivalTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Fecha</label>
                <input type="date" name="date" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
              </div>

              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors mt-2">
                Asignar Ruta
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 text-slate-800">Asignaciones Recientes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-sm text-slate-500">
                    <th className="py-3 px-4 font-semibold">Conductor</th>
                    <th className="py-3 px-4 font-semibold">Zona y Ruta</th>
                    <th className="py-3 px-4 font-semibold">Fecha</th>
                    <th className="py-3 px-4 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400">No hay asignaciones registradas</td>
                    </tr>
                  ) : (
                    assignments.map(a => (
                      <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-700">{a.driver.name}</div>
                          <div className="text-xs text-slate-500">{a.driver.driverProfile?.licensePlate}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-700">{a.schedule.route.zone?.name}</div>
                          <div className="text-xs text-slate-500">{a.schedule.route.shift}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{new Date(a.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            a.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            a.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
