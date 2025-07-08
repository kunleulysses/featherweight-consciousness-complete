module.exports = {
  apps: [{
    name: 'consciousness-conversations',
    script: './consciousness-conversations.js',
    interpreter: 'node',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production',
      PORT: 5005
    },
    error_file: './logs/consciousness-conversations-error.log',
    out_file: './logs/consciousness-conversations-out.log',
    log_file: './logs/consciousness-conversations-combined.log',
    time: true
  }]
};
