import { NextRequest, NextResponse } from 'next/server'
import { getAllSchedules, getSchedulesByZone } from '@/features/schedules/services/schedule.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const zonaParam = searchParams.get('zona') || searchParams.get('zoneId')
    const search = searchParams.get('search')

    if (zonaParam) {
      const schedules = await getSchedulesByZone(zonaParam)
      return NextResponse.json(schedules)
    }

    if (search) {
      const allSchedules = await getAllSchedules()
      const filtered = allSchedules.filter(s =>
        s.zoneName?.toLowerCase().includes(search.toLowerCase()) ||
        s.originPoint.toLowerCase().includes(search.toLowerCase()) ||
        s.destinationPoint.toLowerCase().includes(search.toLowerCase()) ||
        s.observations?.toLowerCase().includes(search.toLowerCase())
      )
      return NextResponse.json(filtered)
    }

    const schedules = await getAllSchedules()
    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error en GET /api/schedules:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}