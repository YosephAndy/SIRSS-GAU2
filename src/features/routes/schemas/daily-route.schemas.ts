import { z } from 'zod'
import { RouteStatus } from '@/app/generated/prisma/client'

export const updateDailyRouteStatusSchema = z.object({
  id: z.number().int().positive('ID de ruta inválido'),
  status: z.nativeEnum(RouteStatus),
})

export type UpdateDailyRouteStatusInput = z.infer<typeof updateDailyRouteStatusSchema>
