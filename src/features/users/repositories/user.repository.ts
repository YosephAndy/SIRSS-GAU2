import { prisma } from '@/lib/prisma'
import type { CreateUserInput, User } from '@/features/users/types'
import type { Prisma } from '../../../../app/generated/prisma/client'



export type UserWithPassword = User & { password: string }

export const userRepository = {
  async findByEmail(email: string): Promise<UserWithPassword | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true },
    }) as Promise<UserWithPassword | null>
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    }) as Promise<User | null>
  },

  async create(data: CreateUserInput): Promise<User> {
    // Buscar el rol ADMIN que creaste
    const adminRole = await prisma.role.findUnique({
      where: { name: 'ADMIN' },
    })

    if (!adminRole) {
      throw new Error('El rol ADMIN no existe en la base de datos. Créalo en Prisma Studio primero.')
    }

    return prisma.user.create({
      data: {
        name: data.name ?? '',
        email: data.email,
        password: data.password,
        roleId: adminRole.id, // Asignamos el rol ADMIN por defecto
      },
    }) as Promise<User>
  },

  async update(
    id: string,
    data: Prisma.UserUpdateInput
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    }) as Promise<User>
  },

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    }) as Promise<User>
  },

  async findAll(): Promise<User[]> {
    return prisma.user.findMany() as Promise<User[]>
  },
}
