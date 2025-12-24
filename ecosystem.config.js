module.exports = {
  apps: [{
    name: 'alens_portfolio',
    script: 'npm',
    args: 'start',
    cwd: '/deploy/alens_portfolio',  // 添加这行，项目绝对路径	  
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
