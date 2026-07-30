import React from 'react'
import { getAllSchedules } from '@/features/schedules/services/schedule.service'
import { AdminRoutesClient, type DriverOption } from '@/features/schedules/components/admin-routes-client'
import { AdminLayout } from '@/features/dashboard/layouts/admin-layout'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gestión de Rutas en Vivo | Panel Admin',
}

export default async function AdminRoutesPage() {
  const dataset = await getAllSchedules()

  // Obtener conductores
  const driverUsers = await prisma.user.findMany({
    where: { role: { name: 'DRIVER' } },
    select: { id: true, name: true, email: true }
  })

  const drivers: DriverOption[] = driverUsers.map(d => ({
    id: d.id,
    name: d.name || d.email,
  }))

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f8fafc] w-full pt-16 md:pt-0">
        <AdminRoutesClient dataset={dataset} drivers={drivers} />
      </div>
    </AdminLayout>
  )
}
