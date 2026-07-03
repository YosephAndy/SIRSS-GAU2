import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL environment variable for Prisma adapter')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl),
})



async function main() {
  const roles = ['ADMIN', 'DRIVER', 'CITIZEN']

  console.log('Iniciando el sembrado de datos (seed)...')

  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    })
    console.log(`Rol verificado/creado: ${role.name}`)
  }

  console.log('Sembrado completado exitosamente.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error en el seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
