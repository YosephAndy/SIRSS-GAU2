export type IncidentReportType =
  | 'Basura acumulada'
  | 'Contenedor lleno'
  | 'Camión no pasó'
  | 'Punto crítico'

export type IncidentReportPayload = {
  type: IncidentReportType
  location: string
  description: string
  photoName?: string
  photoType?: string
}

export type IncidentRecord = IncidentReportPayload & {
  id: string
  createdAt: string
  updatedAt: string
}

