module.exports = {
  apps: [
    {
      name: 'flappyjournal',
      script: './start-flappy.js',
      cwd: '/opt/featherweight/FlappyJournal',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'featherweight-server',
      script: './dist/index.js',
      cwd: '/opt/featherweight/FlappyJournal',
      node_args: '--experimental-modules',
      env: {
        NODE_ENV: 'production',
        NODE_PATH: '/opt/featherweight/FlappyJournal/node_modules'
      }
    }
  ]
}
