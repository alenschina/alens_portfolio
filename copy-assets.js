const { execSync } = require('child_process')
const path = require('path')

const source = path.join(__dirname, 'public')
const dest = path.join(__dirname, '.next', 'standalone', 'public')

try {
  execSync(`cp -r "${source}" "${dest}"`, { stdio: 'inherit' })
  console.log('✅ Static assets copied to standalone directory')
} catch (error) {
  console.error('❌ Failed to copy static assets:', error.message)
  process.exit(1)
}
