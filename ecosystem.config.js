module.exports = {
  apps: [{
    name: 'alens_portfolio',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/alens_portfolio',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'file:./prod.db',
      PORT: 3000,
    },
    // Log configuration
    log_file: '/var/log/pm2/alens-portfolio.log',
    out_file: '/var/log/pm2/alens-portfolio-out.log',
    error_file: '/var/log/pm2/alens-portfolio-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Restart delay
    restart_delay: 3000,
    // Maximum restart attempts
    max_restarts: 5,
    // Minimum uptime before considering the app started
    min_uptime: '10s',
    // Listen timeout
    listen_timeout: 10000,
    // Kill timeout
    kill_timeout: 5000,
    // Merge logs
    merge_logs: true,
  }]
};
