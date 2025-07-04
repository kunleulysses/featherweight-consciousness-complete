const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    videosFolder: '/artifacts/cypress/videos',
    screenshotsFolder: '/artifacts/cypress/screenshots',
    video: true,
    screenshots: true,
    defaultCommandTimeout: 60000, // 60s timeout as requested
    requestTimeout: 60000,
    responseTimeout: 60000,
    pageLoadTimeout: 60000,
    viewportWidth: 1280,
    viewportHeight: 720,
    chromeWebSecurity: false,
    retries: {
      runMode: 3,
      openMode: 1
    },
    env: {
      apiUrl: 'http://localhost:4000/api',
      wsUrl: 'ws://localhost:4002',
      demoUsername: 'demo@featherweight.ai',
      demoPassword: 'demo123'
    },
    setupNodeEvents(on, config) {
      // JUnit reporter setup
      on('before:run', async (details) => {
        console.log('Starting Cypress tests with JUnit reporting')
      })
      
      on('after:run', async (results) => {
        console.log('Cypress tests completed')
      })
      
      return config
    }
  },
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '/artifacts/junit/test-results-[hash].xml',
    toConsole: true,
    attachments: true,
  }
})
