module.exports = {
  apps: [{
    name: 'alens_portfolio',
    script: 'node',
    args: '.next/standalone/server.js',
    cwd: '/deploy/alens_portfolio',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'file:./prisma/dev.db'
    }
  }]
};
