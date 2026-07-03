import 'dotenv/config'
import { prisma } from '../lib/prisma'
import fs from 'fs'
import path from 'path'

type CSVRow = {
  id: number
  zona: string
  turno: string
  dias: string
  orden: number
  punto_salida: string
  punto_llegada: string
  hora_salida: string
  hora_llegada: string
  campaneo: number
  observaciones: string | null
}

function parseCSV(text: string): CSVRow[] {
  const lines = text.split('\n').filter(l => l.trim() !== '')
  const result: CSVRow[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    let cols: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        cols.push(current)
        current = ''
      } else {
        current += char
      }
    }
    cols.push(current)
    
    if (cols.length < 10) continue
    
    result.push({
      id: parseInt(cols[0]) || i,
      zona: cols[1]?.trim() || '',
      turno: cols[2]?.trim() || '',
      dias: cols[3]?.trim() || '',
      orden: parseInt(cols[4]) || 1,
      punto_salida: cols[5]?.trim() || '',
      punto_llegada: cols[6]?.trim() || '',
      hora_salida: cols[7]?.trim() || '',
      hora_llegada: cols[8]?.trim() || '',
      campaneo: parseInt(cols[9]) || 0,
      observaciones: cols[10]?.trim() || null
    })
  }
  
  return result
}

function determineRouteType(zona: string, turno: string): { type: string, zoneName: string | null } {
  if (zona.startsWith('ZONA ')) {
    return { type: 'NORMAL', zoneName: zona }
  }
  
  switch (zona) {
    case 'REPECHAJE':
      return { type: 'REPECHAJE', zoneName: null }
    case 'FURGON':
      return { type: 'FURGON', zoneName: null }
    case 'TURNO DOMINICAL':
      return { type: 'TURNO_DOMINICAL', zoneName: null }
    case 'TURNO NOCHE':
      return { type: 'TURNO_NOCHE', zoneName: null }
    case 'TURNO TARDE':
      return { type: 'NORMAL', zoneName: null }
    default:
      return { type: 'NORMAL', zoneName: zona }
  }
}

function determineShift(turno: string): string {
  switch (turno.toUpperCase()) {
    case 'MAÑANA':
      return 'MANANA'
    case 'TARDE':
      return 'TARDE'
    case 'NOCHE':
      return 'NOCHE'
    case 'DOMINGO':
      return 'DOMINGO'
    default:
      return 'MANANA'
  }
}

function parseDays(diasStr: string): string[] {
  const dayMap: Record<string, string> = {
    'LUNES': 'LUNES',
    'MARTES': 'MARTES',
    'MIERCOLES': 'MIERCOLES',
    'JUEVES': 'JUEVES',
    'VIERNES': 'VIERNES',
    'SABADO': 'SABADO',
    'DOMINGO': 'DOMINGO'
  }
  
  const normalized = diasStr.toUpperCase().replace(/ /g, '')
  const dayList: string[] = []
  
  Object.keys(dayMap).forEach(day => {
    if (normalized.includes(day)) {
      dayList.push(day)
    }
  })
  
  return dayList.length > 0 ? dayList : []
}

async function main() {
  console.log('Iniciando normalización de datos...\n')
  
  console.log('1. Limpiando tablas normalizadas...')
  await prisma.waypoint.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.route.deleteMany()
  await prisma.zone.deleteMany()
  console.log('   Tablas limpiadas.\n')
  
  const filePath = path.join(process.cwd(), 'dataset.csv')
  if (!fs.existsSync(filePath)) {
    console.error(`Archivo no encontrado: ${filePath}`)
    process.exit(1)
  }
  
  const content = fs.readFileSync(filePath, 'utf-8')
  const rows = parseCSV(content)
  
  console.log(`2. Leídas ${rows.length} filas del CSV.\n`)
  
  const zonesMap = new Map<string, number>()
  const routesMap = new Map<string, number>()
  const schedulesMap = new Map<string, number>()
  
  console.log('3. Creando Zonas...')
  const uniqueZones = [...new Set(rows.map(r => {
    const { zoneName } = determineRouteType(r.zona, r.turno)
    return zoneName || r.zona
  }))]
  
  for (const zoneName of uniqueZones) {
    if (!zoneName) continue
    const zone = await prisma.zone.create({
      data: { name: zoneName }
    })
    zonesMap.set(zoneName, zone.id)
    console.log(`   Zona creada: ${zoneName}`)
  }
  console.log(`   Total: ${zonesMap.size} zonas\n`)
  
  console.log('4. Creando Routes, Schedules y Waypoints...')
  
  const groupedByRoute = new Map<string, CSVRow[]>()
  
  for (const row of rows) {
    const { type, zoneName } = determineRouteType(row.zona, row.turno)
    const shift = determineShift(row.turno)
    const routeKey = `${zoneName || row.zona}|${shift}|${type}`
    
    if (!groupedByRoute.has(routeKey)) {
      groupedByRoute.set(routeKey, [])
    }
    groupedByRoute.get(routeKey)!.push(row)
  }
  
  let routeCount = 0
  let scheduleCount = 0
  let waypointCount = 0
  
  for (const [routeKey, routeRows] of groupedByRoute) {
    const [zoneName, shift, type] = routeKey.split('|')
    
    const route = await prisma.route.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {
        zoneId: zonesMap.get(zoneName) ?? undefined,
        shift: shift,
        type: type,
      } as any
    })
    routeCount++
    
    const groupedByDays = new Map<string, CSVRow[]>()
    for (const row of routeRows) {
      const daysKey = row.dias
      if (!groupedByDays.has(daysKey)) {
        groupedByDays.set(daysKey, [])
      }
      groupedByDays.get(daysKey)!.push(row)
    }
    
    for (const [daysStr, dayRows] of groupedByDays) {
      const days = parseDays(daysStr)
      const zoneNameForSchedule = days.length === 0 ? daysStr : null
      
      const sortedRows = dayRows.sort((a, b) => a.orden - b.orden)
      const departureTime = sortedRows[0]?.hora_salida || null
      const arrivalTime = sortedRows[sortedRows.length - 1]?.hora_llegada || null
      
      const schedule = await prisma.schedule.create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: {
          routeId: route.id,
          days: days as any,
          departureTime,
          arrivalTime,
          zoneName: zoneNameForSchedule
        } as any
      })
      scheduleCount++
      
      for (const row of sortedRows) {
        await prisma.waypoint.create({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: {
            scheduleId: schedule.id,
            sequence: row.orden,
            originPoint: row.punto_salida,
            destinationPoint: row.punto_llegada,
            departureTime: row.hora_salida || null,
            arrivalTime: row.hora_llegada || null,
            hasCampanio: row.campaneo === 1,
            observations: row.observaciones,
            originalId: row.id
          } as any
        })
        waypointCount++
      }
    }
  }
  
  console.log(`   Routes creados: ${routeCount}`)
  console.log(`   Schedules creados: ${scheduleCount}`)
  console.log(`   Waypoints creados: ${waypointCount}\n`)
  
  console.log('5. Resumen de datos normalizados:')
  console.log(`   - ${zonesMap.size} Zonas`)
  console.log(`   - ${routeCount} Routes`)
  console.log(`   - ${scheduleCount} Schedules`)
  console.log(`   - ${waypointCount} Waypoints`)
  console.log(`   - ${rows.length} Filas originales procesadas\n`)
  
  console.log('Normalización completada con éxito!')
}

main()
  .catch(e => {
    console.error('Error durante la normalización:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })