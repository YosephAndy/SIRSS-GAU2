'use client'

import React, { useState, useMemo } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/utils/fetcher'
import { Map, Search } from 'lucide-react'
import type { ZoneRecord } from '@/features/zones/types/zone.types'
import type { ScheduleWithZone } from '@/features/schedules/types/schedule.types'

export default function MonitoringMap() {
  const [zoneId, setZoneId] = useState<string>('')
  const [streetQuery, setStreetQuery] = useState<string>('')

  const { data: zones, error: zonesError } = useSWR<ZoneRecord[]>('/api/zones', fetcher)

  const params = useMemo(() => {
    const p = new URLSearchParams()
    if (zoneId) p.append('zoneId', zoneId)
    if (streetQuery.trim()) p.append('streetName', streetQuery.trim())
    return p.toString() ? `?${p.toString()}` : ''
  }, [zoneId, streetQuery])

  const { data: schedules, error: schedulesError } = useSWR<ScheduleWithZone[]>(`/api/schedules${params}`, fetcher)

  if (zonesError || schedulesError) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-2xl">Error cargando datos del mapa.</div>
    )
  }

  const selectedZone = zones?.find((z: ZoneRecord) => String(z.id) === zoneId)

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              placeholder="Buscar por calle (ej. Av. Principal)"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#7dd3fc] outline-none"
              value={streetQuery}
              onChange={(e) => setStreetQuery(e.target.value)}
            />
          </div>

          <div className="w-72 relative">
            <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#7dd3fc] outline-none appearance-none"
            >
              <option value="">Todas las zonas</option>
              {zones?.map((z: ZoneRecord) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map area (placeholder) */}
      <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 shadow-inner h-[520px] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <div className="mb-4">
              <Map size={48} />
            </div>
            {selectedZone ? (
              <>
                <h3 className="text-2xl font-bold text-slate-800">{selectedZone.name}</h3>
                <p className="text-slate-600 max-w-xl">{selectedZone.description || 'Zona seleccionada'}</p>
              </>
            ) : (
              <p className="text-lg">Selecciona una zona o busca una calle para ver información en el mapa.</p>
            )}
          </div>
        </div>

        {/* Floating info card */}
        <div className="absolute top-6 right-6 bg-white p-4 rounded-2xl shadow-md border border-slate-100 w-80">
          <h4 className="font-bold text-slate-800">Información de la zona</h4>
          {selectedZone ? (
            <div className="mt-2 text-sm text-slate-700">
              <div className="mb-2">Nombre: <strong>{selectedZone.name}</strong></div>
              <div className="mb-2">Color: <span className="inline-block w-4 h-4 align-middle rounded-sm" style={{ backgroundColor: selectedZone.color || '#86efac' }}></span></div>
              <div className="mb-2">Calles encontradas: <strong>{schedules?.length ?? 0}</strong></div>
              <div className="mt-2">
                <a href="#" className="text-sm text-blue-600">Ver más detalles</a>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-slate-600">Sin zona seleccionada. Puedes explorar buscando una calle o eligiendo una zona.</div>
          )}
        </div>
      </div>
    </div>
  )
}
