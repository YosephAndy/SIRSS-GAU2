import { PrismaClient } from '../app/generated/prisma/client'


import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaAdapter = () => {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL environment variable for Prisma adapter')
  }
  return new PrismaPg(databaseUrl)
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: createPrismaAdapter(),
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}