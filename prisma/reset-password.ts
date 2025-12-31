import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'admin@alens.com'
  const newPassword = process.argv[3] || 'admin123'

  console.log(`Resetting password for: ${email}`)

  const passwordHash = bcrypt.hashSync(newPassword, 10)

  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash }
  })

  console.log(`Password reset successfully for: ${user.email}`)
  console.log(`New password: ${newPassword}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
