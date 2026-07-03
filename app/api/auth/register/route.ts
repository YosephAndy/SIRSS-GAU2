import { baseRegisterSchema } from '@/features/auth/schemas/auth-schemas'

import { authService } from '@/features/auth/services/auth.service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos con Zod
    const { email, password, name } = await baseRegisterSchema.parseAsync(body)

    // Registrar usuario
    await authService.register({
      email,
      password,
      name,
    })

    return NextResponse.json(
      { message: 'Usuario registrado exitosamente' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)

    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { message: 'Este email ya está registrado' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}