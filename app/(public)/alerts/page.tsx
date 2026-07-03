import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Bell, MapPin, Clock, Leaf, AlertTriangle, ChevronRight } from 'lucide-react'
import { getAlerts } from '@/features/alerts/actions/alert.actions'

type Alert = { id: number; title: string; message: string; zona: string | null; sentAt: Date }

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Alertas Activas | CleanCity',
  description: 'Consulta las alertas de emergencia y avisos urgentes del servicio de recolección de residuos.',
}

export default async function AlertsPage() {
  const alerts: Alert[] = await getAlerts()

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 xl:px-12 flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-[#86efac] to-[#7dd3fc] p-2 rounded-xl text-white"><Leaf size={24} /></div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">CleanCity</span>
          </Link>
          <div className="hidden md:flex gap-8">
            <Link href="/schedules" className="text-slate-600 hover:text-emerald-500 transition-colors font-medium">Horarios</Link>
            <Link href="/routes" className="text-slate-600 hover:text-sky-500 transition-colors font-medium">Rutas</Link>
            <Link href="/alerts" className="text-amber-600 font-bold border-b-2 border-amber-500 pb-0.5">Alertas</Link>
            <Link href="/announcements" className="text-slate-600 hover:text-emerald-500 transition-colors font-medium">Comunicados</Link>
          </div>
          <Link href="/login" className="hidden md:block px-5 py-2.5 rounded-full text-slate-700 font-medium hover:bg-[#dbeafe] transition-all">Iniciar Sesión</Link>
        </div>
      </nav>

      <div className="pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 font-bold text-sm mb-4">
              <Bell size={16} className="animate-pulse" /> Alertas del Servicio
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900">Alertas Activas</h1>
            <p className="text-slate-500 mt-3 text-lg">Avisos de emergencia y cambios urgentes en el servicio de recolección.</p>
          </div>

          {/* Contenido */}
          {alerts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Bell size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">¡Todo bajo control!</h3>
              <p className="text-slate-500 mt-2">No hay alertas activas en este momento. El servicio funciona con normalidad.</p>
              <Link href="/" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors">
                Volver al inicio <ChevronRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-white rounded-2xl border-l-4 border-l-red-500 border border-slate-200 shadow-sm px-6 py-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                      <AlertTriangle size={22} className="text-red-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <h2 className="text-base font-extrabold text-slate-800">{alert.title}</h2>
                        {alert.zona && (
                          <span className="flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200 shrink-0">
                            <MapPin size={11} /> {alert.zona}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 mt-2 leading-relaxed">{alert.message}</p>
                      <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
                        <Clock size={12} />
                        {new Date(alert.sentAt).toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link href="/announcements" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
              Ver comunicados generales <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
