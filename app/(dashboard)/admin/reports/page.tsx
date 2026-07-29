import React from 'react'
import { Download, AlertTriangle, Route, Truck } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Exportar Reportes</h1>
        <p className="text-slate-500 mt-1">Descarga los datos operativos y gerenciales en formato CSV.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Reporte de Incidentes</h2>
            <p className="text-sm text-slate-500 mb-6">Descarga un registro completo de todas las incidencias reportadas por ciudadanos y conductores.</p>
          </div>
          <a href="/api/admin/export?type=incidents" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors">
            <Download size={18} />
            Exportar CSV
          </a>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <Truck size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Historial de Asignaciones</h2>
            <p className="text-sm text-slate-500 mb-6">Obtén el registro histórico de las rutas asignadas a los conductores de los camiones compactadores.</p>
          </div>
          <a href="/api/admin/export?type=assignments" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors">
            <Download size={18} />
            Exportar CSV
          </a>
        </div>
      </div>
    </div>
  )
}
