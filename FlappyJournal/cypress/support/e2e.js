// Cypress support file for e2e tests
import './commands'

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  // on uncaught application errors (useful for debugging)
  return false
})

// Custom commands for authentication
Cypress.Commands.add('login', (username = 'test@example.com', password = 'password123') => {
  cy.session([username, password], () => {
    cy.visit('/login')
    cy.get('[data-cy=email-input]').type(username)
    cy.get('[data-cy=password-input]').type(password)
    cy.get('[data-cy=login-button]').click()
    cy.url().should('not.include', '/login')
    cy.window().its('localStorage.token').should('exist')
  })
})

// Custom commands for file upload
Cypress.Commands.add('uploadDataset', (filename = 'test-dataset.json') => {
  const testData = { 
    title: 'Test Dataset',
    description: 'E2E test dataset',
    data: { test: true, timestamp: Date.now() }
  }
  
  cy.get('[data-cy=file-upload]').then(subject => {
    const blob = new Blob([JSON.stringify(testData)], { type: 'application/json' })
    const file = new File([blob], filename, { type: 'application/json' })
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    subject[0].files = dataTransfer.files
    cy.wrap(subject).trigger('change', { force: true })
  })
})

// Custom commands for WebSocket testing
Cypress.Commands.add('testWebSocketConnection', () => {
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      const ws = new win.WebSocket(Cypress.env('wsUrl'))
      ws.onopen = () => {
        ws.close()
        resolve('connected')
      }
      ws.onerror = () => resolve('error')
      setTimeout(() => resolve('timeout'), 5000)
    })
  })
})
