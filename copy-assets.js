const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

// Copy public folder
const publicSource = path.join(__dirname, 'public')
const publicDest = path.join(__dirname, '.next', 'standalone', 'public')

try {
  execSync(`cp -r "${publicSource}" "${publicDest}"`, { stdio: 'inherit' })
  console.log('✅ Static assets copied to standalone directory')
} catch (error) {
  console.error('❌ Failed to copy static assets:', error.message)
  process.exit(1)
}

// Copy prisma folder (database)
const prismaSource = path.join(__dirname, 'prisma')
const prismaDest = path.join(__dirname, '.next', 'standalone', 'prisma')

try {
  fs.cpSync(prismaSource, prismaDest, { recursive: true })
  console.log('✅ Prisma folder copied to standalone directory')
} catch (error) {
  console.error('❌ Failed to copy prisma folder:', error.message)
  process.exit(1)
}
