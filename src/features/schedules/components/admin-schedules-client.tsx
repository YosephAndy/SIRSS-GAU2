'use client'

import React, { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle, Trash2, MapPin, X, AlertCircle, CheckCircle2, Edit2, List } from 'lucide-react'
import { scheduleFormSchema, type ScheduleFormValues } from '../schemas/schedule.schema'
import { createScheduleAction, deleteScheduleAction, updateScheduleAction } from '../actions/schedule.actions'
import type { FlatSchedule } from '../services/schedule.service'

interface AdminSchedulesClientProps {
  initialDataset: FlatSchedule[]
}

export function AdminSchedulesClient({ initialDataset }: AdminSchedulesClientProps) {
  const [dataset, setDataset] = useState<FlatSchedule[]>(initialDataset)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterZone, setFilterZone] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const [serverMessage, setServerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ScheduleFormValues, unknown, ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema) as any,
    defaultValues: {
      orden: 1,
      campaneo: 0,
      hora_salida: '06:00',
      hora_llegada: '06:30',
    },
  })

  const onSubmit = async (data: ScheduleFormValues) => {
    setServerMessage(null)
    startTransition(async () => {
      let result
      if (editingId) {
        result = await updateScheduleAction(editingId, data)
      } else {
        result = await createScheduleAction(data)
      }

      if (result.success && result.data) {
        if (editingId) {
          setDataset((prev) => prev.map((s) => s.id === editingId ? result.data as FlatSchedule : s))
          setServerMessage({ type: 'success', text: result.message || 'Registro actualizado exitosamente.' })
        } else {
          setDataset((prev) => [...prev, result.data as FlatSchedule])
          setServerMessage({ type: 'success', text: result.message || 'Registro añadido exitosamente.' })
        }
        reset()
        setTimeout(() => {
          setServerMessage(null)
          setIsModalOpen(false)
          setEditingId(null)
        }, 2000)
      } else {
        setServerMessage({ type: 'error', text: result.message || 'Error al guardar el registro.' })
      }
    })
  }

  const handleEdit = (row: FlatSchedule) => {
    setEditingId(row.id)
    reset({
      zona: row.zoneName || '',
      turno: row.shift,
      dias: row.days.join(', '),
      orden: row.sequence,
      punto_salida: row.originPoint,
      punto_llegada: row.destinationPoint,
      hora_salida: row.waypointDepartureTime || '06:00',
      hora_llegada: row.waypointArrivalTime || '06:30',
      campaneo: row.hasCampanio ? 1 : 0,
      observaciones: row.observations,
    })
    setIsModalOpen(true)
    setServerMessage(null)
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteScheduleAction(id)
      if (result.success) {
        setDataset((prev) => prev.filter((s) => s.id !== id))
      } else {
        setServerMessage({ type: 'error', text: result.message || 'Error al eliminar el registro.' })
      }
      setDeletingId(null)
    })
  }

  const filteredDataset = filterZone
    ? dataset.filter((s) => s.zoneName?.toLowerCase().includes(filterZone.toLowerCase()))
    : dataset

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Horarios</h1>
            <p className="text-slate-500 text-sm mt-0.5">Administra las rutas y horarios de recolección</p>
          </div>
          <button
            id="add-schedule-btn"
            onClick={() => { setIsModalOpen(true); setServerMessage(null); reset(); setEditingId(null); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
          >
            <PlusCircle size={18} />
            Nuevo Horario
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm text-slate-500 font-medium">Total Waypoints</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{dataset.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm text-slate-500 font-medium">Zonas Únicas</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {new Set(dataset.map((s) => s.zoneName).filter(Boolean)).size}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex items-center gap-3">
          <MapPin size={18} className="text-slate-400 shrink-0" />
          <input
            id="filter-zone-input"
            type="text"
            placeholder="Filtrar por zona..."
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="flex-1 text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
          {filterZone && (
            <button onClick={() => setFilterZone('')} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Zona</th>
                <th className="py-3 px-4">Turno</th>
                <th className="py-3 px-4">Días</th>
                <th className="py-3 px-4">Orden</th>
                <th className="py-3 px-4">Recorrido</th>
                <th className="py-3 px-4">Horas</th>
                <th className="py-3 px-4 text-center">Camp.</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDataset.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                filteredDataset.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 text-sm text-slate-700 transition-colors">
                    <td className="py-3 px-4">{row.id}</td>
                    <td className="py-3 px-4 font-medium">{row.zoneName || 'N/A'}</td>
                    <td className="py-3 px-4">{row.shift}</td>
                    <td className="py-3 px-4 text-xs">{row.days.join(', ')}</td>
                    <td className="py-3 px-4">{row.sequence}</td>
                    <td className="py-3 px-4 max-w-xs truncate" title={`${row.originPoint} -> ${row.destinationPoint}`}>
                      {row.originPoint} → {row.destinationPoint}
                    </td>
                    <td className="py-3 px-4 font-mono">{row.waypointDepartureTime || '-'} - {row.waypointArrivalTime || '-'}</td>
                    <td className="py-3 px-4 text-center">{row.hasCampanio ? 'Sí' : 'No'}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(row)}
                          disabled={deletingId === row.id || isPending}
                          className="p-1 text-slate-400 hover:text-blue-500 rounded transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={deletingId === row.id || isPending}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <List size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Editar Horario' : 'Nuevo Horario'}</h2>
                </div>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setServerMessage(null); reset(); setEditingId(null); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {serverMessage && (
                <div className={`flex items-start gap-2 p-3 mb-5 rounded-xl text-sm font-medium ${serverMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {serverMessage.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                  {serverMessage.text}
                </div>
              )}

              <form id="schedule-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Zona</label>
                  <input {...register('zona')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
                  {errors.zona && <p className="text-red-500 text-xs mt-1">{errors.zona.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Turno</label>
                  <input {...register('turno')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
                  {errors.turno && <p className="text-red-500 text-xs mt-1">{errors.turno.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Días</label>
                  <input {...register('dias')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
                  {errors.dias && <p className="text-red-500 text-xs mt-1">{errors.dias.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Orden</label>
                  <input type="number" {...register('orden')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
                  {errors.orden && <p className="text-red-500 text-xs mt-1">{errors.orden.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Punto Salida</label>
                  <input {...register('punto_salida')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
                  {errors.punto_salida && <p className="text-red-500 text-xs mt-1">{errors.punto_salida.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Punto Llegada</label>
                  <input {...register('punto_llegada')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
                  {errors.punto_llegada && <p className="text-red-500 text-xs mt-1">{errors.punto_llegada.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hora Salida</label>
                  <input type="time" {...register('hora_salida')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
                  {errors.hora_salida && <p className="text-red-500 text-xs mt-1">{errors.hora_salida.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hora Llegada</label>
                  <input type="time" {...register('hora_llegada')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
                  {errors.hora_llegada && <p className="text-red-500 text-xs mt-1">{errors.hora_llegada.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Campaneo (0 o 1)</label>
                  <input type="number" {...register('campaneo')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
                  {errors.campaneo && <p className="text-red-500 text-xs mt-1">{errors.campaneo.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observaciones</label>
                  <input {...register('observaciones')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
                  {errors.observaciones && <p className="text-red-500 text-xs mt-1">{errors.observaciones.message}</p>}
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setServerMessage(null); reset(); setEditingId(null); }}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="schedule-form"
                disabled={isSubmitting || isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting || isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}