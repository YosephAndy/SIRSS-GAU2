'use client'

import React, { useState, useTransition } from 'react'
import {
  Bell, Plus, Trash2,
  AlertCircle, CheckCircle2, X, Clock
} from 'lucide-react'
import {
  createAlertAction, deleteAlertAction
} from '../actions/alert.actions'

function formatDate(date: Date): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][d.getMonth()]
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${month}. ${year}, ${hours}:${minutes}`
}



interface Alert { id: number; title: string; message: string; zona: string | null; sentAt: Date }

interface AdminAlertsClientProps {
  alerts: Alert[]
}

export function AdminAlertsClient({ alerts: initialAlerts }: AdminAlertsClientProps) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Alert form state
  const [alertTitle, setAlertTitle] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [alertZona, setAlertZona] = useState('')
  const [showAlertForm, setShowAlertForm] = useState(false)



  const showMsg = (msg: { success: boolean; message: string }) => {
    setFeedback({ type: msg.success ? 'success' : 'error', text: msg.message })
    setTimeout(() => setFeedback(null), 3500)
  }

  const handleCreateAlert = () => {
    if (!alertTitle.trim() || !alertMessage.trim()) return
    startTransition(async () => {
      const res = await createAlertAction({ title: alertTitle, message: alertMessage, zona: alertZona || undefined })
      showMsg(res)
      if (res.success) { setAlertTitle(''); setAlertMessage(''); setAlertZona(''); setShowAlertForm(false) }
    })
  }

  const handleDeleteAlert = (id: number) => {
    startTransition(async () => {
      showMsg(await deleteAlertAction(id))
    })
  }



  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bell size={22} className="text-red-500" />
            Gestión de Alertas
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Publica alertas de emergencia para los ciudadanos.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Feedback */}
        {feedback && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {feedback.text}
          </div>
        )}

        {/* ── ALERTS TAB ── */}
        <div className="space-y-4">
          {/* Botón nuevo */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowAlertForm(!showAlertForm)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
              >
                <Plus size={16} /> Nueva Alerta
              </button>
            </div>

            {/* Formulario nueva alerta */}
            {showAlertForm && (
              <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><Bell size={16} className="text-red-500" /> Crear nueva alerta</h3>
                  <button onClick={() => setShowAlertForm(false)}><X size={18} className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                <input value={alertTitle} onChange={(e) => setAlertTitle(e.target.value)} placeholder="Título de la alerta*" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-slate-50 text-slate-900 placeholder:text-slate-400" />
                <textarea value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} placeholder="Mensaje de la alerta*" rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-slate-50 resize-none text-slate-900 placeholder:text-slate-400" />
                <input value={alertZona} onChange={(e) => setAlertZona(e.target.value)} placeholder="Zona afectada (opcional)" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-slate-50 text-slate-900 placeholder:text-slate-400" />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAlertForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
                  <button onClick={handleCreateAlert} disabled={isPending || !alertTitle.trim() || !alertMessage.trim()} className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-60">
                    <Bell size={14} /> {isPending ? 'Publicando...' : 'Publicar Alerta'}
                  </button>
                </div>
              </div>
            )}

            {/* Lista de alertas */}
            {initialAlerts.length === 0 && !showAlertForm && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Bell size={40} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No hay alertas publicadas.</p>
              </div>
            )}
            {initialAlerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-2xl border-l-4 border-l-red-400 border border-slate-200 shadow-sm px-6 py-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <Bell size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 text-sm">{alert.title}</p>
                    {alert.zona && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{alert.zona}</span>}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1"><Clock size={11} /> {formatDate(alert.sentAt)}</p>
                </div>
                <button onClick={() => handleDeleteAlert(alert.id)} disabled={isPending} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
      </div>
    </div>
  )
}
