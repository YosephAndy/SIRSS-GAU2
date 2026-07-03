'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { announcementSchema } from '../schemas/announcement-schema';
import * as z from 'zod';
import { PlusCircle, FileText, X } from 'lucide-react';
import { createAnnouncementAction, updateAnnouncementAction } from '../actions/create-announcement';

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAnnouncement?: {
    id: number;
    title: string;
    content: string;
    priority: string;
  } | null;
}

export function CreateAnnouncementModal({ isOpen, onClose, editingAnnouncement }: CreateAnnouncementModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: editingAnnouncement?.title || '',
      content: editingAnnouncement?.content || '',
      priority: (editingAnnouncement?.priority as any) || 'NORMAL',
    }
  });

  // Effect to reset form when editingAnnouncement changes
  React.useEffect(() => {
    if (isOpen) {
      reset({
        title: editingAnnouncement?.title || '',
        content: editingAnnouncement?.content || '',
        priority: (editingAnnouncement?.priority as any) || 'NORMAL',
      });
      setServerMessage(null);
    }
  }, [editingAnnouncement, isOpen, reset]);

  const onSubmit = async (data: AnnouncementFormValues) => {
    setIsSubmitting(true);
    setServerMessage(null);
    try {
      let response;
      if (editingAnnouncement) {
        response = await updateAnnouncementAction(editingAnnouncement.id, data);
      } else {
        response = await createAnnouncementAction(data);
      }
      
      if (response.success) {
        setServerMessage({ type: 'success', text: response.message || (editingAnnouncement ? 'Actualizado con éxito' : 'Publicado con éxito') });
        setTimeout(() => {
          setServerMessage(null);
          onClose();
        }, 1500);
      } else {
        setServerMessage({ type: 'error', text: response.message || 'Ocurrió un error al guardar.' });
      }
    } catch (error) {
      console.error(error);
      setServerMessage({ type: 'error', text: 'Ocurrió un error inesperado.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{editingAnnouncement ? 'Editar Aviso' : 'Publicar Nuevo Aviso'}</h2>
              <p className="text-sm text-slate-500">{editingAnnouncement ? 'Modifica la información del comunicado.' : 'Crea comunicados para la ciudadanía.'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {serverMessage && (
            <div className={`p-4 mb-6 rounded-lg font-medium text-sm ${serverMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {serverMessage.text}
            </div>
          )}

          <form id="announcement-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Título del Aviso
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                placeholder="Ej: Campaña de reciclaje en zona norte"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Contenido Detallado
              </label>
              <textarea
                {...register('content')}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none"
                placeholder="Escribe el mensaje detallado para los ciudadanos..."
              />
              {errors.content && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.content.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nivel de Prioridad
              </label>
              <select
                {...register('priority')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              >
                <option value="LOW">Baja (Solo informativo)</option>
                <option value="NORMAL">Normal (Aviso estándar)</option>
                <option value="HIGH">Alta (Cambios en el servicio)</option>
                <option value="URGENT">Urgente (Emergencias)</option>
              </select>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="announcement-form"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? 'Guardando...' : (editingAnnouncement ? 'Actualizar Aviso' : 'Publicar Aviso')}
          </button>
        </div>

      </div>
    </div>
  );
}
