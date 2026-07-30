'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export async function getAlerts() {
  try {
    return await prisma.alert.findMany({ orderBy: { sentAt: 'desc' } })
  } catch {
    return []
  }
}

export async function createAlertAction(data: { title: string; message: string; zona?: string }) {
  try {
    await prisma.alert.create({ data })
    revalidatePath('/admin/alerts')
    revalidatePath('/alerts')
    return { success: true, message: 'Alerta creada correctamente.' }
  } catch {
    return { success: false, message: 'Error al crear la alerta.' }
  }
}

export async function publishIncidentAction(incidentId: number) {
  try {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } })
    if (!incident) return { success: false, message: 'Incidencia no encontrada.' }

    // Create the alert for citizens
    await prisma.alert.create({
      data: {
        title: incident.title,
        message: incident.description,
      }
    })

    // Resolve the incident so it leaves the live feed
    await prisma.incident.update({
      where: { id: incidentId },
      data: { status: 'RESOLVED' }
    })

    revalidatePath('/dashboard')
    revalidatePath('/alerts')
    return { success: true, message: 'Incidencia publicada a ciudadanos.' }
  } catch {
    return { success: false, message: 'Error al publicar la incidencia.' }
  }
}

export async function deleteAlertAction(id: number) {
  try {
    await prisma.alert.delete({ where: { id } })
    revalidatePath('/admin/alerts')
    revalidatePath('/alerts')
    return { success: true, message: 'Alerta eliminada.' }
  } catch {
    return { success: false, message: 'Error al eliminar la alerta.' }
  }
}

export async function getAnnouncements() {
  try {
    return await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    return []
  }
}

export async function getAllAnnouncements() {
  try {
    return await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } })
  } catch {
    return []
  }
}

export async function createAnnouncementAction(data: { title: string; content: string; priority: Priority; images?: string[] }) {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        priority: data.priority,
        images: data.images || [],
      }
    })
    revalidatePath('/admin/announcements')
    revalidatePath('/announcements')
    return { success: true, message: 'Comunicado publicado correctamente.' }
  } catch {
    return { success: false, message: 'Error al publicar el comunicado.' }
  }
}

export async function toggleAnnouncementAction(id: number, isActive: boolean) {
  try {
    await prisma.announcement.update({ where: { id }, data: { isActive } })
    revalidatePath('/admin/announcements')
    revalidatePath('/announcements')
    return { success: true, message: 'Comunicado actualizado.' }
  } catch {
    return { success: false, message: 'Error al actualizar el comunicado.' }
  }
}

export async function deleteAnnouncementAction(id: number) {
  try {
    await prisma.announcement.delete({ where: { id } })
    revalidatePath('/admin/announcements')
    revalidatePath('/announcements')
    return { success: true, message: 'Comunicado eliminado.' }
  } catch {
    return { success: false, message: 'Error al eliminar el comunicado.' }
  }
}
