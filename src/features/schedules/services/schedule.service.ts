import { prisma } from '@/lib/prisma'

export type FlatSchedule = {
  id: number
  zoneId: number | null
  zoneName: string | null
  routeId: number
  shift: string
  routeType: string
  scheduleId: number
  days: string[]
  departureTime: string | null
  arrivalTime: string | null
  waypointId: number
  sequence: number
  originPoint: string
  destinationPoint: string
  waypointDepartureTime: string | null
  waypointArrivalTime: string | null
  hasCampanio: boolean
  observations: string | null
  originalId: number
  lat: number | null
  lng: number | null
}

function waypointToFlatSchedule(
  waypoint: {
    id: number
    scheduleId: number
    sequence: number
    originPoint: string
    destinationPoint: string
    departureTime: string | null
    arrivalTime: string | null
    hasCampanio: boolean
    observations: string | null
    originalId: number
    lat: number | null
    lng: number | null
  },
  schedule: {
    id: number
    days: string[]
    departureTime: string | null
    arrivalTime: string | null
    route: {
      id: number
      zoneId: number | null
      shift: string
      type: string
      zone: { name: string } | null
    }
  }
): FlatSchedule {
  return {
    id: waypoint.id,
    zoneId: schedule.route.zoneId,
    zoneName: schedule.route.zone?.name || null,
    routeId: schedule.route.id,
    shift: schedule.route.shift,
    routeType: schedule.route.type,
    scheduleId: schedule.id,
    days: schedule.days,
    departureTime: schedule.departureTime,
    arrivalTime: schedule.arrivalTime,
    waypointId: waypoint.id,
    sequence: waypoint.sequence,
    originPoint: waypoint.originPoint,
    destinationPoint: waypoint.destinationPoint,
    waypointDepartureTime: waypoint.departureTime,
    waypointArrivalTime: waypoint.arrivalTime,
    hasCampanio: waypoint.hasCampanio,
    observations: waypoint.observations,
    originalId: waypoint.originalId,
    lat: waypoint.lat ?? null,
    lng: waypoint.lng ?? null,
  }
}

export async function getAllSchedules(): Promise<FlatSchedule[]> {
  const schedules = await prisma.schedule.findMany({
    include: {
      route: {
        include: {
          zone: true,
        },
      },
      waypoints: {
        orderBy: { sequence: 'asc' },
      },
    },
    orderBy: { id: 'asc' },
  })

  const flatSchedules: FlatSchedule[] = []

  for (const schedule of schedules) {
    for (const waypoint of schedule.waypoints) {
      flatSchedules.push(waypointToFlatSchedule(waypoint, schedule))
    }
  }

  return flatSchedules
}

export async function getSchedulesByZone(zoneName: string): Promise<FlatSchedule[]> {
  const schedules = await prisma.schedule.findMany({
    where: {
      route: {
        zone: {
          name: zoneName,
        },
      },
    },
    include: {
      route: {
        include: {
          zone: true,
        },
      },
      waypoints: {
        orderBy: { sequence: 'asc' },
      },
    },
  })

  const flatSchedules: FlatSchedule[] = []

  for (const schedule of schedules) {
    for (const waypoint of schedule.waypoints) {
      flatSchedules.push(waypointToFlatSchedule(waypoint, schedule))
    }
  }

  return flatSchedules
}

export async function createSchedule(data: {
  zoneId?: number | null
  zoneName?: string
  shift: string
  routeType: string
  days: string[]
  originPoint: string
  destinationPoint: string
  departureTime: string
  arrivalTime: string
  hasCampanio: boolean
  observations?: string | null
}): Promise<FlatSchedule> {
  let zone = data.zoneId
    ? await prisma.zone.findUnique({ where: { id: data.zoneId } })
    : data.zoneName
    ? await prisma.zone.findUnique({ where: { name: data.zoneName } })
    : null

  if (!zone && data.zoneName) {
    zone = await prisma.zone.create({
      data: { name: data.zoneName },
    })
  }

  const route = await prisma.route.create({
    data: {
      zoneId: zone?.id || null,
      shift: data.shift as 'MANANA' | 'TARDE' | 'NOCHE' | 'DOMINGO',
      type: data.routeType as 'NORMAL' | 'REPECHAJE' | 'FURGON' | 'TURNO_DOMINICAL' | 'TURNO_NOCHE',
    },
  })

  const schedule = await prisma.schedule.create({
    data: {
      routeId: route.id,
      days: data.days as ('LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO')[],
      departureTime: data.departureTime,
      arrivalTime: data.arrivalTime,
    },
  })

  const waypoint = await prisma.waypoint.create({
    data: {
      scheduleId: schedule.id,
      sequence: 1,
      originPoint: data.originPoint,
      destinationPoint: data.destinationPoint,
      departureTime: data.departureTime,
      arrivalTime: data.arrivalTime,
      hasCampanio: data.hasCampanio,
      observations: data.observations,
      originalId: 0,
    },
  })

  const fullSchedule = await prisma.schedule.findUnique({
    where: { id: schedule.id },
    include: {
      route: {
        include: {
          zone: true,
        },
      },
      waypoints: {
        where: { id: waypoint.id },
      },
    },
  })

  return waypointToFlatSchedule(waypoint, fullSchedule!)
}

