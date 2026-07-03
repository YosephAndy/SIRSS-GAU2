import React from 'react'
import { Metadata } from 'next'
import { PublicReportClient } from '@/features/incidents/components/public-report-client'

export const metadata: Metadata = {
  title: 'Reportar Incidencia | CleanCity',
  description: 'Reporta problemas de recolección de residuos en tu zona para que nuestro equipo pueda atenderlos.',
}

export default function ReportesPage() {
  return <PublicReportClient />
}
