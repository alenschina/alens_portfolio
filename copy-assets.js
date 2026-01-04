const fs = require('fs')
const path = require('path')

const distDir = path.join(__dirname, '.next', 'standalone')

// Copy prisma folder (database)
const prismaSource = path.join(__dirname, 'prisma')
const prismaDest = path.join(distDir, 'prisma')

try {
  fs.cpSync(prismaSource, prismaDest, { recursive: true })
  console.log('✅ Prisma folder copied')
} catch (error) {
  console.error('❌ Failed to copy prisma folder:', error.message)
  process.exit(1)
}

// Ensure .env file exists in standalone directory (for production, use environment variables)
const envSource = path.join(__dirname, '.env')
const envDest = path.join(distDir, '.env')
if (fs.existsSync(envSource)) {
  try {
    fs.copyFileSync(envSource, envDest)
    console.log('✅ .env file copied')
  } catch (error) {
    console.warn('⚠️  Failed to copy .env file (may already exist or be in use):', error.message)
  }
}
