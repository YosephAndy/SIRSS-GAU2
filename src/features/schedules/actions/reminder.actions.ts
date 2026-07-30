'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function toggleReminderAction(waypointId: number, scheduleId: number, timeStr: string) {
  try {
    const session = await getSession()
    if (!session || !session.user) {
      return { success: false, message: 'Debe iniciar sesión para crear recordatorios.' }
    }

    const userId = session.user.id

    // Comprobar si ya existe
    const existing = await prisma.reminder.findUnique({
      where: {
        userId_waypointId: { userId, waypointId }
      }
    })

    if (existing) {
      // Eliminar si existe (Toggle off)
      await prisma.reminder.delete({
        where: { id: existing.id }
      })
      revalidatePath('/schedules')
      return { success: true, isReminding: false, message: 'Recordatorio cancelado.' }
    } else {
      // Crear si no existe (Toggle on)
      // Calcular -10 minutos a partir de timeStr
      let remindAtStr = timeStr // fallback
      try {
        const [hourStr, minStr] = timeStr.split(':')
        const date = new Date()
        date.setHours(parseInt(hourStr, 10), parseInt(minStr, 10), 0, 0)
        date.setMinutes(date.getMinutes() - 10)
        remindAtStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      } catch (e) {
        console.error('Error parsing timeStr for reminder', e)
      }

      await prisma.reminder.create({
        data: {
          userId,
          scheduleId,
          waypointId,
          remindAt: remindAtStr
        }
      })
      revalidatePath('/schedules')
      
      const formatTimeAmPm = (tStr: string) => {
        try {
          const [h, m] = tStr.split(':')
          let hour = parseInt(h, 10)
          const ampm = hour >= 12 ? 'PM' : 'AM'
          hour = hour % 12 || 12
          return `${hour.toString().padStart(2, '0')}:${m} ${ampm}`
        } catch { return tStr }
      }

      return { 
        success: true, 
        isReminding: true, 
        message: `Recordatorio activado. Le notificaremos a las ${formatTimeAmPm(remindAtStr)}` 
      }
    }
  } catch (error) {
    console.error('[TOGGLE_REMINDER_ERROR]:', error)
    return { success: false, message: 'Error al procesar el recordatorio.' }
  }
}

export async function getUserRemindersAction() {
  try {
    const session = await getSession()
    if (!session || !session.user) return { success: true, reminders: [] }
    
    const reminders = await prisma.reminder.findMany({
      where: { userId: session.user.id },
      select: { waypointId: true }
    })
    
    return { success: true, reminders: reminders.map((r: { waypointId: number }) => r.waypointId) }
  } catch (error) {
    console.error('[GET_REMINDERS_ERROR]:', error)
    return { success: false, reminders: [] }
  }
}
