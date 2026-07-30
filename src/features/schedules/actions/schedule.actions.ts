'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSession, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createSchedule, deleteSchedule, updateSchedule, updateSchedulesSequence, updateWaypointCoords, toggleScheduleSuspension, toggleWaypointSuspension, addMapWaypoint, deleteMapWaypoint, createFullRoute, deleteFullRoute, insertViaPoint, toggleSimulation } from '../services/schedule.service'
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

export async function toggleScheduleSuspensionAction(scheduleId: number, isSuspended: boolean) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return { success: false, message: 'No autorizado. Se requieren permisos de administrador.' }
    }

    if (typeof scheduleId !== 'number' || isNaN(scheduleId)) {
      return { success: false, message: 'ID de horario inválido.' }
    }

    await toggleScheduleSuspension(scheduleId, isSuspended)

    revalidatePath('/admin/schedules')
    revalidatePath('/schedules')

    return {
      success: true,
      message: `El servicio ha sido ${isSuspended ? 'suspendido' : 'reactivado'} correctamente.`,
    }
  } catch (error) {
    console.error('[TOGGLE_SUSPENSION_ACTION_ERROR]:', error)
    return {
      success: false,
      message: 'Ocurrió un error inesperado al actualizar el estado del servicio.',
    }
  }
}

export async function toggleWaypointSuspensionAction(waypointId: number, isSuspended: boolean) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return { success: false, message: 'No autorizado. Se requieren permisos de administrador.' }
    }

    if (typeof waypointId !== 'number' || isNaN(waypointId)) {
      return { success: false, message: 'ID de parada inválido.' }
    }

    await toggleWaypointSuspension(waypointId, isSuspended)

    revalidatePath('/admin/schedules')
    revalidatePath('/schedules')

    return {
      success: true,
      message: `La parada ha sido ${isSuspended ? 'suspendida' : 'reactivada'} correctamente.`,
    }
  } catch (error) {
    console.error('[TOGGLE_WAYPOINT_SUSPENSION_ACTION_ERROR]:', error)
    return {
      success: false,
      message: 'Ocurrió un error inesperado al actualizar el estado de la parada.',
    }
  }
}

export async function addMapWaypointAction(data: {
  scheduleId: number
  lat: number
  lng: number
  originPoint: string
  destinationPoint: string
}) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return { success: false, message: 'No autorizado.' }
    }
    const waypoint = await addMapWaypoint(data)
    revalidatePath('/admin/routes')
    revalidatePath('/schedules')
    return { success: true, message: 'Punto añadido correctamente.', data: waypoint }
  } catch (error) {
    console.error('[ADD_MAP_WAYPOINT_ERROR]:', error)
    return { success: false, message: 'Error al añadir el punto.' }
  }
}

export async function insertViaPointAction(data: {
  scheduleId: number
  lat: number
  lng: number
  afterSequence: number
}) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return { success: false, message: 'No autorizado.' }
    }
    const waypoint = await insertViaPoint(data)
    revalidatePath('/admin/routes')
    revalidatePath('/schedules')
    return { success: true, message: 'Desvío añadido correctamente.', data: waypoint }
  } catch (error) {
    console.error('[INSERT_VIA_POINT_ERROR]:', error)
    return { success: false, message: 'Error al añadir el punto de desvío.' }
  }
}

export async function deleteMapWaypointAction(waypointId: number) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return { success: false, message: 'No autorizado.' }
    }
    await deleteMapWaypoint(waypointId)
    revalidatePath('/admin/routes')
    revalidatePath('/schedules')
    return { success: true, message: 'Punto eliminado correctamente.' }
  } catch (error) {
    console.error('[DELETE_MAP_WAYPOINT_ERROR]:', error)
    return { success: false, message: 'Error al eliminar el punto.' }
  }
}

export async function createFullRouteAction(data: {
  zoneName: string
  shift: string
  routeType: string
  days: string[]
  waypoints: {
    lat: number;
    lng: number;
    originPoint: string;
    destinationPoint: string;
    departureTime: string;
    arrivalTime: string;
    hasCampanio: boolean;
    observations: string;
  }[]
}) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return { success: false, message: 'No autorizado.' }
    }
    
    if (data.waypoints.length === 0) {
      return { success: false, message: 'Debes añadir al menos un punto.' }
    }

    const result = await createFullRoute(data)
    revalidatePath('/admin/routes')
    revalidatePath('/schedules')
    return { success: true, message: 'Ruta creada y guardada correctamente.' }
  } catch (error) {
    console.error('[CREATE_FULL_ROUTE_ERROR]:', error)
    return { success: false, message: 'Error al guardar la ruta en el mapa.' }
  }
}

export async function deleteFullRouteAction(scheduleId: number) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return { success: false, message: 'No autorizado.' }
    }
    if (typeof scheduleId !== 'number' || isNaN(scheduleId)) {
      return { success: false, message: 'ID de ruta inválido.' }
    }
    await deleteFullRoute(scheduleId)
    revalidatePath('/admin/routes')
    revalidatePath('/schedules')
    return { success: true, message: 'Ruta eliminada correctamente.' }
  } catch (error) {
    console.error('[DELETE_FULL_ROUTE_ERROR]:', error)
    return { success: false, message: 'Error al eliminar la ruta.' }
  }
}

