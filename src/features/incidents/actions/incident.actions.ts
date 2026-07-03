'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type IncidentType = 'MISSED_COLLECTION' | 'SPILL' | 'BLOCKED_ROAD' | 'VEHICLE_BREAKDOWN' | 'OTHER'
type IncidentStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'

export async function getIncidents() {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        citizen: {
          include: { user: true }
        },
        driver: true,
      }
    })
    return incidents
  } catch (error) {
    console.error('Error fetching incidents:', error)
    return []
  }
}

export async function createIncidentAction(data: {
  title: string
  description: string
  type: IncidentType
  lat?: number
  lng?: number
  zona?: string
  images?: string[] // array de URLs de fotos mockeadas o en base64
}) {
  try {
    await prisma.incident.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        lat: data.lat,
        lng: data.lng,
        zona: data.zona,
        images: data.images || [],
        status: 'PENDING',
      }
    })
    revalidatePath('/admin/incidents')
    revalidatePath('/reportes')
    return { success: true, message: 'Incidencia reportada correctamente.' }
  } catch (error) {
    console.error('Error creating incident:', error)
    return { success: false, message: 'Error al reportar la incidencia.' }
  }
}

export async function updateIncidentStatusAction(id: number, status: IncidentStatus) {
  try {
    await prisma.incident.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
      }
    })
    revalidatePath('/admin/incidents')
    return { success: true, message: 'Estado actualizado correctamente.' }
  } catch (error) {
    console.error('Error updating incident status:', error)
    return { success: false, message: 'Error al actualizar el estado.' }
  }
}
