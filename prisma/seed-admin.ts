import { config } from 'dotenv'
config({ path: '.env' })

import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL environment variable')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl),
})

async function main() {
  const email = 'admin@sirss-gau.com'
  const password = 'Admin123!'
  const name = 'Administrador SIRSS'

  // Obtener el rol ADMIN
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } })
  if (!adminRole) {
    throw new Error('Rol ADMIN no encontrado. Ejecuta primero: npx prisma db seed')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, name, roleId: adminRole.id },
    create: {
      email,
      password: hashedPassword,
      name,
      roleId: adminRole.id,
    },
  })

  console.log('✅ Usuario administrador creado/actualizado:')
  console.log(`   📧 Email:    ${email}`)
  console.log(`   🔑 Password: ${password}`)
  console.log(`   👤 Nombre:   ${user.name}`)
  console.log(`   🎭 Rol:      ADMIN`)
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error('Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
