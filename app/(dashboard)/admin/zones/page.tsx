import React from 'react'
import { getAllZones } from '@/features/zones/services/zone.service'
import { AdminZonesClient } from '@/features/zones/components/admin-zones-client'
import { AdminLayout } from '@/features/dashboard/layouts/admin-layout'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gestión de Zonas | Panel Admin',
}

export default async function AdminZonesPage() {
  const zones = await getAllZones()

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f8fafc] w-full pt-16 md:pt-0">
        <AdminZonesClient initialZones={zones} />
      </div>
    </AdminLayout>
  )
}
