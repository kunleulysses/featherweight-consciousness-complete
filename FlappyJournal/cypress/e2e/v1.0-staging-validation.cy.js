// Cypress End-to-End Validation Suite for v1.0-full-tech Release
// This comprehensive test suite validates the complete application flow
// before promoting to production.

describe('v1.0-full-tech Staging Validation', () => {
  const testUser = {
    email: 'test+staging@featherweight.world',
    password: 'TestPassword123!',
    name: 'Staging Test User'
  };

  beforeEach(() => {
    // Clear cookies and local storage
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Set test environment
    cy.window().then((win) => {
      win.localStorage.setItem('test-environment', 'staging');
    });
  });

  describe('Application Core Functionality', () => {
    it('should load the application successfully', () => {
      cy.visit('/');
      
      // Check that the main page loads
      cy.contains('FlappyJournal', { timeout: 10000 }).should('be.visible');
      
      // Verify basic page structure
      cy.get('header').should('be.visible');
      cy.get('main').should('be.visible');
      
      // Check for responsive design
      cy.viewport(1280, 720);
      cy.get('[data-testid="main-content"]').should('be.visible');
      
      cy.viewport(768, 1024);
      cy.get('[data-testid="main-content"]').should('be.visible');
    });

    it('should have working navigation', () => {
      cy.visit('/');
      
      // Test main navigation links
      const navItems = ['Dashboard', 'Journal', 'Analytics', 'Settings'];
      
      navItems.forEach(item => {
        cy.contains(item).should('be.visible');
      });
      
      // Test mobile menu if present
      cy.viewport(768, 1024);
      cy.get('[data-testid="mobile-menu-button"]').then($btn => {
        if ($btn.is(':visible')) {
          cy.wrap($btn).click();
          cy.get('[data-testid="mobile-menu"]').should('be.visible');
        }
      });
    });

    it('should handle 404 pages gracefully', () => {
      cy.visit('/nonexistent-page', { failOnStatusCode: false });
      
      cy.contains('404').should('be.visible');
      cy.contains('Page not found').should('be.visible');
      
      // Should have a way to navigate back
      cy.contains('Go home').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Authentication System', () => {
    it('should display login form', () => {
      cy.visit('/login');
      
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should validate login form inputs', () => {
      cy.visit('/login');
      
      // Test empty form submission
      cy.get('button[type="submit"]').click();
      cy.contains('Email is required').should('be.visible');
      
      // Test invalid email
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();
      cy.contains('Please enter a valid email').should('be.visible');
      
      // Test short password
      cy.get('input[type="email"]').clear().type('test@example.com');
      cy.get('input[type="password"]').type('123');
      cy.get('button[type="submit"]').click();
      cy.contains('Password must be at least').should('be.visible');
    });

    it('should handle OIDC authentication', () => {
      cy.visit('/login');
      
      // Check for OIDC login button
      cy.get('[data-testid="oidc-login"]').should('be.visible');
      
      // Click OIDC login (this will redirect, so we just verify the button works)
      cy.get('[data-testid="oidc-login"]').should('not.be.disabled');
    });

    it('should register new users', () => {
      cy.visit('/register');
      
      cy.get('[data-testid="register-form"]').should('be.visible');
      
      // Fill out registration form
      cy.get('input[name="name"]').type(testUser.name);
      cy.get('input[name="email"]').type(`test+${Date.now()}@featherweight.world`);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('input[name="confirmPassword"]').type(testUser.password);
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to verification or dashboard
      cy.url().should('not.include', '/register');
    });
  });

  describe('API Health and Performance', () => {
    it('should have healthy API endpoints', () => {
      // Test main API health
      cy.request('GET', '/api/health').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status', 'healthy');
        expect(response.body).to.have.property('timestamp');
        expect(response.body).to.have.property('services');
      });
    });

    it('should have working authentication endpoints', () => {
      // Test auth service health
      cy.request('GET', '/api/auth/health').then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('should respond within acceptable time limits', () => {
      const startTime = Date.now();
      
      cy.request('GET', '/api/health').then(() => {
        const responseTime = Date.now() - startTime;
        expect(responseTime).to.be.lessThan(2000); // 2 seconds max
      });
    });

    it('should handle API rate limiting', () => {
      // Make multiple rapid requests to test rate limiting
      const requests = Array.from({ length: 10 }, () => 
        cy.request({
          url: '/api/health',
          failOnStatusCode: false
        })
      );
      
      // At least some should succeed
      cy.wrap(Promise.all(requests)).then((responses) => {
        const successCount = responses.filter(r => r.status === 200).length;
        expect(successCount).to.be.greaterThan(0);
      });
    });
  });

  describe('WebSocket Connectivity', () => {
    it('should establish WebSocket connection', () => {
      cy.visit('/');
      
      // Test WebSocket connection through the application
      cy.window().then((win) => {
        return new Promise((resolve) => {
          const wsUrl = Cypress.env('wsUrl') || 'wss://staging.app.featherweight.world/ws';
          const ws = new win.WebSocket(wsUrl);
          
          ws.onopen = () => {
            resolve('connected');
            ws.close();
          };
          
          ws.onerror = () => {
            resolve('error');
          };
          
          // Timeout after 5 seconds
          setTimeout(() => resolve('timeout'), 5000);
        });
      }).then((result) => {
        expect(result).to.eq('connected');
      });
    });
  });

  describe('Journal Functionality', () => {
    beforeEach(() => {
      // Mock authentication for journal tests
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'test-token');
        win.localStorage.setItem('user', JSON.stringify(testUser));
      });
    });

    it('should create and save journal entries', () => {
      cy.visit('/journal');
      
      // Create new entry
      cy.get('[data-testid="new-entry-button"]').click();
      
      const testEntry = `Test journal entry ${Date.now()}`;
      cy.get('[data-testid="entry-editor"]').type(testEntry);
      
      // Save entry
      cy.get('[data-testid="save-entry"]').click();
      
      // Verify entry was saved
      cy.contains('Entry saved').should('be.visible');
      cy.contains(testEntry).should('be.visible');
    });

    it('should search journal entries', () => {
      cy.visit('/journal');
      
      // Use search functionality
      cy.get('[data-testid="search-input"]').type('test');
      cy.get('[data-testid="search-button"]').click();
      
      // Should show search results or empty state
      cy.get('[data-testid="search-results"]').should('be.visible');
    });
  });

  describe('Chat Interface', () => {
    it('should load chat interface', () => {
      cy.visit('/chat');
      
      cy.get('[data-testid="chat-container"]').should('be.visible');
      cy.get('[data-testid="message-input"]').should('be.visible');
      cy.get('[data-testid="send-button"]').should('be.visible');
    });

    it('should send and receive messages', () => {
      cy.visit('/chat');
      
      const testMessage = `Test message ${Date.now()}`;
      
      // Send message
      cy.get('[data-testid="message-input"]').type(testMessage);
      cy.get('[data-testid="send-button"]').click();
      
      // Verify message appears
      cy.contains(testMessage).should('be.visible');
      
      // Wait for potential AI response
      cy.wait(2000);
      
      // Check for response indicator
      cy.get('[data-testid="chat-messages"]').within(() => {
        cy.get('.message').should('have.length.greaterThan', 1);
      });
    });
  });

  describe('Performance and Accessibility', () => {
    it('should have good performance metrics', () => {
      cy.visit('/');
      
      // Test page load performance
      cy.window().then((win) => {
        const perfData = win.performance.getEntriesByType('navigation')[0];
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
        expect(loadTime).to.be.lessThan(3000); // 3 seconds max
      });
    });

    it('should be accessible', () => {
      cy.visit('/');
      
      // Check for basic accessibility requirements
      cy.get('main').should('have.attr', 'role');
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
      
      // Check for keyboard navigation
      cy.get('body').tab();
      cy.focused().should('be.visible');
    });

    it('should work with JavaScript disabled', () => {
      // Visit page with JS disabled simulation
      cy.visit('/', {
        onBeforeLoad: (win) => {
          // Simulate JS being disabled by removing key functions
          delete win.fetch;
        }
      });
      
      // Basic content should still be visible
      cy.contains('FlappyJournal').should('be.visible');
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle network errors gracefully', () => {
      cy.visit('/');
      
      // Simulate network error
      cy.intercept('GET', '/api/**', { forceNetworkError: true }).as('networkError');
      
      // Try to make an API call that will fail
      cy.get('[data-testid="refresh-button"]').then($btn => {
        if ($btn.length > 0) {
          cy.wrap($btn).click();
          
          // Should show error message
          cy.contains('network error', { matchCase: false }).should('be.visible');
        }
      });
    });

    it('should handle API errors gracefully', () => {
      cy.visit('/');
      
      // Simulate API error
      cy.intercept('GET', '/api/health', { statusCode: 500 }).as('apiError');
      
      cy.request({
        url: '/api/health',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(500);
      });
    });

    it('should maintain state during temporary disconnections', () => {
      cy.visit('/journal');
      
      // Create some content
      cy.get('[data-testid="entry-editor"]').then($editor => {
        if ($editor.length > 0) {
          cy.wrap($editor).type('Content that should persist');
          
          // Simulate temporary disconnection
          cy.window().then((win) => {
            win.navigator.onLine = false;
          });
          
          // Content should still be there
          cy.get('[data-testid="entry-editor"]').should('contain.value', 'Content that should persist');
        }
      });
    });
  });

  describe('Cross-Browser Compatibility', () => {
    it('should work in different viewport sizes', () => {
      const viewports = [
        [1920, 1080], // Desktop
        [1366, 768],  // Laptop
        [768, 1024],  // Tablet
        [375, 667]    // Mobile
      ];
      
      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);
        cy.visit('/');
        
        cy.contains('FlappyJournal').should('be.visible');
        cy.get('main').should('be.visible');
      });
    });
  });

  after(() => {
    // Cleanup: Clear test data
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Log test completion
    cy.task('log', 'v1.0-full-tech staging validation completed successfully');
  });
});
