import React from 'react'
import { Metadata } from 'next'
import { getAllSchedules } from '@/features/schedules/services/schedule.service'
import { PublicRoutesClient } from '@/features/schedules/components/public-routes-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Rutas de Recolección | CleanCity',
  description: 'Conoce las rutas y horarios de recolección de residuos en la ciudad.'
}

export default async function RoutesPage() {
  const dataset = await getAllSchedules()

  return <PublicRoutesClient dataset={dataset} />
}
