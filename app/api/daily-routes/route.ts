import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const driverId = searchParams.get('driverId')
    const dateStr = searchParams.get('date')

    const whereClause: any = {}
    if (driverId) {
      whereClause.driverId = driverId
    }
    
    // Si se envía una fecha, filtramos por el inicio y fin del día
    if (dateStr) {
      const dateObj = new Date(dateStr)
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0))
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999))
      whereClause.date = {
        gte: startOfDay,
        lt: endOfDay,
      }
    } else if (searchParams.get('today') === 'true') {
      const now = new Date()
      const startOfDay = new Date(now.setHours(0, 0, 0, 0))
      const endOfDay = new Date(now.setHours(23, 59, 59, 999))
      whereClause.date = {
        gte: startOfDay,
        lt: endOfDay,
      }
    }

    const dailyRoutes = await prisma.dailyRoute.findMany({
      where: whereClause,
      include: {
        schedule: {
          include: {
            route: {
              include: {
                zone: true
              }
            },
            waypoints: true
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            driverProfile: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(dailyRoutes)
  } catch (error) {
    console.error('[DAILY_ROUTES_GET_ERROR]', error)
    return NextResponse.json({ success: false, message: 'Internal Error' }, { status: 500 })
  }
}
