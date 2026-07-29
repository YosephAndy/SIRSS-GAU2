import React from 'react'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { CollectionPointsClient } from '@/features/schedules/components/collection-points-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Puntos de Recolección | CleanCity',
  description: 'Mapa global de todos los puntos de recolección de residuos.',
}

export default async function CollectionPointsPage() {
  const schedules = await prisma.schedule.findMany({
    include: {
      waypoints: true,
      route: {
        include: { zone: true }
      }
    }
  })

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      <div className="bg-white border-b border-slate-200 pt-12 pb-16 px-4 relative shadow-sm">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
            Puntos de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Recolección
            </span>
          </h1>
          <p className="text-slate-500 text-base max-w-2xl mx-auto mb-8 font-medium">
            Visualiza todos los puntos donde nuestros camiones hacen paradas programadas.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 mt-8">
        <CollectionPointsClient schedules={schedules} />
      </div>
    </div>
  )
}
