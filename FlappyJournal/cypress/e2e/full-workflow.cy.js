describe('FlappyJournal Complete Workflow', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/')
    
    // Clear any existing state
    cy.clearCookies()
    cy.clearLocalStorage()
    
    // Wait for the app to load
    cy.get('body').should('be.visible')
  })

  it('completes the full user journey: login → upload → chat → stream', () => {
    // Step 1: Login or Registration
    cy.log('🔐 Step 1: User Authentication')
    
    // Check if we need to login or if already authenticated
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="login-form"]').length > 0) {
        // Login form exists, proceed with login
        cy.get('[data-cy="email-input"]').type('test@example.com')
        cy.get('[data-cy="password-input"]').type('testpassword123')
        cy.get('[data-cy="login-submit"]').click()
        
        // Wait for successful login
        cy.url().should('not.include', '/login')
        cy.get('[data-cy="user-dashboard"]', { timeout: 10000 }).should('be.visible')
      }
    })
    
    // Step 2: Navigate to Dataset Upload
    cy.log('📁 Step 2: Dataset Upload')
    
    cy.get('[data-cy="upload-section"]').should('be.visible').click()
    
    // Create a test file for upload
    const testContent = `Test Journal Entry 1
Date: 2024-01-01
Mood: Happy
Content: This is a test journal entry for automated testing.

Test Journal Entry 2  
Date: 2024-01-02
Mood: Thoughtful
Content: Another test entry to verify upload functionality.`
    
    const testFile = new File([testContent], 'test-journal.txt', { type: 'text/plain' })
    
    // Upload the test file
    cy.get('[data-cy="file-upload-input"]').selectFile({
      contents: Cypress.Buffer.from(testContent),
      fileName: 'test-journal.txt',
      mimeType: 'text/plain'
    })
    
    // Verify upload button becomes enabled
    cy.get('[data-cy="upload-submit"]').should('not.be.disabled').click()
    
    // Wait for upload completion
    cy.get('[data-cy="upload-success"]', { timeout: 15000 }).should('be.visible')
    cy.get('[data-cy="upload-success"]').should('contain', 'uploaded successfully')
    
    // Step 3: Navigate to Chat Interface
    cy.log('💬 Step 3: Initiate Chat Session')
    
    cy.get('[data-cy="chat-section"]').should('be.visible').click()
    cy.get('[data-cy="chat-interface"]', { timeout: 10000 }).should('be.visible')
    
    // Step 4: Send a test message and verify streaming
    cy.log('🔄 Step 4: Test Streaming Response')
    
    const testMessage = "Can you analyze my journal entries and provide insights about my mood patterns?"
    
    cy.get('[data-cy="chat-input"]').should('be.visible').type(testMessage)
    cy.get('[data-cy="chat-send"]').should('not.be.disabled').click()
    
    // Verify message appears in chat
    cy.get('[data-cy="chat-messages"]').should('contain', testMessage)
    
    // Wait for and verify streaming response
    cy.get('[data-cy="ai-response"]', { timeout: 30000 }).should('be.visible')
    
    // Check for streaming indicators
    cy.get('[data-cy="typing-indicator"]').should('be.visible')
    
    // Wait for response completion (streaming should finish)
    cy.get('[data-cy="ai-response"]', { timeout: 45000 }).should('not.be.empty')
    cy.get('[data-cy="typing-indicator"]').should('not.exist')
    
    // Verify response contains relevant content
    cy.get('[data-cy="ai-response"]').should('contain.oneOf', [
      'mood', 'journal', 'analysis', 'insight', 'pattern'
    ])
    
    // Step 5: Test Consciousness Features
    cy.log('🧠 Step 5: Test Consciousness Features')
    
    // Check consciousness metrics if enabled
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="consciousness-metrics"]').length > 0) {
        cy.get('[data-cy="consciousness-metrics"]').should('be.visible')
        cy.get('[data-cy="consciousness-score"]').should('exist')
      }
    })
    
    // Test autonomous thoughts if enabled
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="autonomous-thoughts"]').length > 0) {
        cy.get('[data-cy="autonomous-thoughts"]').should('be.visible')
      }
    })
    
    // Step 6: Test WebSocket Connection
    cy.log('🌐 Step 6: Verify WebSocket Connectivity')
    
    cy.window().then((win) => {
      // Check if WebSocket is connected
      expect(win.websocketConnected).to.be.true
    })
    
    // Test real-time updates by sending another message
    const secondMessage = "How does my writing style reflect my emotional state?"
    cy.get('[data-cy="chat-input"]').clear().type(secondMessage)
    cy.get('[data-cy="chat-send"]').click()
    
    // Verify real-time response
    cy.get('[data-cy="chat-messages"]').should('contain', secondMessage)
    cy.get('[data-cy="ai-response"]', { timeout: 30000 }).should('be.visible')
    
    // Step 7: Test Data Persistence
    cy.log('💾 Step 7: Verify Data Persistence')
    
    // Refresh the page
    cy.reload()
    
    // Verify chat history persists
    cy.get('[data-cy="chat-messages"]', { timeout: 10000 }).should('contain', testMessage)
    
    // Verify uploaded files persist
    cy.get('[data-cy="upload-section"]').click()
    cy.get('[data-cy="uploaded-files"]').should('contain', 'test-journal.txt')
    
    cy.log('✅ Complete workflow test passed successfully!')
  })

  it('handles error scenarios gracefully', () => {
    cy.log('⚠️ Testing Error Handling')
    
    // Test invalid file upload
    cy.get('[data-cy="upload-section"]').click()
    
    const invalidFile = new File(['invalid content'], 'test.exe', { type: 'application/exe' })
    
    cy.get('[data-cy="file-upload-input"]').selectFile({
      contents: 'invalid',
      fileName: 'test.exe',
      mimeType: 'application/exe'
    })
    
    cy.get('[data-cy="upload-submit"]').click()
    
    // Should show error message
    cy.get('[data-cy="error-message"]', { timeout: 10000 }).should('be.visible')
    cy.get('[data-cy="error-message"]').should('contain.oneOf', [
      'invalid', 'unsupported', 'error', 'failed'
    ])
    
    // Test chat with empty message
    cy.get('[data-cy="chat-section"]').click()
    cy.get('[data-cy="chat-send"]').click()
    
    // Should not send empty message
    cy.get('[data-cy="chat-input"]').should('have.class', 'error').or('have.attr', 'aria-invalid', 'true')
  })

  it('tests performance and responsiveness', () => {
    cy.log('⚡ Testing Performance')
    
    // Measure page load time
    cy.window().then((win) => {
      const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart
      expect(loadTime).to.be.lessThan(5000) // Page should load in under 5 seconds
    })
    
    // Test rapid message sending
    cy.get('[data-cy="chat-section"]').click()
    
    for (let i = 0; i < 3; i++) {
      cy.get('[data-cy="chat-input"]').type(`Rapid test message ${i + 1}`)
      cy.get('[data-cy="chat-send"]').click()
      cy.wait(1000) // Brief pause between messages
    }
    
    // Verify all messages were processed
    cy.get('[data-cy="chat-messages"]').should('contain', 'Rapid test message 1')
    cy.get('[data-cy="chat-messages"]').should('contain', 'Rapid test message 2')
    cy.get('[data-cy="chat-messages"]').should('contain', 'Rapid test message 3')
  })
})

// Custom commands for reusable actions
Cypress.Commands.add('loginUser', (email = 'test@example.com', password = 'testpassword123') => {
  cy.visit('/login')
  cy.get('[data-cy="email-input"]').type(email)
  cy.get('[data-cy="password-input"]').type(password)
  cy.get('[data-cy="login-submit"]').click()
  cy.url().should('not.include', '/login')
})

Cypress.Commands.add('uploadTestFile', (content = 'test content', filename = 'test.txt') => {
  cy.get('[data-cy="upload-section"]').click()
  cy.get('[data-cy="file-upload-input"]').selectFile({
    contents: Cypress.Buffer.from(content),
    fileName: filename,
    mimeType: 'text/plain'
  })
  cy.get('[data-cy="upload-submit"]').click()
  cy.get('[data-cy="upload-success"]', { timeout: 15000 }).should('be.visible')
})

Cypress.Commands.add('sendChatMessage', (message) => {
  cy.get('[data-cy="chat-input"]').type(message)
  cy.get('[data-cy="chat-send"]').click()
  cy.get('[data-cy="chat-messages"]').should('contain', message)
})
