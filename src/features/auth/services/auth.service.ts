import bcrypt from 'bcrypt'
import { userRepository, type UserWithPassword } from '@/features/users/repositories/user.repository'
import { CreateUserInput } from '@/features/users/types'

const SALT_ROUNDS = 10

export const authService = {
  async register(data: CreateUserInput) {
    // Verificar si usuario ya existe
    const existingUser = await userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new Error('Este email ya está registrado')
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(
      data.password,
      SALT_ROUNDS
    )

    // Crear usuario
    return userRepository.create({
      ...data,
      password: hashedPassword,
    })
  },

  async validateCredentials(email: string, password: string) {
    const user = await userRepository.findByEmail(email)
    if (!user) {
      throw new Error('Usuario o contraseña inválidos')
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    )
    if (!isPasswordValid) {
      throw new Error('Usuario o contraseña inválidos')
    }

    // No retornar la contraseña
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  },
}
