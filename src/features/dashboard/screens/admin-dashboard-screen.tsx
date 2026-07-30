'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { publishIncidentAction } from '@/features/alerts/actions/alert.actions'
import { 
  Truck, Trash2, CheckCircle, AlertTriangle, 
  MapPin, FileText, Plus, Edit2, Calendar, MessageSquare, Share, Loader2
} from 'lucide-react'

function IncidentCard({ incident }: { incident: any }) {
  const [isPending, startTransition] = React.useTransition()

  const handlePublish = () => {
    startTransition(async () => {
      await publishIncidentAction(incident.id)
    })
  }

  return (
    <div className="group relative p-5 rounded-2xl bg-white border border-red-100 hover:border-red-300 hover:shadow-md transition-all shadow-sm">
      <div className="flex justify-between items-start gap-4">
        <div className="mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-red-50 text-red-600 shadow-inner shadow-red-500/10">
          <AlertTriangle size={20} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="text-[15px] font-bold text-slate-800 line-clamp-1">{incident.title}</h4>
            <span className="text-xs font-bold text-slate-400">
              {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{incident.description}</p>
          
          <div className="mt-3 flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
              Conductor: {incident.driver?.name || 'Desconocido'}
            </div>
            {incident.lat && incident.lng && (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${incident.lat},${incident.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <MapPin size={12} /> Ver en Mapa
              </a>
            )}
            <div className="ml-auto">
              <button
                onClick={handlePublish}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Share size={14} />}
                Mostrar al Ciudadano
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminDashboardScreen({ 
  initialAnnouncements = [],
  initialIncidents = [] 
}: { 
  initialAnnouncements?: any[],
  initialIncidents?: any[] 
}) {
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);

  const handleEditAnnouncement = (aviso: any) => {
    // Lógica para editar aviso, si estuviera manejada aquí, 
    // pero como el layout tiene el modal, idealmente usaríamos un global state.
    // Por ahora solo log.
    console.log("Edit announcement", aviso);
  };

  return (
    <div className="p-6 md:p-8 xl:p-12 max-w-[1400px] mx-auto w-full relative">
      {/* Background blobs for premium feel */}
      <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-tr from-[#7dd3fc] to-[#38bdf8] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/80 shadow-sm relative overflow-hidden pl-16 md:pl-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Panel Administrativo</h1>
          <p className="text-slate-500 mt-2 text-[15px] font-medium">Resumen general de las operaciones de CleanCity</p>
        </div>
        
        <div className="flex gap-4 relative z-10 w-full md:w-auto">
          <Link 
            href="/admin/schedules"
            className="flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 transition-all active:scale-95"
          >
            <Calendar size={20} />
            Gestionar Horarios
          </Link>
        </div>
      </header>

      {/* Grid of Key Smart City Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {/* Card 1 */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl transition-all hover:-translate-y-1 group">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Unidades Activas</div>
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Truck size={24} />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800 flex items-center gap-3">
            <span>12 <span className="text-xl text-slate-400 font-bold">/ 15</span></span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
            ↑ 92% operativo
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl transition-all hover:-translate-y-1 group">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Residuos Hoy</div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Trash2 size={24} />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800">
            24.8 <span className="text-xl text-slate-400 font-bold">Ton</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Meta: 30 Ton</span>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[82%] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl transition-all hover:-translate-y-1 group">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Eficiencia</div>
            <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800">85.4%</div>
          <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
            ↑ +2.1% hoy
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl transition-all hover:-translate-y-1 group">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Incidencias</div>
            <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="text-4xl font-black text-red-600">{initialIncidents.length}</div>
          <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold">
            {initialIncidents.length > 0 ? 'Atención Requerida' : 'Todo en orden'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-10">
        {/* Live Incidents Section */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-extrabold text-slate-800">Emergencias Reportadas (En Vivo)</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 font-bold text-xs border border-red-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              Monitoreo Activo
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {initialIncidents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center gap-3">
                <div className="p-4 bg-emerald-50 rounded-full">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <p className="text-sm font-medium">No hay emergencias pendientes. Todo opera con normalidad.</p>
              </div>
            ) : (
              initialIncidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))
            )}
          </div>
        </div>

        {/* Announcements Section */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm flex flex-col h-[500px] xl:h-auto">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-extrabold text-slate-800">Avisos Activos</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {initialAnnouncements.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center gap-3">
                <div className="p-4 bg-slate-50 rounded-full">
                  <MessageSquare size={32} className="text-slate-300" />
                </div>
                <p className="text-sm font-medium">No hay comunicados activos en este momento.</p>
              </div>
            ) : (
              initialAnnouncements.map((aviso) => (
                <div key={aviso.id} className="group relative p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div className={`mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      aviso.priority === 'URGENT' ? 'bg-red-50 text-red-600 shadow-inner shadow-red-500/10' :
                      aviso.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 shadow-inner shadow-orange-500/10' :
                      'bg-blue-50 text-blue-600 shadow-inner shadow-blue-500/10'
                    }`}>
                      <FileText size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[15px] font-bold text-slate-800 line-clamp-1 pr-8">{aviso.title}</h4>
                      <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{aviso.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
