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
    const roleName = data.roleName || 'CITIZEN'
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    })

    if (!role) {
      throw new Error(`El rol ${roleName} no existe en la base de datos.`)
    }

    const user = await prisma.user.create({
      data: {
        name: data.name ?? '',
        email: data.email,
        password: data.password,
        roleId: role.id,
      },
    }) as User

    if (roleName === 'DRIVER') {
      await prisma.driverProfile.create({
        data: {
          userId: user.id,
          licensePlate: 'PENDIENTE',
          phone: 'PENDIENTE',
        },
      })
    }

    return user
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
