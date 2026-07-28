'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { updateDailyRouteStatusSchema } from '../schemas/daily-route.schemas'
import { RouteStatus } from '@/app/generated/prisma/client'

export async function updateDailyRouteStatusAction(data: z.infer<typeof updateDailyRouteStatusSchema>) {
  try {
    const session = await getSession()
    if (!session || !session.user) {
      return { success: false, message: 'No autorizado. Debes iniciar sesión.' }
    }

    const validatedData = updateDailyRouteStatusSchema.parse(data)
    
    // Obtener la ruta diaria actual
    const dailyRoute = await prisma.dailyRoute.findUnique({
      where: { id: validatedData.id }
    })

    if (!dailyRoute) {
      return { success: false, message: 'Ruta no encontrada.' }
    }

    // Validar regla de negocio: no se puede pasar de FINISHED a PENDING
    if (dailyRoute.status === RouteStatus.FINISHED && validatedData.status === RouteStatus.PENDING) {
      return { 
        success: false, 
        message: 'No puedes cambiar una ruta finalizada a pendiente.' 
      }
    }

    // Calcular timestamps dinámicos según el estado nuevo
    let startedAt = dailyRoute.startedAt
    let finishedAt = dailyRoute.finishedAt

    if (validatedData.status === RouteStatus.IN_PROGRESS && !startedAt) {
      startedAt = new Date()
    } else if (validatedData.status === RouteStatus.FINISHED && !finishedAt) {
      finishedAt = new Date()
    } else if (validatedData.status === RouteStatus.PENDING) {
      // Si por alguna razón se resetea de IN_PROGRESS a PENDING, limpiar tiempos
      startedAt = null
      finishedAt = null
    }

    // Actualizar en DB
    const updatedRoute = await prisma.dailyRoute.update({
      where: { id: validatedData.id },
      data: {
        status: validatedData.status,
        startedAt,
        finishedAt
      },
      include: {
        schedule: {
          include: {
            route: {
              include: {
                zone: true
              }
            }
          }
        }
      }
    })

    // Revalidar paths que dependan de esto (panel de chofer y admin)
    revalidatePath('/driver/routes')
    revalidatePath('/admin/monitoring')
    revalidatePath('/admin/routes')

    return {
      success: true,
      message: 'Estado de ruta actualizado correctamente.',
      data: updatedRoute,
    }

  } catch (error) {
    console.error('[UPDATE_DAILY_ROUTE_STATUS_ERROR]:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Datos inválidos.',
        fieldErrors: error.issues,
      }
    }
    return {
      success: false,
      message: 'Ocurrió un error inesperado al actualizar el estado.',
    }
  }
}
