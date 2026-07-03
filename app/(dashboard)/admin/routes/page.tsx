import React from 'react'
import { getAllSchedules } from '@/features/schedules/services/schedule.service'
import { AdminRoutesClient } from '@/features/schedules/components/admin-routes-client'
import { AdminLayout } from '@/features/dashboard/layouts/admin-layout'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gestión de Rutas en Vivo | Panel Admin',
}

export default async function AdminRoutesPage() {
  const dataset = await getAllSchedules()

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f8fafc] w-full pt-16 md:pt-0">
        <AdminRoutesClient dataset={dataset} />
      </div>
    </AdminLayout>
  )
}
