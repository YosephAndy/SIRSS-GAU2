import { z } from 'zod'

export const incidentReportSchema = z.object({
  type: z.enum([
    'Basura acumulada',
    'Contenedor lleno',
    'Camión no pasó',
    'Punto crítico',
  ]),
  location: z.string().min(5, 'Ubicación inválida'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
})

export type IncidentReportFormValues = z.infer<typeof incidentReportSchema>
