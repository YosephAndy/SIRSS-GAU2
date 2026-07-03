import React from 'react'

export function CitizenDashboardScreen() {
  return (
    <div className="p-8 bg-zinc-50 min-h-screen font-sans dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Portal Ciudadano</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Monitoreo ambiental y reporte de incidencias en el Cusco</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Environmental Incident Report form */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
          <h2 className="text-lg font-bold mb-2">Reportar Incidencia Ambiental</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Informa de forma anónima sobre cúmulos de residuos o contaminación en la vía pública.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Zona o Punto Referencial</label>
              <input type="text" placeholder="Ej. Frente al Mercado de San Pedro" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Tipo de Incidencia</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-50">
                <option>Residuos Acumulados</option>
                <option>Contenedor Dañado</option>
                <option>Fuga de Líquidos Contaminantes</option>
                <option>Horario Incumplido</option>
              </select>
            </div>
            <button className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 py-3 rounded-xl font-semibold transition-colors text-sm">
              Enviar Reporte Anónimo
            </button>
          </div>
        </div>

        {/* Schedule & Monitoring status */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-2">Próxima Recolección en tu Zona</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Ingresa tu dirección para ver el cronograma y alertar sobre retrasos.</p>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-4">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500"></span>
              <div>
                <p className="text-sm font-semibold">Hoy: 08:00 PM - 10:00 PM</p>
                <p className="text-xs text-zinc-500 mt-1">Ruta Regular - Sector Histórico Central</p>
              </div>
            </div>
          </div>
          <div className="mt-6 aspect-[21/9] bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-700">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Mapa Ciudadano de Recolección en Vivo...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