export async function toggleSimulationAction(scheduleId: number, isSimulating: boolean) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return { success: false, message: 'No autorizado' }
    }

    await toggleSimulation(scheduleId, isSimulating)
    revalidatePath('/admin/routes')
    revalidatePath('/') // also revalidate public paths if needed
    return { success: true }
  } catch (error: any) {
    console.error('[TOGGLE_SIMULATION_ERROR]:', error)
    return { success: false, message: `Error: ${error.message || 'Error desconocido'}` }
  }
}

// ==========================================
// ACCIONES PARA CONDUCTORES Y ASIGNACIONES
// ==========================================

export async function assignDriverAction(scheduleId: number, driverId: string, date: Date) {
  try {
    const session = await getSession()
    if (!session || !isAdmin(session)) {
      return { success: false, message: 'No autorizado.' }
    }

    
    // Check if duplicate assignment exists
    const existing = await prisma.driverAssignment.findUnique({
      where: {
        scheduleId_driverId_date: {
          scheduleId,
          driverId,
          date
        }
      }
    })

    if (existing) {
      return { success: false, message: 'El conductor ya tiene esta ruta asignada para esta fecha.' }
    }

    await prisma.driverAssignment.create({
      data: {
        scheduleId,
        driverId,
        date,
        status: 'PENDING'
      }
    })

    revalidatePath('/admin/routes')
    revalidatePath('/driver/dashboard')

    return { success: true, message: 'Conductor asignado exitosamente.' }
  } catch (error) {
    console.error('[ASSIGN_DRIVER_ACTION_ERROR]:', error)
    return { success: false, message: 'Error al asignar conductor.' }
  }
}

export async function startDriverRouteAction(assignmentId: number, scheduleId: number) {
  try {
    const session = await getSession()
    if (!session) return { success: false, message: 'No autenticado' }


    // Iniciar simulación en el schedule
    await toggleSimulation(scheduleId, true)
    
    // Cambiar estado de asignación
    await prisma.driverAssignment.update({
      where: { id: assignmentId },
      data: { status: 'IN_PROGRESS' }
    })

    revalidatePath('/driver/dashboard')
    revalidatePath('/routes')

    return { success: true, message: 'Ruta iniciada correctamente.' }
  } catch (error) {
    console.error('[START_ROUTE_ACTION_ERROR]:', error)
    return { success: false, message: 'Error al iniciar la ruta.' }
  }
}

export async function finishDriverRouteAction(assignmentId: number, scheduleId: number) {
  try {
    const session = await getSession()
    if (!session) return { success: false, message: 'No autenticado' }

    // Detener simulación
    await toggleSimulation(scheduleId, false)
    
    // Cambiar estado de asignación
    await prisma.driverAssignment.update({
      where: { id: assignmentId },
      data: { status: 'COMPLETED' }
    })

    revalidatePath('/driver/dashboard')
    revalidatePath('/routes')

    return { success: true, message: 'Ruta finalizada correctamente.' }
  } catch (error) {
    console.error('[FINISH_ROUTE_ACTION_ERROR]:', error)
    return { success: false, message: 'Error al finalizar la ruta.' }
  }
}

export async function reportEmergencyAction(type: 'SPILL' | 'BLOCKED_ROAD' | 'VEHICLE_BREAKDOWN' | 'OTHER', lat?: number, lng?: number) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'DRIVER') return { success: false, message: 'No autorizado' }

    // Diccionario para traducir al español
    const typeTranslations: Record<string, string> = {
      'SPILL': 'Incidencia de Tránsito (Derrame/Choque)',
      'BLOCKED_ROAD': 'Obstrucción de Vía',
      'VEHICLE_BREAKDOWN': 'Falla Mecánica',
      'OTHER': 'Otro tipo de emergencia'
    }

    const tipoEsp = typeTranslations[type] || type

    // Buscar si el conductor tiene una ruta hoy para enriquecer el detalle
    const todayStr = new Date().toISOString().split('T')[0]
    const startOfDay = new Date(`${todayStr}T00:00:00.000Z`)
    const endOfDay   = new Date(`${todayStr}T23:59:59.999Z`)

    const activeAssignment = await prisma.driverAssignment.findFirst({
      where: {
        driverId: session.user.id,
        date: { gte: startOfDay, lte: endOfDay },
        status: { in: ['IN_PROGRESS', 'PENDING'] }
      },
      orderBy: { assignedAt: 'desc' },
      include: {
        schedule: {
          include: {
            route: { include: { zone: true } }
          }
        }
      }
    })

    let description = 'Reporte automático desde la app del conductor.'
    let zonaName = 'Zona Desconocida'
    let routeName = 'Turno Desconocido'

    if (activeAssignment?.schedule?.route) {
      zonaName = activeAssignment.schedule.route.zone?.name || 'Zona Desconocida'
      const shiftName = activeAssignment.schedule.route.shift
      
      // Construir el nombre descriptivo de la ruta: "Turno MAÑANA (Lunes, Miércoles)"
      const days = activeAssignment.schedule.days.join(', ')
      routeName = `Turno ${shiftName}` + (days ? ` - Días: ${days}` : '')
      
      description = `Incidente reportado en la ruta "${routeName}" perteneciente a "${zonaName}".`
    }

    await prisma.incident.create({
      data: {
        title: `Alerta: ${tipoEsp}`,
        description,
        type,
        driverId: session.user.id,
        lat,
        lng,
        status: 'PENDING'
      }
    })

    return { success: true, message: 'Emergencia reportada exitosamente.' }
  } catch (error) {
    console.error('[REPORT_EMERGENCY_ERROR]:', error)
    return { success: false, message: 'Error al reportar emergencia.' }
  }
}