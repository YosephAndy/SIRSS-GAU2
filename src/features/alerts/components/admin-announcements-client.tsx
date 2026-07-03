'use client'

import React, { useState, useTransition } from 'react'
import {
  MessageSquare, Plus, X, Trash2, Clock, CheckCircle2, AlertCircle, Megaphone, ToggleLeft, ToggleRight, Camera, Image as ImageIcon
} from 'lucide-react'
import {
  createAnnouncementAction, toggleAnnouncementAction, deleteAnnouncementAction
} from '../actions/alert.actions'

type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

interface Announcement { id: number; title: string; content: string; priority: Priority; isActive: boolean; createdAt: Date; expiresAt: Date | null; updatedAt: Date; images?: any }

interface AdminAnnouncementsClientProps {
  announcements: Announcement[]
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  LOW: { label: 'Baja', color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  NORMAL: { label: 'Informativo', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  HIGH: { label: 'Importante', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  URGENT: { label: 'Urgente', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
}

function formatDateShort(date: Date) {
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}

export function AdminAnnouncementsClient({ announcements: initialAnnouncements }: AdminAnnouncementsClientProps) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showAnnForm, setShowAnnForm] = useState(false)

  // Form states
  const [annTitle, setAnnTitle] = useState('')
  const [annContent, setAnnContent] = useState('')
  const [annPriority, setAnnPriority] = useState<Priority>('NORMAL')
  const [images, setImages] = useState<string[]>([])

  const showMsg = (msg: { success: boolean; message: string }) => {
    setFeedback({ type: msg.success ? 'success' : 'error', text: msg.message })
    setTimeout(() => setFeedback(null), 3500)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    if (images.length + files.length > 2) {
      alert('Solo puedes subir un máximo de 2 imágenes.')
      return
    }
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages(prev => {
          if (prev.length >= 2) return prev
          return [...prev, reader.result as string]
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateAnnouncement = () => {
    if (!annTitle.trim() || !annContent.trim()) return
    startTransition(async () => {
      const res = await createAnnouncementAction({ title: annTitle, content: annContent, priority: annPriority, images: images.length > 0 ? images : undefined })
      showMsg(res)
      if (res.success) { setAnnTitle(''); setAnnContent(''); setAnnPriority('NORMAL'); setImages([]); setShowAnnForm(false) }
    })
  }

  const handleToggleAnnouncement = (id: number, current: boolean) => {
    startTransition(async () => showMsg(await toggleAnnouncementAction(id, !current)))
  }

  const handleDeleteAnnouncement = (id: number) => {
    startTransition(async () => showMsg(await deleteAnnouncementAction(id)))
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare size={22} className="text-blue-500" />
            Gestión de Comunicados
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Publica comunicados generales para los ciudadanos.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Feedback */}
        {feedback && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {feedback.text}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAnnForm(!showAnnForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
            >
              <Plus size={16} /> Nuevo Comunicado
            </button>
          </div>

          {showAnnForm && (
            <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Megaphone size={16} className="text-blue-500" /> Crear comunicado</h3>
                <button onClick={() => setShowAnnForm(false)}><X size={18} className="text-slate-400 hover:text-slate-600" /></button>
              </div>
              <input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="Título del comunicado*" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-slate-50 text-slate-900 placeholder:text-slate-400" />
              <textarea value={annContent} onChange={(e) => setAnnContent(e.target.value)} placeholder="Contenido del comunicado*" rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-slate-50 resize-none text-slate-900 placeholder:text-slate-400" />
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Camera size={14} /> Fotos (opcional, máx 2)
                </label>
                {images.length > 0 && (
                  <div className="flex gap-3 mb-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="Evidencia" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 hover:bg-white transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {images.length < 2 && (
                  <label className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors text-slate-500 hover:text-blue-600 font-medium text-sm bg-slate-50">
                    <ImageIcon size={18} />
                    <span>Subir imagen</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-600">Prioridad:</label>
                <select value={annPriority} onChange={(e) => setAnnPriority(e.target.value as Priority)} className="px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blue-400 bg-slate-50 text-slate-900">
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAnnForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
                <button onClick={handleCreateAnnouncement} disabled={isPending || !annTitle.trim() || !annContent.trim()} className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors disabled:opacity-60">
                  <Megaphone size={14} /> {isPending ? 'Publicando...' : 'Publicar Comunicado'}
                </button>
              </div>
            </div>
          )}

          {initialAnnouncements.length === 0 && !showAnnForm && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <MessageSquare size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No hay comunicados publicados.</p>
            </div>
          )}
          {initialAnnouncements.map((ann) => {
            const pcfg = PRIORITY_CONFIG[ann.priority]
            const annImages = (ann.images as string[]) || []

            return (
              <div key={ann.id} className={`bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-4 flex items-start gap-4 ${!ann.isActive ? 'opacity-60' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Megaphone size={18} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800 text-sm">{ann.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pcfg.color}`}>{pcfg.label}</span>
                    {!ann.isActive && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200">Inactivo</span>}
                  </div>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{ann.content}</p>
                  
                  {annImages.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {annImages.map((img, idx) => (
                        <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="Adjunto" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1"><Clock size={11} /> {formatDateShort(ann.createdAt)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleToggleAnnouncement(ann.id, ann.isActive)} disabled={isPending} title={ann.isActive ? 'Desactivar' : 'Activar'} className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-60">
                    {ann.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => handleDeleteAnnouncement(ann.id)} disabled={isPending} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
