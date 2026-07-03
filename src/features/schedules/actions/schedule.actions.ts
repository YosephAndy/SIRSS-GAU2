'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSession, isAdmin } from '@/lib/auth'
import { createSchedule, deleteSchedule, updateSchedule, updateSchedulesSequence, updateWaypointCoords } from '../services/schedule.service'
import { scheduleFormSchema } from '../schemas/schedule.schema'

export async function createScheduleAction(data: z.infer<typeof scheduleFormSchema>) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return { success: false, message: 'No autorizado. Se requieren permisos de administrador.' }
    }

    const validatedData = scheduleFormSchema.parse(data)

    const daysArray = validatedData.dias.split(',').map(d => d.trim().toUpperCase())

    const shiftMap: Record<string, string> = {
      'MAÑANA': 'MANANA',
      'MANANA': 'MANANA',
      'TARDE': 'TARDE',
      'NOCHE': 'NOCHE',
      'DOMINGO': 'DOMINGO',
    }
    const shift = shiftMap[validatedData.turno.toUpperCase()] || 'MANANA'

    const waypoint = await createSchedule({
      zoneName: validatedData.zona,
      shift,
      routeType: 'NORMAL',
      days: daysArray,
      originPoint: validatedData.punto_salida,
      destinationPoint: validatedData.punto_llegada,
      departureTime: validatedData.hora_salida,
      arrivalTime: validatedData.hora_llegada,
      hasCampanio: validatedData.campaneo === 1,
      observations: validatedData.observaciones,
    })

    revalidatePath('/admin/schedules')
    revalidatePath('/schedules')

    return {
      success: true,
      message: 'Registro añadido exitosamente.',
      data: waypoint,
    }
  } catch (error) {
    console.error('[CREATE_SCHEDULE_ACTION_ERROR]:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Datos de formulario inválidos.',
        fieldErrors: error.issues,
      }
    }
    return {
      success: false,
      message: 'Ocurrió un error inesperado al registrar los datos.',
    }
  }
}

export async function deleteScheduleAction(id: number) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return { success: false, message: 'No autorizado. Se requieren permisos de administrador.' }
    }

    if (typeof id !== 'number' || isNaN(id)) {
      return { success: false, message: 'ID de horario inválido.' }
    }

    await deleteSchedule(id)

    revalidatePath('/admin/schedules')
    revalidatePath('/schedules')

    return {
      success: true,
      message: 'Registro eliminado correctamente.',
    }
  } catch (error) {
    console.error('[DELETE_SCHEDULE_ACTION_ERROR]:', error)
    return {
      success: false,
      message: 'Ocurrió un error inesperado al eliminar el registro.',
    }
  }
}

export async function updateScheduleAction(id: number, data: z.infer<typeof scheduleFormSchema>) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return { success: false, message: 'No autorizado. Se requieren permisos de administrador.' }
    }

    if (typeof id !== 'number' || isNaN(id)) {
      return { success: false, message: 'ID de horario inválido.' }
    }

    const validatedData = scheduleFormSchema.parse(data)
    const daysArray = validatedData.dias.split(',').map(d => d.trim().toUpperCase())

    const waypoint = await updateSchedule(id, {
      zoneName: validatedData.zona,
      days: daysArray,
      originPoint: validatedData.punto_salida,
      destinationPoint: validatedData.punto_llegada,
      departureTime: validatedData.hora_salida,
      arrivalTime: validatedData.hora_llegada,
      hasCampanio: validatedData.campaneo === 1,
      observations: validatedData.observaciones,
    })

    revalidatePath('/admin/schedules')
    revalidatePath('/schedules')

    return {
      success: true,
      message: 'Registro actualizado exitosamente.',
      data: waypoint,
    }
  } catch (error) {
    console.error('[UPDATE_SCHEDULE_ACTION_ERROR]:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Datos de formulario inválidos.',
        fieldErrors: error.issues,
      }
    }
    return {
      success: false,
      message: 'Ocurrió un error inesperado al actualizar el registro.',
    }
  }
}

export async function reorderSchedulesAction(updates: { id: number; sequence: number }[]) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return { success: false, message: 'No autorizado.' }
    }

    await updateSchedulesSequence(updates)

    revalidatePath('/admin/routes')
    revalidatePath('/routes')

    return { success: true, message: 'Orden actualizado correctamente.' }
  } catch (error) {
    console.error('[REORDER_SCHEDULES_ACTION_ERROR]:', error)
    return { success: false, message: 'Error al reordenar los puntos.' }
  }
}

export async function saveWaypointCoordsAction(updates: { id: number; lat: number; lng: number }[]) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return { success: false, message: 'No autorizado.' }
    }
    await updateWaypointCoords(updates)
    revalidatePath('/admin/routes')
    revalidatePath('/routes')
    return { success: true, message: 'Coordenadas guardadas correctamente.' }
  } catch (error) {
    console.error('[SAVE_COORDS_ACTION_ERROR]:', error)
    return { success: false, message: 'Error al guardar las coordenadas.' }
  }
}