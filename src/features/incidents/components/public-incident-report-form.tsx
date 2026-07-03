'use client'

import { useState } from 'react'
import { Camera, MapPin, Send } from 'lucide-react'
import type { IncidentReportType } from '../types/incident.types'

const incidentTypes: IncidentReportType[] = [
  'Basura acumulada',
  'Contenedor lleno',
  'Camión no pasó',
  'Punto crítico',
]

const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5MB

export function PublicIncidentReportForm() {
  const [type, setType] = useState<IncidentReportType>('Basura acumulada')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [photoName, setPhotoName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setType('Basura acumulada')
    setLocation('')
    setDescription('')
    setPhotoName('')
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!location.trim() || !description.trim()) {
      setError('Por favor completa todos los campos obligatorios.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const photo = formData.get('photo') as File | null

    if (photo?.size && photo.size > MAX_PHOTO_SIZE) {
      setError('La foto no puede ser mayor a 5 MB.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setError(result.error || 'No se pudo enviar el reporte. Intenta de nuevo más tarde.')
        return
      }

      setSuccess('Reporte enviado con éxito. Gracias por ayudar a mejorar la ciudad.')
      setPhotoName('')
      event.currentTarget.reset()
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error al enviar el reporte. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPhotoName(file.name)
    } else {
      setPhotoName('')
    }
  }

  return (
    <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="type" className="font-bold text-slate-700 text-sm">Tipo de Incidencia</label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={(event) => setType(event.target.value as IncidentReportType)}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#7dd3fc] text-slate-700 outline-none transition-all"
            >
              {incidentTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="location" className="font-bold text-slate-700 text-sm">Ubicación</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="location"
                name="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Ej. Plaza de Cusco"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-[#7dd3fc] text-slate-700 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="font-bold text-slate-700 text-sm">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            placeholder="Describe brevemente la situación..."
            className="p-4 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-[#7dd3fc] text-slate-700 outline-none transition-all resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="photo" className="font-bold text-slate-700 text-sm">Evidencia (Opcional)</label>
            <label
              htmlFor="photo"
              className="flex min-h-[4.5rem] items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl p-4 text-slate-500 hover:bg-slate-50 hover:border-[#7dd3fc] transition-all cursor-pointer"
            >
              <Camera size={20} />
              <span>{photoName || 'Selecciona una foto'}</span>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
            <p className="text-xs text-slate-400">Máximo 5 MB. JPG, PNG o WEBP.</p>
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-gradient-to-r from-[#86efac] to-[#34d399] text-emerald-950 font-bold rounded-xl shadow-lg shadow-[#86efac]/30 hover:scale-[1.02] transition-all disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Send size={18} />
              {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
            </button>
          </div>
        </div>
      </form>

      {(error || success) && (
        <div className={`mt-4 rounded-2xl p-4 text-sm ${error ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
          {error || success}
        </div>
      )}
    </div>
  )
}
