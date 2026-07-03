import { prisma } from '@/lib/prisma'
import type { IncidentReportPayload } from '@/features/incidents/types/incident.types'

/**
 * Crea un reporte de incidencia ciudadana.
 * Mapea el formulario público (sin autenticación) al modelo Incident del sistema.
 * El tipo de incidencia del formulario se mapea a IncidentType del schema.
 */
export async function createIncidentReport(payload: IncidentReportPayload) {
  // Mapa de labels del formulario público a enum IncidentType del schema
  const typeMap: Record<string, 'MISSED_COLLECTION' | 'SPILL' | 'BLOCKED_ROAD' | 'VEHICLE_BREAKDOWN' | 'OTHER'> = {
    'Camión no pasó': 'MISSED_COLLECTION',
    'Basura acumulada': 'SPILL',
    'Contenedor lleno': 'SPILL',
    'Punto crítico': 'OTHER',
  }

  return prisma.incident.create({
    data: {
      title: `Reporte: ${payload.type}`,
      description: payload.description,
      type: typeMap[payload.type] ?? 'OTHER',
    },
  })
}
