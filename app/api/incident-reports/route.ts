import { NextRequest, NextResponse } from 'next/server'
import { incidentReportSchema } from '@/features/incidents/schemas/incident-report.schema'
import type { ApiResponse } from '@/types/api-response'

type IncidentReportResponse = ApiResponse<{
  type: string
  location: string
  description: string
  photo?: string
}>

export async function POST(request: NextRequest): Promise<NextResponse<IncidentReportResponse>> {
  try {
    const formData = await request.formData()
    const payload = {
      type: formData.get('type'),
      location: formData.get('location'),
      description: formData.get('description'),
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

    const photo = formData.get('photo')
    if (photo instanceof File && photo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: 'La imagen debe pesar menos de 5 MB',
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    // Aquí podríamos guardar el reporte en la base de datos o en un servicio externo.
    // Por ahora aceptamos el formulario como validado y devolvemos un resultado de éxito.

    return NextResponse.json({
      success: true,
      data: {
        ...validation.data,
        photo: photo instanceof File ? photo.name : undefined,
      },
    })
  } catch (error) {
    console.error('Error en /api/incident-reports:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno al enviar el reporte',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
