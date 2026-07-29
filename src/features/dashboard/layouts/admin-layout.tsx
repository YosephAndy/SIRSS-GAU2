'use client'

import React, { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Leaf, Truck, CheckCircle, AlertTriangle, 
  MapPin, LogOut, FileText, 
  Calendar, Map, Route, Users, Bell, 
  Clock, BarChart2, Download, ChevronDown, ChevronRight, Menu, X
} from 'lucide-react'

const SIDEBAR_GROUPS = [
  {
    title: "GESTIÓN OPERATIVA",
    items: [
      { id: "SIRSS-50", label: "Gestionar puntos de recolección", icon: <MapPin size={18} />, href: "#" },
      { id: "SIRSS-27", label: "Gestionar zonas", icon: <Map size={18} />, href: "/admin/zones" },
      { id: "SIRSS-48", label: "Gestionar rutas", icon: <Route size={18} />, href: "/admin/routes" },
      { id: "SIRSS-28", label: "Gestionar horarios", icon: <Calendar size={18} />, href: "/admin/schedules" },
    ]
  },
  {
    title: "PERSONAL Y ASIGNACIONES",
    items: [
      { id: "SIRSS-26", label: "Gestionar conductores", icon: <Users size={18} />, href: "#" },
      { id: "SIRSS-49", label: "Asignar rutas a conductores", icon: <Truck size={18} />, href: "/admin/assignments" },
    ]
  },
  {
    title: "INCIDENCIAS Y ALERTAS",
    items: [
      { id: "SIRSS-57", label: "Revisar incidencias ciudadanas", icon: <AlertTriangle size={18} />, href: "/admin/incidents" },
      { id: "SIRSS-59", label: "Validar incidencias", icon: <CheckCircle size={18} />, href: "#" },
      { id: "SIRSS-55", label: "Gestionar alertas", icon: <Bell size={18} />, href: "/admin/alerts" },
      { id: "SIRSS-XX", label: "Gestionar comunicados", icon: <FileText size={18} />, href: "/admin/announcements" },
    ]
  },
  {
    title: "REPORTES Y ESTADÍSTICAS",
    items: [
      { id: "SIRSS-56", label: "Visualizar reportes", icon: <FileText size={18} />, href: "#" },
      { id: "SIRSS-58", label: "Generar estadísticas", icon: <BarChart2 size={18} />, href: "#" },
      { id: "SIRSS-61", label: "Reporte diario", icon: <FileText size={18} />, href: "#" },
      { id: "SIRSS-62", label: "Reporte semanal", icon: <FileText size={18} />, href: "#" },
      { id: "SIRSS-63", label: "Exportar reportes", icon: <Download size={18} />, href: "/admin/reports" },
    ]
  }
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({ 0: true })
  const pathname = usePathname()

  const toggleGroup = (index: number) => {
    setOpenGroups(prev => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 flex overflow-hidden">
      <aside 
        className={`fixed md:relative top-0 left-0 h-screen transition-all duration-300 z-30 flex flex-col shadow-xl md:shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-800 bg-slate-900 
        ${isSidebarOpen ? 'w-[320px] translate-x-0' : 'w-[320px] -translate-x-full md:w-0 md:border-none md:overflow-hidden'}`}
      >
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-sm shadow-blue-500/20">
                <Leaf size={24} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">CleanCity</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Portal</p>
              </div>
            </Link>
            <button className="md:hidden p-2 text-slate-400 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-4 pb-8">
            {SIDEBAR_GROUPS.map((group, gIdx) => (
              <div key={gIdx} className="bg-slate-800/40 rounded-2xl overflow-hidden border border-slate-800">
                <button 
                  onClick={() => toggleGroup(gIdx)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider hover:bg-slate-800 hover:text-slate-300 transition-colors"
                >
                  {group.title}
                  {openGroups[gIdx] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                
                {openGroups[gIdx] && (
                  <div className="px-2 pb-2 space-y-1">
                    {group.items.map((item, iIdx) => {
                      const isActive = pathname === item.href

                      const content = (
                        <>
                          <div className={`p-1.5 rounded-lg mr-3 transition-colors ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.icon}
                          </div>
                          <span className="flex-1 text-sm font-semibold text-slate-200 truncate">
                            {item.label}
                          </span>
                          {isActive && (
                            <ChevronRight size={16} className="text-white opacity-80" />
                          )}
                        </>
                      )

                      const className = `group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 outline-none ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`

                      return (
                        <Link key={iIdx} href={item.href || '#'} className={className}>
                          {content}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-red-500/10 hover:text-red-400 transition-all border border-slate-700 hover:border-red-500/30"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-6 left-6 z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-3 rounded-xl bg-white text-slate-600 shadow-md hover:bg-slate-50 transition-all border border-slate-100
            ${isSidebarOpen ? 'hidden md:block scale-0 opacity-0' : 'scale-100 opacity-100'}`}
          >
            <Menu size={24} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
