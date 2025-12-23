const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function main() {
  const prisma = new PrismaClient()
  try {
    const passwordHash = await bcrypt.hash('123456', 10)
    await prisma.user.upsert({
      where: { email: 'admin@mercadinho.com' },
      update: { passwordHash },
      create: {
        name: 'Administrador',
        email: 'admin@mercadinho.com',
        passwordHash,
        role: 'ADMIN'
      }
    })
    console.log('✅ admin@mercadinho.com upserted')
  } catch (e) {
    console.error('❌ Falha ao upsert admin:', e)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()