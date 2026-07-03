import { NextRequest, NextResponse } from 'next/server'
import { incidentReportSchema } from '@/features/incidents/schemas/incident-report.schema'
import { createIncidentReport } from '@/features/incidents/services/incident.service'
import type { ApiResponse } from '@/types/api-response'

type IncidentResponse = ApiResponse<{
  id: number
  title: string
  type: string
  description: string
  createdAt: string
}>

export async function POST(request: NextRequest): Promise<NextResponse<IncidentResponse>> {
  try {
    const formData = await request.formData()
    const photoEntry = formData.get('photo')
    const isFile = photoEntry instanceof File

    const payload = {
      type: formData.get('type'),
      location: formData.get('location'),
      description: formData.get('description'),
      photoName: isFile ? photoEntry.name : undefined,
      photoType: isFile ? photoEntry.type : undefined,
    }

    const validation = incidentReportSchema.safeParse(payload)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de formulario inválidos',
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    const incident = await createIncidentReport(validation.data)

    return NextResponse.json({
      success: true,
      data: {
        id: incident.id,
        title: incident.title,
        type: incident.type,
        description: incident.description,
        createdAt: incident.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error en /api/incidents:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno al guardar el incidente',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
