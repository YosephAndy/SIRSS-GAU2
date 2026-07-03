import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const zones = await prisma.zone.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(zones)
  } catch (error) {
    console.error('Error en GET /api/zones:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}