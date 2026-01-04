const fs = require('fs')
const path = require('path')

// Note: public/uploads is no longer copied since images are stored in Tencent COS
// Only copy prisma folder (database) for production
const prismaSource = path.join(__dirname, 'prisma')
const prismaDest = path.join(__dirname, '.next', 'standalone', 'prisma')

try {
  fs.cpSync(prismaSource, prismaDest, { recursive: true })
  console.log('✅ Prisma folder copied to standalone directory')
} catch (error) {
  console.error('❌ Failed to copy prisma folder:', error.message)
  process.exit(1)
}
