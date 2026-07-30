import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { MessageSquare, Clock, Leaf, ChevronRight, Megaphone, AlertCircle } from 'lucide-react'
import { getAnnouncements } from '@/features/alerts/actions/alert.actions'
import MobileBottomNav from '@/components/ui/MobileBottomNav'

type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
type Announcement = { id: number; title: string; content: string; priority: Priority; isActive: boolean; createdAt: Date; expiresAt: Date | null; updatedAt: Date; images?: any }

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Comunicados Oficiales | CleanCity',
  description: 'Lee los comunicados, avisos e informaciones oficiales del servicio de recolección de residuos de CleanCity.',
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  LOW: { label: 'Baja', color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  NORMAL: { label: 'Informativo', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  HIGH: { label: 'Importante', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  URGENT: { label: 'Urgente', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
}

export default async function AnnouncementsPage() {
  const announcements: Announcement[] = await getAnnouncements()

  return (
    <>
    <div className="min-h-screen bg-[#f8fafc] pb-16">
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
            <Link href="/alerts" className="text-slate-600 hover:text-amber-500 transition-colors font-medium">Alertas</Link>
            <Link href="/announcements" className="text-blue-600 font-bold border-b-2 border-blue-500 pb-0.5">Comunicados</Link>
          </div>
          <Link href="/login" className="hidden md:block px-5 py-2.5 rounded-full text-slate-700 font-medium hover:bg-[#dbeafe] transition-all">Iniciar Sesión</Link>
        </div>
      </nav>

      <div className="pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-4">
              <Megaphone size={16} /> Comunicados Oficiales
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900">Tablón de Comunicados</h1>
            <p className="text-slate-500 mt-3 text-lg">Información oficial, avisos y novedades del servicio municipal de limpieza.</p>
          </div>

          {/* Contenido */}
          {announcements.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Sin comunicados recientes</h3>
              <p className="text-slate-500 mt-2">No hay comunicados publicados en este momento. Vuelve pronto.</p>
              <Link href="/" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-2xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors">
                Volver al inicio <ChevronRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {announcements.map((ann) => {
                const pcfg = PRIORITY_CONFIG[ann.priority]
                return (
                  <article key={ann.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    {/* Accent bar */}
                    <div className={`h-1.5 w-full ${pcfg.dot}`} />
                    <div className="p-7">
                      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                        <h2 className="text-xl font-extrabold text-slate-900 flex-1">{ann.title}</h2>
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border shrink-0 ${pcfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pcfg.dot}`} />
                          {pcfg.label}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-base">{ann.content}</p>
                      
                      {ann.images && Array.isArray(ann.images) && ann.images.length > 0 && (
                        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                          {(ann.images as string[]).map((img, idx) => (
                            <div key={idx} className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img} alt="Adjunto" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {new Date(ann.createdAt).toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                        {ann.expiresAt && (
                          <span className="flex items-center gap-1.5 text-amber-500">
                            <AlertCircle size={12} />
                            Válido hasta {new Date(ann.expiresAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="text-center">
            <Link href="/alerts" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
              Ver alertas de emergencia <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
    <MobileBottomNav />
    </>
  )
}
