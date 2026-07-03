import { prisma } from '@/lib/prisma'
import type { ZoneRecord } from '../types/zone.types'

export async function getAllZones(): Promise<ZoneRecord[]> {
  const zones = await prisma.zone.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { routes: true },
      },
    },
  })

  return zones.map((z) => ({
    id: z.id,
    name: z.name,
    description: `Zona de recolección ${z.name}`,
    color: undefined,
    routeCount: z._count.routes,
  }))
}

export async function getZoneById(id: number) {
  return prisma.zone.findUnique({
    where: { id },
    include: {
      routes: true,
    },
  })
}

export async function getZoneByName(name: string) {
  return prisma.zone.findUnique({
    where: { name },
  })
}