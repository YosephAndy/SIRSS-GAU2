import { z } from 'zod'

export const scheduleFormSchema = z.object({
  zona: z.string().min(1, 'La zona es obligatoria'),
  turno: z.string().min(1, 'El turno es obligatorio'),
  dias: z.string().min(1, 'Los días son obligatorios'),
  orden: z.coerce.number().int().min(1, 'El orden debe ser mayor a 0'),
  punto_salida: z.string().min(1, 'El punto de salida es obligatorio'),
  punto_llegada: z.string().min(1, 'El punto de llegada es obligatorio'),
  hora_salida: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)'),
  hora_llegada: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)'),
  campaneo: z.coerce.number().int().min(0).max(1, 'El campaneo debe ser 0 o 1'),
  observaciones: z.string().optional().nullable(),
})

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>