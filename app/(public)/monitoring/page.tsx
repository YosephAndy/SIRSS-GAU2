import React from 'react'
import MonitoringMap from '@/features/monitoring/components/monitoring-map'

export const metadata = {
  title: 'Monitoreo en Tiempo Real | CleanCity',
  description: 'Monitoreo y búsqueda de rutas de recolección por calles o zonas de Cusco.',
}

export default function MonitoringPage() {
  return (
    <main className="w-full min-h-[70vh] py-12">
      <div className="max-w-[1200px] mx-auto px-4">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">Monitoreo en Mapa</h1>
          <p className="text-slate-600">Busca tu calle o selecciona una zona para simular la visualización en el mapa.</p>
        </header>
        <MonitoringMap />
      </div>
    </main>
  )
}
