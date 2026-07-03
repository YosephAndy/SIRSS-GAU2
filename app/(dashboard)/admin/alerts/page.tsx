import React from 'react'
import { Metadata } from 'next'
import { getAlerts, getAllAnnouncements } from '@/features/alerts/actions/alert.actions'
import { AdminAlertsClient } from '@/features/alerts/components/admin-alerts-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Alertas y Comunicados | Admin CleanCity',
  description: 'Gestiona alertas de emergencia y comunicados públicos para los ciudadanos.',
}

export default async function AdminAlertsPage() {
  const [alerts, announcements] = await Promise.all([getAlerts(), getAllAnnouncements()])
  return <AdminAlertsClient alerts={alerts} announcements={announcements} />
}
