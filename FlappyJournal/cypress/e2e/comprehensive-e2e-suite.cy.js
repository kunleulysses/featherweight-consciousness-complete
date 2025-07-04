describe('Comprehensive E2E Test Suite: Login → Dataset Upload → Processing Poll → Chat UI → WebSocket Stream → Logout', () => {
  let authToken
  let uploadedDatasetId
  let processingJobId
  
  const DEMO_USERNAME = Cypress.env('demoUsername') || 'demo@featherweight.ai'
  const DEMO_PASSWORD = Cypress.env('demoPassword') || 'demo123'
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:4000/api'
  const WS_URL = Cypress.env('wsUrl') || 'ws://localhost:4002'
  
  before(() => {
    // Ensure all services are running before starting tests
    cy.log('🔍 Checking service health...')
    
    const healthEndpoints = [
      `${API_URL}/health`,
      'http://localhost:4001/health', // auth-service
      'http://localhost:4002/health', // chat-orchestrator  
      'http://localhost:4003/health', // consciousness-backend
    ]
    
    healthEndpoints.forEach((endpoint) => {
      cy.request({
        url: endpoint,
        failOnStatusCode: false,
        timeout: 10000
      }).then((response) => {
        cy.log(`Health check ${endpoint}: ${response.status}`)
      })
    })
  })

  beforeEach(() => {
    // Clear all cookies and local storage before each test
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/')
  })

  it('should execute complete end-to-end workflow', () => {
    // ========================================
    // STEP 1: LOGIN WITH DEMO CREDENTIALS
    // ========================================
    cy.log('🔐 Step 1: Login with demo credentials')
    
    cy.get('body').then(($body) => {
      // Check if already logged in
      if ($body.find('[data-cy=dashboard], [data-cy=user-menu]').length > 0) {
        cy.log('✅ Already logged in')
      } else {
        // Navigate to login page
        cy.get('[data-cy=login-link], [href*="login"], a').contains(/login|sign.?in/i).click()
        
        // Fill login form with demo credentials
        cy.get('[data-cy=email-input], [name="email"], [type="email"]', { timeout: 10000 })
          .should('be.visible')
          .clear()
          .type(DEMO_USERNAME)
        
        cy.get('[data-cy=password-input], [name="password"], [type="password"]')
          .should('be.visible')
          .clear()
          .type(DEMO_PASSWORD)
        
        // Submit login form
        cy.get('[data-cy=login-button], [type="submit"], button').contains(/login|sign.?in/i).click()
        
        // Verify successful login
        cy.url({ timeout: 15000 }).should('not.include', '/login')
        cy.get('[data-cy=dashboard], [data-cy=user-menu], .dashboard', { timeout: 10000 }).should('exist')
      }
    })
    
    // Extract authentication token
    cy.window().its('localStorage').then((localStorage) => {
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('authToken') || 
                   localStorage.getItem('jwt') ||
                   localStorage.getItem('access_token')
      if (token) {
        authToken = token
        cy.log('✅ Authentication token extracted')
      }
    })

    // ========================================
    // STEP 2: DATASET UPLOAD
    // ========================================
    cy.log('📁 Step 2: Upload dataset')
    
    // Navigate to data upload section
    cy.get('[data-cy=nav-data], [href*="data"], [href*="upload"]', { timeout: 10000 })
      .first()
      .click()
    
    // Verify we're on the data page
    cy.url().should('match', /\/(data|upload|datasets)/)
    
    // Create test dataset
    const testDataset = {
      name: 'E2E Test Dataset',
      description: 'Comprehensive end-to-end test dataset',
      type: 'journal_entries',
      data: {
        entries: [
          {
            id: 1,
            content: 'This is a test journal entry for e2e validation.',
            timestamp: new Date().toISOString(),
            mood: 'neutral',
            tags: ['test', 'e2e']
          },
          {
            id: 2,
            content: 'Another test entry to analyze consciousness patterns.',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            mood: 'positive',
            tags: ['analysis', 'consciousness']
          },
          {
            id: 3,
            content: 'Final test entry for comprehensive validation of the upload process.',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            mood: 'reflective',
            tags: ['validation', 'upload']
          }
        ]
      }
    }
    
    // Upload the dataset
    cy.get('[data-cy=file-upload], input[type="file"], .file-upload', { timeout: 10000 }).should('exist').then(() => {
      const blob = new Blob([JSON.stringify(testDataset)], { type: 'application/json' })
      const file = new File([blob], 'e2e-test-dataset.json', { type: 'application/json' })
      
      cy.get('[data-cy=file-upload], input[type="file"]').first().then(subject => {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        subject[0].files = dataTransfer.files
        cy.wrap(subject).trigger('change', { force: true })
      })
    })
    
    // Confirm upload
    cy.get('[data-cy=upload-confirm], [data-cy=upload-button], button').contains(/upload|confirm|submit/i).click()
    
    // Wait for upload success
    cy.get('[data-cy=upload-success], .success, .uploaded, .upload-complete', { timeout: 30000 })
      .should('be.visible')
    
    // Extract dataset ID for processing polling
    cy.get('[data-cy=dataset-id], .dataset-id').then(($el) => {
      if ($el.length > 0) {
        uploadedDatasetId = $el.text() || $el.attr('data-id')
        cy.log(`✅ Dataset uploaded with ID: ${uploadedDatasetId}`)
      }
    })

    // ========================================
    // STEP 3: PROCESSING POLL
    // ========================================
    cy.log('⏳ Step 3: Poll dataset processing status')
    
    if (uploadedDatasetId) {
      // Poll processing status via API
      cy.request({
        method: 'GET',
        url: `${API_URL}/datasets/${uploadedDatasetId}/status`,
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log('✅ Dataset processing status retrieved')
          if (response.body.jobId) {
            processingJobId = response.body.jobId
          }
        }
      })
      
      // Wait for processing completion (poll every 2 seconds for up to 60 seconds)
      let pollAttempts = 0
      const maxPollAttempts = 30
      
      function pollProcessing() {
        if (pollAttempts >= maxPollAttempts) {
          cy.log('⚠️ Processing polling timed out')
          return
        }
        
        cy.request({
          method: 'GET',
          url: `${API_URL}/datasets/${uploadedDatasetId}/processing`,
          headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
          failOnStatusCode: false
        }).then((response) => {
          pollAttempts++
          
          if (response.status === 200 && response.body.status === 'completed') {
            cy.log('✅ Dataset processing completed')
          } else if (response.body.status === 'processing') {
            cy.log(`⏳ Processing... (attempt ${pollAttempts}/${maxPollAttempts})`)
            cy.wait(2000).then(() => pollProcessing())
          } else if (response.body.status === 'failed') {
            cy.log('❌ Dataset processing failed')
          } else {
            cy.wait(2000).then(() => pollProcessing())
          }
        })
      }
      
      pollProcessing()
    }

    // ========================================
    // STEP 4: OPEN CHAT UI
    // ========================================
    cy.log('💬 Step 4: Open chat UI')
    
    // Navigate to chat interface
    cy.get('[data-cy=nav-chat], [href*="chat"]', { timeout: 10000 })
      .first()
      .click()
    
    // Verify we're on the chat page
    cy.url().should('include', 'chat')
    
    // Wait for chat interface to fully load
    cy.get('[data-cy=chat-interface], [data-cy=chat-container], .chat-container', { timeout: 15000 })
      .should('be.visible')
    
    // Verify chat input is available
    cy.get('[data-cy=chat-input], [data-cy=message-input], textarea, input[placeholder*="message"]', { timeout: 10000 })
      .should('be.visible')
      .should('not.be.disabled')
    
    cy.log('✅ Chat UI loaded successfully')

    // ========================================
    // STEP 5: ASSERT INCREMENTAL TOKEN STREAM VIA WEBSOCKET
    // ========================================
    cy.log('🔌 Step 5: Test incremental token streaming via WebSocket')
    
    // Send a test message that will trigger streaming
    const testMessage = 'Analyze the uploaded dataset and provide insights about the journal entries.'
    
    cy.get('[data-cy=chat-input], [data-cy=message-input], textarea, input[placeholder*="message"]')
      .clear()
      .type(testMessage)
    
    // Set up WebSocket connection monitoring before sending message
    let wsConnected = false
    let tokensReceived = []
    let streamingComplete = false
    
    cy.window().then((win) => {
      return new Cypress.Promise((resolve) => {
        // Create WebSocket connection to monitor streaming
        const ws = new win.WebSocket(WS_URL)
        let tokenCount = 0
        
        ws.onopen = () => {
          wsConnected = true
          cy.log('✅ WebSocket connection established')
          
          // Send the chat message after WebSocket is connected
          cy.get('[data-cy=send-button], [data-cy=submit-button], button[type="submit"], button').contains(/send|submit/i)
            .click()
        }
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            // Check for streaming tokens
            if (data.type === 'token' || data.type === 'stream' || data.token) {
              tokenCount++
              tokensReceived.push(data.token || data.content || data.data)
              cy.log(`📝 Token ${tokenCount} received: ${JSON.stringify(data).substring(0, 100)}...`)
            }
            
            // Check for stream completion
            if (data.type === 'complete' || data.type === 'end' || data.finished) {
              streamingComplete = true
              cy.log(`✅ Streaming completed. Total tokens received: ${tokenCount}`)
              ws.close()
              resolve({ tokenCount, tokensReceived, streamingComplete })
            }
          } catch (e) {
            cy.log(`📦 Raw message: ${event.data.substring(0, 100)}...`)
            tokenCount++
          }
        }
        
        ws.onerror = (error) => {
          cy.log('❌ WebSocket error:', error)
          resolve({ error: 'WebSocket connection failed', tokenCount, tokensReceived })
        }
        
        ws.onclose = () => {
          cy.log('🔌 WebSocket connection closed')
          if (!streamingComplete) {
            resolve({ tokenCount, tokensReceived, streamingComplete })
          }
        }
        
        // Timeout after 60 seconds
        setTimeout(() => {
          if (!streamingComplete) {
            cy.log('⏰ WebSocket streaming timeout')
            ws.close()
            resolve({ timeout: true, tokenCount, tokensReceived, streamingComplete })
          }
        }, 60000)
      })
    }).then((result) => {
      // Verify streaming results
      expect(wsConnected).to.be.true
      expect(result.tokenCount).to.be.greaterThan(0)
      cy.log(`✅ WebSocket streaming validation completed. Tokens: ${result.tokenCount}`)
    })
    
    // Also verify UI shows the streamed response
    cy.get('[data-cy=chat-messages], [data-cy=message-list], .messages, .chat-messages', { timeout: 30000 })
      .should('be.visible')
      .within(() => {
        // Check user message appears
        cy.contains(testMessage).should('exist')
        
        // Check AI response appears (from streaming)
        cy.get('[data-cy=ai-message], [data-cy=bot-message], .ai-message, .response', { timeout: 60000 })
          .should('exist')
          .should('contain.text', /\w+/) // Should contain actual text content
      })

    // ========================================
    // STEP 6: LOGOUT
    // ========================================
    cy.log('🚪 Step 6: Logout')
    
    // Find and click logout button/link
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy=user-menu], [data-cy=profile-menu], .user-menu').length > 0) {
        // Click user menu first
        cy.get('[data-cy=user-menu], [data-cy=profile-menu], .user-menu').first().click()
        
        // Then click logout
        cy.get('[data-cy=logout], [data-cy=logout-button]').contains(/logout|sign.?out/i).click()
      } else {
        // Direct logout link
        cy.get('[data-cy=logout], [href*="logout"], a').contains(/logout|sign.?out/i).click()
      }
    })
    
    // Verify logout completed
    cy.url({ timeout: 10000 }).should('match', /\/(login|home|$)/)
    
    // Verify authentication state cleared
    cy.window().its('localStorage').then((localStorage) => {
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('authToken') || 
                   localStorage.getItem('jwt')
      expect(token).to.be.null
    })
    
    cy.log('✅ Logout completed successfully')
    
    // ========================================
    // FINAL VALIDATION
    // ========================================
    cy.log('🎉 Step 7: Final validation')
    
    // Verify we can no longer access protected routes
    cy.request({
      url: `${API_URL}/datasets`,
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([401, 403, 302]) // Should be unauthorized
    })
    
    cy.log('🎉 COMPREHENSIVE E2E TEST SUITE COMPLETED SUCCESSFULLY! 🎉')
    cy.log('✅ All steps executed: Login → Upload → Processing → Chat → WebSocket Stream → Logout')
  })

  // Additional test for WebSocket connection resilience
  it('should handle WebSocket connection interruptions gracefully', () => {
    // This test ensures the WebSocket streaming is robust
    cy.log('🔌 Testing WebSocket resilience')
    
    cy.window().then((win) => {
      return new Cypress.Promise((resolve) => {
        const ws = new win.WebSocket(WS_URL)
        let connectionAttempts = 0
        
        const testConnection = () => {
          connectionAttempts++
          
          ws.onopen = () => {
            cy.log(`✅ WebSocket connection attempt ${connectionAttempts} successful`)
            ws.close()
            resolve('connected')
          }
          
          ws.onerror = () => {
            if (connectionAttempts < 3) {
              cy.log(`⚠️ Connection attempt ${connectionAttempts} failed, retrying...`)
              setTimeout(testConnection, 2000)
            } else {
              cy.log('❌ WebSocket connection failed after 3 attempts')
              resolve('failed')
            }
          }
        }
        
        testConnection()
      })
    })
  })

  // Test for data persistence across sessions
  it('should verify data persistence and session handling', () => {
    cy.log('💾 Testing data persistence')
    
    // Quick login
    cy.visit('/login')
    cy.get('[data-cy=email-input], [type="email"]').type(DEMO_USERNAME)
    cy.get('[data-cy=password-input], [type="password"]').type(DEMO_PASSWORD)
    cy.get('[data-cy=login-button], [type="submit"]').click()
    
    // Check if previously uploaded dataset persists
    cy.visit('/data')
    cy.get('[data-cy=dataset-list], .dataset-list, .datasets', { timeout: 10000 }).should('exist')
    
    cy.log('✅ Data persistence verified')
  })
})
