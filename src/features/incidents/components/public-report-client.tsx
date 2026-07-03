'use client'

import React, { useState, useTransition } from 'react'
import {
  AlertTriangle, Send, CheckCircle2, MapPin,
  Leaf, ChevronDown, FileText, Camera, X, Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import { createIncidentAction } from '@/features/incidents/actions/incident.actions'

type IncidentType = 'MISSED_COLLECTION' | 'SPILL' | 'BLOCKED_ROAD' | 'VEHICLE_BREAKDOWN' | 'OTHER'

const INCIDENT_TYPES: { value: IncidentType; label: string; description: string; color: string }[] = [
  { value: 'MISSED_COLLECTION', label: 'Recojo no realizado', description: 'El camión no pasó por mi zona en el horario establecido.', color: 'border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400' },
  { value: 'SPILL', label: 'Derrame de residuos', description: 'Hay residuos derramados en la vía pública.', color: 'border-red-300 bg-red-50 text-red-700 hover:border-red-400' },
  { value: 'BLOCKED_ROAD', label: 'Vía bloqueada', description: 'Un vehículo o situación bloquea el paso del camión.', color: 'border-orange-300 bg-orange-50 text-orange-700 hover:border-orange-400' },
  { value: 'VEHICLE_BREAKDOWN', label: 'Avería de vehículo', description: 'El camión recolector tuvo una avería.', color: 'border-purple-300 bg-purple-50 text-purple-700 hover:border-purple-400' },
  { value: 'OTHER', label: 'Otro problema', description: 'Otro tipo de incidencia no listada.', color: 'border-slate-300 bg-slate-50 text-slate-600 hover:border-slate-400' },
]

const ZONAS = ['ZONA 01', 'ZONA 02', 'ZONA 03', 'ZONA 04', 'ZONA 05']

export function PublicReportClient() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [zona, setZona] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    
    // Check max limit
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

  const handleSubmit = () => {
    if (!selectedType || !title.trim() || !description.trim()) return
    startTransition(async () => {
      const res = await createIncidentAction({
        title: title.trim(),
        description: description.trim(),
        type: selectedType,
        zona: zona || undefined,
        images: images,
      })
      if (res.success) setSuccess(true)
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-12 max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">¡Incidencia Reportada!</h2>
            <p className="text-slate-500 mt-2 leading-relaxed">Gracias por ayudarnos a mejorar la ciudad. Nuestro equipo revisará tu reporte a la brevedad posible.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/reportes" onClick={() => setSuccess(false)} className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors">
              Reportar otra incidencia
            </Link>
            <Link href="/" className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-[#86efac] to-[#7dd3fc] p-2 rounded-xl text-white">
              <Leaf size={20} />
            </div>
            <span className="font-bold text-xl text-slate-900">CleanCity</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">← Volver al inicio</Link>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 font-semibold text-sm mb-4">
              <AlertTriangle size={16} /> Reporte de Incidencia
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900">¿Encontraste un problema?</h1>
            <p className="text-slate-500 mt-3 text-lg">Cuéntanos y nos encargaremos de resolverlo lo antes posible.</p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8 justify-center">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-200 text-slate-400'
                }`}>{s}</div>
                {s < 3 && <div className={`h-0.5 w-12 rounded transition-all ${step > s ? 'bg-amber-500' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
            {/* Step 1: tipo */}
            {step === 1 && (
              <>
                <h2 className="text-lg font-bold text-slate-800">¿Qué tipo de problema quieres reportar?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INCIDENT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setSelectedType(t.value)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] ${
                        selectedType === t.value ? t.color + ' ring-2 ring-offset-1 ring-amber-400' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-bold text-sm">{t.label}</p>
                      <p className="text-xs mt-0.5 opacity-75">{t.description}</p>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedType}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar →
                </button>
              </>
            )}

            {/* Step 2: detalles */}
            {step === 2 && (
              <>
                <h2 className="text-lg font-bold text-slate-800">Cuéntanos los detalles</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Título del reporte *</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej: Camión no pasó el lunes en la Av. La Cultura"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Descripción detallada *</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe lo que sucedió, dónde y a qué hora aproximadamente..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-slate-50 resize-none text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <MapPin size={14} /> Zona afectada (opcional)
                    </label>
                    <div className="relative">
                      <select
                        value={zona}
                        onChange={(e) => setZona(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:border-amber-400 bg-slate-50 appearance-none text-slate-900"
                      >
                        <option value="">Seleccionar zona...</option>
                        {ZONAS.map((z) => <option key={z} value={z}>{z}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <Camera size={14} /> Fotos de evidencia (opcional, máx 2)
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
                      <label className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors text-slate-500 hover:text-amber-600 font-medium text-sm">
                        <ImageIcon size={18} />
                        <span>Subir imagen</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">← Atrás</button>
                  <button onClick={() => setStep(3)} disabled={!title.trim() || !description.trim()} className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Continuar →
                  </button>
                </div>
              </>
            )}

            {/* Step 3: confirmar */}
            {step === 3 && (
              <>
                <h2 className="text-lg font-bold text-slate-800">Confirma tu reporte</h2>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                      {INCIDENT_TYPES.find(t => t.value === selectedType)?.label}
                    </span>
                    {zona && <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1"><MapPin size={10}/>{zona}</span>}
                  </div>
                  <p className="font-bold text-slate-800">{title}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                  {images.length > 0 && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-amber-200/50">
                      {images.map((img, idx) => (
                        <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border border-amber-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="Evidencia" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                  <FileText size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Al enviar este reporte, acepta que la información proporcionada será revisada por el equipo de CleanCity para dar seguimiento a tu incidencia de forma oportuna.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">← Atrás</button>
                  <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Send size={16} /> {isPending ? 'Enviando...' : 'Enviar Reporte'}
                  </button>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            ¿Tienes una emergencia? Llama al <span className="font-bold text-slate-600">(084) 227-571</span>
          </p>
        </div>
      </div>
    </div>
  )
}
