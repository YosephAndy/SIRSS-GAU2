'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Truck, Trash2, CheckCircle, AlertTriangle, 
  MapPin, FileText, Plus, Edit2, Calendar, MessageSquare
} from 'lucide-react'

export function AdminDashboardScreen({ initialAnnouncements = [] }: { initialAnnouncements?: any[] }) {
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
          <div className="text-4xl font-black text-red-600">1</div>
          <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold">
            Alerta en zona histórica
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-10">
        {/* Map Section */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-extrabold text-slate-800">Monitoreo en Tiempo Real</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              En Vivo
            </div>
          </div>
          <div className="flex-1 min-h-[400px] bg-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
            <div className="absolute inset-0 bg-slate-900/10"></div>
            
            <div className="relative z-10 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white text-center max-w-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-inner">
                <MapPin size={32} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Mapa Integrado</h3>
              <p className="text-sm text-slate-500 font-medium">La visualización de unidades en tiempo real se implementará en el próximo sprint.</p>
            </div>
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
