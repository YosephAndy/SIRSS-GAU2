'use client'

import React, { useState, useTransition } from 'react'
import {
  AlertTriangle, CheckCircle2, Clock, Search, Filter,
  Eye, ChevronDown, AlertCircle, User, MapPin, Calendar, RefreshCw
} from 'lucide-react'
import { updateIncidentStatusAction } from '../actions/incident.actions'

type IncidentType = 'MISSED_COLLECTION' | 'SPILL' | 'BLOCKED_ROAD' | 'VEHICLE_BREAKDOWN' | 'OTHER'
type IncidentStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'


interface Incident {
  id: number
  title: string
  description: string
  type: IncidentType
  status: IncidentStatus
  lat: number | null
  lng: number | null
  zona: string | null
  images: unknown
  createdAt: Date
  resolvedAt: Date | null
  citizen: { user: { name: string; email: string } } | null
  driver: { name: string } | null
}

interface AdminIncidentsClientProps {
  incidents: Incident[]
}

const TYPE_LABELS: Record<IncidentType, string> = {
  MISSED_COLLECTION: 'Recojo no realizado',
  SPILL: 'Derrame de residuos',
  BLOCKED_ROAD: 'Vía bloqueada',
  VEHICLE_BREAKDOWN: 'Avería de vehículo',
  OTHER: 'Otro',
}

const TYPE_COLORS: Record<IncidentType, string> = {
  MISSED_COLLECTION: 'bg-amber-100 text-amber-700 border-amber-200',
  SPILL: 'bg-red-100 text-red-700 border-red-200',
  BLOCKED_ROAD: 'bg-orange-100 text-orange-700 border-orange-200',
  VEHICLE_BREAKDOWN: 'bg-purple-100 text-purple-700 border-purple-200',
  OTHER: 'bg-slate-100 text-slate-600 border-slate-200',
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  IN_PROGRESS: { label: 'En proceso', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: RefreshCw },
  RESOLVED: { label: 'Resuelto', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
}

export function AdminIncidentsClient({ incidents }: AdminIncidentsClientProps) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | IncidentStatus>('ALL')
  const [filterType, setFilterType] = useState<'ALL' | IncidentType>('ALL')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ id: number; type: 'success' | 'error'; text: string } | null>(null)

  const filtered = incidents.filter((inc) => {
    const matchSearch =
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.description.toLowerCase().includes(search.toLowerCase()) ||
      (inc.zona?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchStatus = filterStatus === 'ALL' || inc.status === filterStatus
    const matchType = filterType === 'ALL' || inc.type === filterType
    return matchSearch && matchStatus && matchType
  })

  const counts = {
    PENDING: incidents.filter((i) => i.status === 'PENDING').length,
    IN_PROGRESS: incidents.filter((i) => i.status === 'IN_PROGRESS').length,
    RESOLVED: incidents.filter((i) => i.status === 'RESOLVED').length,
  }

  const handleStatusChange = (id: number, status: IncidentStatus) => {
    startTransition(async () => {
      const result = await updateIncidentStatusAction(id, status)
      setFeedback({ id, type: result.success ? 'success' : 'error', text: result.message })
      setTimeout(() => setFeedback(null), 3000)
    })
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle size={22} className="text-amber-500" />
            Revisión de Incidencias Ciudadanas
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Gestiona y actualiza el estado de las incidencias reportadas por la ciudadanía.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(counts).map(([status, count]) => {
            const cfg = STATUS_CONFIG[status as IncidentStatus]
            const Icon = cfg.icon
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(filterStatus === status ? 'ALL' : status as IncidentStatus)}
                className={`bg-white rounded-2xl border p-5 text-left hover:shadow-sm transition-all ${
                  filterStatus === status ? 'ring-2 ring-blue-500 border-blue-200' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{cfg.label}</p>
                    <p className="text-3xl font-extrabold text-slate-800 mt-1">{count}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${cfg.color}`}>
                    <Icon size={22} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, descripción o zona..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-slate-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'ALL' | IncidentType)}
              className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-blue-400 bg-slate-50 text-slate-700 font-medium"
            >
              <option value="ALL">Todos los tipos</option>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de incidencias */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <AlertCircle size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No hay incidencias que coincidan con los filtros.</p>
            </div>
          )}
          {filtered.map((inc) => {
            const cfg = STATUS_CONFIG[inc.status]
            const StatusIcon = cfg.icon
            const isExpanded = expandedId === inc.id
            const myFeedback = feedback?.id === inc.id ? feedback : null

            return (
              <div key={inc.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Header de tarjeta */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : inc.id)}
                  className="w-full px-6 py-4 flex items-start gap-4 text-left hover:bg-slate-50/50 transition-colors"
                >
                  {/* Tipo badge */}
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 mt-0.5 ${TYPE_COLORS[inc.type]}`}>
                    {TYPE_LABELS[inc.type]}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{inc.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{inc.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(inc.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {inc.zona && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {inc.zona}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Estado */}
                  <span className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border shrink-0 ${cfg.color}`}>
                    <StatusIcon size={12} />
                    {cfg.label}
                  </span>
                  <ChevronDown size={16} className={`text-slate-400 shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Detalle expandido */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-6 py-5 bg-slate-50/50 space-y-4">
                    {/* Ciudadano */}
                    {inc.citizen && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User size={15} className="text-slate-400" />
                        <span className="font-semibold">{inc.citizen.user.name}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-400">{inc.citizen.user.email}</span>
                      </div>
                    )}
                    {!inc.citizen && !inc.driver && (
                      <p className="text-sm text-slate-400 flex items-center gap-1.5">
                        <User size={15} /> Reportado por ciudadano anónimo
                      </p>
                    )}

                    <div className="bg-white border border-slate-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Descripción completa</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{inc.description}</p>
                      {(() => {
                        const incImages = Array.isArray(inc.images) ? (inc.images as string[]) : []
                        if (incImages.length === 0) return null
                        return (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Imágenes adjuntas</p>
                            <div className="flex gap-2">
                              {incImages.map((img, idx) => (
                                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={img} alt="Evidencia" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    {/* Cambiar estado */}
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cambiar estado</p>
                      <div className="flex gap-2 flex-wrap">
                        {(['PENDING', 'IN_PROGRESS', 'RESOLVED'] as IncidentStatus[]).map((s) => {
                          const scfg = STATUS_CONFIG[s]
                          const SIcon = scfg.icon
                          return (
                            <button
                              key={s}
                              disabled={isPending || inc.status === s}
                              onClick={() => handleStatusChange(inc.id, s)}
                              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                                inc.status === s
                                  ? scfg.color + ' cursor-default opacity-80'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                              } disabled:opacity-60`}
                            >
                              <SIcon size={13} /> {scfg.label}
                            </button>
                          )
                        })}
                      </div>
                      {myFeedback && (
                        <p className={`text-xs font-semibold mt-2 ${myFeedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {myFeedback.text}
                        </p>
                      )}
                    </div>

                    {inc.resolvedAt && (
                      <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        Resuelto el {new Date(inc.resolvedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
