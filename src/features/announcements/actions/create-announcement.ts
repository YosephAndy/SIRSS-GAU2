'use server';

import { prisma } from '@/lib/prisma';
import { announcementSchema } from '../schemas/announcement-schema';
import * as z from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function createAnnouncementAction(data: z.infer<typeof announcementSchema>) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication and authorization
    if (!session || session.user?.role?.toUpperCase() !== 'ADMIN') {
      return { success: false, message: 'No tienes permisos para realizar esta acción' };
    }

    // Validate incoming data
    const validatedData = announcementSchema.parse(data);

    // Create the announcement in database
    const announcement = await prisma.announcement.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        priority: validatedData.priority || 'NORMAL',
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        isActive: validatedData.isActive ?? true,
      },
    });

    // Revalidate the public announcements page so changes are immediately visible
    revalidatePath('/announcements');
    revalidatePath('/dashboard/announcements');

    return { 
      success: true, 
      message: 'Aviso publicado exitosamente',
      data: announcement 
    };
  } catch (error) {
    console.error('[CREATE_ANNOUNCEMENT_ACTION]', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Datos de formulario inválidos', fieldErrors: error.issues };
    }
    return { success: false, message: 'Error interno del servidor al publicar el aviso' };
  }
}

export async function updateAnnouncementAction(id: number, data: z.infer<typeof announcementSchema>) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication and authorization
    if (!session || session.user?.role?.toUpperCase() !== 'ADMIN') {
      return { success: false, message: 'No tienes permisos para realizar esta acción' };
    }

    if (typeof id !== 'number' || isNaN(id)) {
      return { success: false, message: 'ID de aviso inválido.' }
    }

    // Validate incoming data
    const validatedData = announcementSchema.parse(data);

    // Update the announcement in database
    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        priority: validatedData.priority || 'NORMAL',
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        isActive: validatedData.isActive ?? true,
      },
    });

    // Revalidate the public announcements page so changes are immediately visible
    revalidatePath('/announcements');
    revalidatePath('/dashboard/announcements');

    return { 
      success: true, 
      message: 'Aviso actualizado exitosamente',
      data: announcement 
    };
  } catch (error) {
    console.error('[UPDATE_ANNOUNCEMENT_ACTION]', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Datos de formulario inválidos', fieldErrors: error.issues };
    }
    return { success: false, message: 'Error interno del servidor al actualizar el aviso' };
  }
}
