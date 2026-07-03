'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { Map, Layers, Info, MapPin, X } from 'lucide-react'
import type { ZoneRecord } from '../types/zone.types'

const ZonesMap = dynamic(() => import('./zones-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full animate-pulse bg-slate-200 rounded-2xl flex items-center justify-center">
      <span className="text-slate-500 font-medium">Cargando mapa...</span>
    </div>
  ),
})

interface AdminZonesClientProps {
  initialZones: ZoneRecord[]
}

const ZONE_COLORS: Record<string, string> = {
  'ZONA 01': '#3b82f6',
  'ZONA 02': '#10b981',
  'ZONA 03': '#f59e0b',
  'ZONA 04': '#ef4444',
  'ZONA 05': '#8b5cf6',
}

const DEFAULT_ZONES: ZoneRecord[] = [
  { id: 1, name: 'ZONA 01', description: 'Zona centro histórico', color: '#3b82f6' },
  { id: 2, name: 'ZONA 02', description: 'Zona norte', color: '#10b981' },
  { id: 3, name: 'ZONA 03', description: 'Zona sur', color: '#f59e0b' },
  { id: 4, name: 'ZONA 04', description: 'Zona este', color: '#ef4444' },
  { id: 5, name: 'ZONA 05', description: 'Zona oeste', color: '#8b5cf6' },
]

export function AdminZonesClient({ initialZones }: AdminZonesClientProps) {
  const [selectedZone, setSelectedZone] = useState<number | null>(null)
  const [filterText, setFilterText] = useState('')

  const zones = initialZones.length > 0 ? initialZones : DEFAULT_ZONES
  const selectedZoneData = zones.find(z => z.id === selectedZone)

  const filteredZones = filterText
    ? zones.filter(z => z.name.toLowerCase().includes(filterText.toLowerCase()))
    : zones

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Gestión de Zonas</h1>
              <p className="text-slate-600 text-sm mt-1">Administra las zonas de recolección de residuos</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <Layers size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Zonas</p>
                <p className="text-3xl font-bold text-slate-900 mt-0.5">{zones.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                <Map size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Zonas Activas</p>
                <p className="text-3xl font-bold text-slate-900 mt-0.5">{zones.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                <Info size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Zona Seleccionada</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5 truncate">
                  {selectedZoneData?.name || 'Ninguna'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Mapa de Zonas</h2>
          <ZonesMap zones={zones} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">Listado de Zonas</h2>
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
              <MapPin size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar zona..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="flex-1 text-sm text-slate-900 bg-transparent outline-none placeholder:text-slate-400"
              />
              {filterText && (
                <button 
                  onClick={() => setFilterText('')} 
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-sm font-semibold">
                <th className="py-3.5 px-5">Color</th>
                <th className="py-3.5 px-5">ID</th>
                <th className="py-3.5 px-5">Nombre</th>
                <th className="py-3.5 px-5">Descripción</th>
                <th className="py-3.5 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredZones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No se encontraron zonas registradas.
                  </td>
                </tr>
              ) : (
                filteredZones.map((zone) => (
                  <tr
                    key={zone.id}
                    className={`border-b border-slate-100 text-sm text-slate-800 transition-colors cursor-pointer ${
                      selectedZone === zone.id ? 'bg-blue-50 border-blue-100' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                  >
                    <td className="py-4 px-5">
                      <div
                        className="w-7 h-7 rounded-md shadow-sm"
                        style={{ backgroundColor: ZONE_COLORS[zone.name.toUpperCase()] || '#6b7280' }}
                      />
                    </td>
                    <td className="py-4 px-5 font-medium">{zone.id}</td>
                    <td className="py-4 px-5 font-semibold text-slate-900">{zone.name}</td>
                    <td className="py-4 px-5 text-slate-600">
                      {zone.description || 'Zona de recolección'}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedZone(selectedZone === zone.id ? null : zone.id)
                        }}
                        className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                      >
                        Ver en mapa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
