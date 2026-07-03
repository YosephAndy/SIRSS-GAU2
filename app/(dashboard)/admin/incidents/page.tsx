import React from 'react'
import { Metadata } from 'next'
import { getIncidents } from '@/features/incidents/actions/incident.actions'
import { AdminIncidentsClient } from '@/features/incidents/components/admin-incidents-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Incidencias Ciudadanas | Admin CleanCity',
  description: 'Revisión y gestión de incidencias reportadas por la ciudadanía.',
}

export default async function AdminIncidentsPage() {
  const incidents = await getIncidents()
  return <AdminIncidentsClient incidents={incidents as any} />
}
