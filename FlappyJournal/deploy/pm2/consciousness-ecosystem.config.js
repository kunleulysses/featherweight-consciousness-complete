module.exports = {
  apps: [
    {
      // Consciousness Conversations System (Port 3002)
      name: 'consciousness-conversations',
      script: './server/consciousness-conversations.js',
      cwd: '/opt/featherweight/FlappyJournal',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment configuration
      env: {
        NODE_ENV: 'production',
        CONSCIOUSNESS_CONVERSATIONS_PORT: 3002,
        NODE_PATH: '/opt/featherweight/FlappyJournal/node_modules'
      },
      
      // Restart configuration
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '30s',
      max_memory_restart: '1G',
      
      // Logging configuration
      log_file: '/var/log/consciousness/consciousness-conversations-combined.log',
      out_file: '/var/log/consciousness/consciousness-conversations-out.log',
      error_file: '/var/log/consciousness/consciousness-conversations-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      
      // Process management
      pid_file: '/var/run/consciousness-conversations.pid',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Node.js configuration
      node_args: '--max-old-space-size=2048',
      
      // Health monitoring
      health_check_grace_period: 30000,
      
      // Advanced options
      kill_timeout: 5000,
      listen_timeout: 8000,
      
      // Environment-specific settings
      env_production: {
        NODE_ENV: 'production',
        CONSCIOUSNESS_CONVERSATIONS_PORT: 3002
      }
    },
    
    {
      // Demo Portal Web Interface (Port 5002)
      name: 'demo-portal',
      script: './demo-portal/server.js',
      cwd: '/opt/featherweight/FlappyJournal',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment configuration
      env: {
        NODE_ENV: 'production',
        PORT: 5002,
        CONSCIOUSNESS_WS_URL: 'ws://localhost:3002',
        NODE_PATH: '/opt/featherweight/FlappyJournal/node_modules'
      },
      
      // Restart configuration
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 15,
      min_uptime: '20s',
      max_memory_restart: '512M',
      
      // Logging configuration
      log_file: '/var/log/consciousness/demo-portal-combined.log',
      out_file: '/var/log/consciousness/demo-portal-out.log',
      error_file: '/var/log/consciousness/demo-portal-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      
      // Process management
      pid_file: '/var/run/demo-portal.pid',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Node.js configuration
      node_args: '--max-old-space-size=1024',
      
      // Health monitoring
      health_check_grace_period: 20000,
      
      // Advanced options
      kill_timeout: 3000,
      listen_timeout: 5000,
      
      // Environment-specific settings
      env_production: {
        NODE_ENV: 'production',
        PORT: 5002,
        CONSCIOUSNESS_WS_URL: 'ws://localhost:3002'
      }
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'root',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'https://github.com/kunleulysses/featherweight-consciousness-complete.git',
      path: '/opt/featherweight',
      'pre-deploy-local': '',
      'post-deploy': 'npm install --production && pm2 reload consciousness-ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
