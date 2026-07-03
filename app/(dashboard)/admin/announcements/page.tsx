import React from 'react'
import { AdminAnnouncementsClient } from '@/features/alerts/components/admin-announcements-client'
import { getAnnouncements } from '@/features/alerts/actions/alert.actions'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gestión de Comunicados | CleanCity',
}

export default async function AdminAnnouncementsPage() {
  const announcements = await getAnnouncements()

  return (
    <div className="flex-1 w-full relative">
      <AdminAnnouncementsClient announcements={announcements} />
    </div>
  )
}