export async function deleteSchedule(id: number) {
  return prisma.waypoint.delete({
    where: { id },
  })
}

export async function updateSchedule(id: number, data: {
  zoneName?: string
  shift?: string
  routeType?: string
  days?: string[]
  originPoint?: string
  destinationPoint?: string
  departureTime?: string
  arrivalTime?: string
  hasCampanio?: boolean
  observations?: string | null
}): Promise<FlatSchedule> {
  const waypoint = await prisma.waypoint.findUnique({
    where: { id },
    include: {
      schedule: {
        include: { route: { include: { zone: true } } },
      },
    },
  })

  if (!waypoint) {
    throw new Error('Waypoint no encontrado')
  }

  if (data.zoneName) {
    let zone = await prisma.zone.findUnique({ where: { name: data.zoneName } })
    if (!zone) {
      zone = await prisma.zone.create({ data: { name: data.zoneName } })
    }
    await prisma.route.update({
      where: { id: waypoint.schedule.routeId },
      data: { zoneId: zone.id },
    })
  }

  if (data.shift || data.routeType) {
    await prisma.route.update({
      where: { id: waypoint.schedule.routeId },
      data: {
        shift: data.shift as 'MANANA' | 'TARDE' | 'NOCHE' | 'DOMINGO' | undefined,
        type: data.routeType as 'NORMAL' | 'REPECHAJE' | 'FURGON' | 'TURNO_DOMINICAL' | 'TURNO_NOCHE' | undefined,
      },
    })
  }

  if (data.days) {
    await prisma.schedule.update({
      where: { id: waypoint.scheduleId },
      data: {
        days: data.days as ('LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO')[],
        departureTime: data.departureTime || undefined,
        arrivalTime: data.arrivalTime || undefined,
      },
    })
  }

  const updatedWaypoint = await prisma.waypoint.update({
    where: { id },
    data: {
      originPoint: data.originPoint || undefined,
      destinationPoint: data.destinationPoint || undefined,
      departureTime: data.departureTime || undefined,
      arrivalTime: data.arrivalTime || undefined,
      hasCampanio: data.hasCampanio !== undefined ? data.hasCampanio : undefined,
      observations: data.observations !== undefined ? data.observations : undefined,
    },
  })

  const fullSchedule = await prisma.schedule.findUnique({
    where: { id: waypoint.scheduleId },
    include: {
      route: {
        include: {
          zone: true,
        },
      },
      waypoints: {
        where: { id: updatedWaypoint.id },
      },
    },
  })

  return waypointToFlatSchedule(updatedWaypoint, fullSchedule!)
}

export async function updateSchedulesSequence(updates: { id: number; sequence: number }[]) {
  // Usar transacción para actualizar todas las secuencias al mismo tiempo
  await prisma.$transaction(
    updates.map((update) => 
      prisma.waypoint.update({
        where: { id: update.id },
        data: { sequence: update.sequence },
      })
    )
  )
  return { success: true }
}

export async function updateWaypointCoords(updates: { id: number; lat: number; lng: number }[]) {
  await prisma.$transaction(
    updates.map((u) =>
      prisma.waypoint.update({
        where: { id: u.id },
        data: { lat: u.lat, lng: u.lng },
      })
    )
  )
  return { success: true }
}

export async function getAllZones() {
  return prisma.zone.findMany({
    orderBy: { name: 'asc' },
  })
}