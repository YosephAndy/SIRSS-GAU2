import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (type === 'incidents') {
    const incidents = await prisma.incident.findMany({
      include: { citizen: { include: { user: true } }, driver: true },
      orderBy: { createdAt: 'desc' }
    })
    
    const csvContent = [
      ['ID', 'Titulo', 'Tipo', 'Estado', 'Zona', 'Reportado Por', 'Fecha'].join(','),
      ...incidents.map(i => [
        i.id,
        `"${i.title.replace(/"/g, '""')}"`,
        i.type,
        i.status,
        `"${i.zona || ''}"`,
        `"${i.citizen?.user.name || i.driver?.name || 'Sistema'}"`,
        i.createdAt.toISOString()
      ].join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="incidentes.csv"',
      }
    })
  }

  if (type === 'assignments') {
    const assignments = await prisma.routeAssignment.findMany({
      include: { driver: true, schedule: { include: { route: { include: { zone: true } } } } },
      orderBy: { date: 'desc' }
    })

    const csvContent = [
      ['ID', 'Conductor', 'Zona', 'Turno', 'Fecha', 'Estado'].join(','),
      ...assignments.map(a => [
        a.id,
        `"${a.driver.name}"`,
        `"${a.schedule.route.zone?.name || ''}"`,
        a.schedule.route.shift,
        a.date.toISOString().split('T')[0],
        a.status
      ].join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="asignaciones.csv"',
      }
    })
  }

  return NextResponse.json({ error: 'Tipo de exportación inválido' }, { status: 400 })
}
