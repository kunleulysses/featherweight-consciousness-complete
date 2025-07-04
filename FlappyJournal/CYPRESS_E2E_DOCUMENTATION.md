# Cypress E2E Test Suite Documentation

## Overview

This comprehensive Cypress E2E test suite implements the complete workflow as specified:
**Login → Dataset Upload → Processing Poll → Chat UI → WebSocket Token Streaming → Logout**

## Features

### ✅ Implemented Requirements

1. **Demo Credentials Login**: Tests login with `demo@featherweight.ai` / `demo123`
2. **Dataset Upload**: Uploads test JSON dataset and validates success
3. **Processing Polling**: Polls dataset processing status with API calls
4. **Chat UI Navigation**: Opens chat interface and validates availability
5. **WebSocket Token Streaming**: Asserts incremental token stream via WebSocket
6. **Complete Logout**: Validates session termination

### 🐳 Docker Integration

- Uses `cypress/included` Docker image
- Outputs JUnit XML reports to `/artifacts/junit/`
- Saves screenshots to `/artifacts/cypress/screenshots/`
- Saves videos to `/artifacts/cypress/videos/`

### ⚙️ Configuration

- **Retries**: 3 attempts in run mode, 1 in open mode
- **Timeout**: 60-second command timeout (prevents heredoc lockups)
- **Reporting**: JUnit XML format for CI/CD integration
- **Artifacts**: Videos and screenshots for debugging

## File Structure

```
├── cypress/
│   ├── e2e/
│   │   ├── comprehensive-e2e-suite.cy.js    # Main E2E test suite
│   │   ├── end-to-end-flow.cy.js            # Original E2E tests
│   │   └── ...
│   └── support/
├── cypress.config.js                         # Standard Cypress config
├── cypress.junit.config.js                   # JUnit reporter config
├── Dockerfile.cypress                        # Docker container setup
├── docker-compose.cypress.yml                # Docker Compose for tests
├── run-cypress-e2e.sh                       # Test runner script
└── .github/workflows/cypress-e2e.yml        # CI/CD workflow
```

## Usage

### Method 1: Docker (Recommended)

```bash
# Run with Docker (includes all setup)
./run-cypress-e2e.sh
```

### Method 2: Make Commands

```bash
# Setup environment
make cypress-setup

# Run tests locally
make test-e2e

# Run with Docker via Make
make test-e2e-docker

# Clean artifacts
make clean-test-artifacts
```

### Method 3: Direct Cypress

```bash
# Install dependencies
npm install cypress mocha-junit-reporter --save-dev

# Run specific test suite
npx cypress run \
  --config-file cypress.junit.config.js \
  --spec "cypress/e2e/comprehensive-e2e-suite.cy.js"
```

### Method 4: Docker Compose

```bash
# Run with Docker Compose
docker-compose -f docker-compose.cypress.yml up --build
```

## Test Flow Details

### 1. Login with Demo Credentials
- Navigates to login page
- Enters `demo@featherweight.ai` / `demo123`
- Validates successful authentication
- Extracts auth token for API calls

### 2. Dataset Upload
- Navigates to data upload section
- Creates test JSON dataset with journal entries
- Uploads via file input or drag-drop
- Validates upload success message
- Extracts dataset ID for processing

### 3. Processing Poll
- Makes API calls to check processing status
- Polls every 2 seconds for up to 60 seconds
- Validates completion or handles timeout
- Tracks processing job ID

### 4. Chat UI Navigation
- Opens chat interface
- Validates chat input availability
- Ensures WebSocket connection readiness

### 5. WebSocket Token Streaming
- Establishes WebSocket connection to `ws://localhost:4002`
- Sends test message about dataset analysis
- Monitors incremental token streaming
- Validates token count and stream completion
- Verifies UI updates with streamed content

### 6. Logout
- Clicks logout button/menu
- Validates session termination
- Ensures auth tokens are cleared
- Verifies protected routes are inaccessible

## Configuration Options

### Environment Variables

```bash
CYPRESS_baseUrl=http://localhost:4000
CYPRESS_defaultCommandTimeout=60000
CYPRESS_requestTimeout=60000
CYPRESS_responseTimeout=60000
CYPRESS_pageLoadTimeout=60000
CYPRESS_demoUsername=demo@featherweight.ai
CYPRESS_demoPassword=demo123
CYPRESS_apiUrl=http://localhost:4000/api
CYPRESS_wsUrl=ws://localhost:4002
```

### Retry Configuration

```javascript
retries: {
  runMode: 3,    // 3 retries in CI/headless mode
  openMode: 1    // 1 retry in interactive mode
}
```

### Timeout Settings

- **Command Timeout**: 60 seconds (prevents heredoc lockups)
- **Request Timeout**: 60 seconds
- **Response Timeout**: 60 seconds
- **Page Load Timeout**: 60 seconds

## Artifacts Output

### JUnit Reports
- Location: `./artifacts/junit/test-results-[hash].xml`
- Format: Standard JUnit XML for CI/CD integration
- Includes: Test names, durations, pass/fail status

### Screenshots
- Location: `./artifacts/cypress/screenshots/`
- Trigger: On test failure or explicit capture
- Format: PNG images with timestamp

### Videos
- Location: `./artifacts/cypress/videos/`
- Content: Full test execution recording
- Format: MP4 compression level 32

## WebSocket Testing Details

The WebSocket streaming test validates:

1. **Connection Establishment**: Verifies WS connection to chat service
2. **Token Streaming**: Monitors incremental token delivery
3. **Stream Completion**: Detects end-of-stream markers
4. **UI Updates**: Validates frontend updates with streamed content
5. **Error Handling**: Tests connection resilience and retries

### WebSocket Message Types

```javascript
// Token streaming
{ type: 'token', token: 'Hello', content: 'Hello' }

// Stream completion  
{ type: 'complete', finished: true }

// Error handling
{ type: 'error', message: 'Connection failed' }
```

## CI/CD Integration

### GitHub Actions

The provided workflow (`.github/workflows/cypress-e2e.yml`) includes:

- Node.js setup and dependency installation
- Application service startup
- Cypress test execution with proper timeouts
- Artifact upload (videos, screenshots, JUnit reports)
- Test result reporting

### Jenkins Integration

```groovy
pipeline {
    agent any
    stages {
        stage('E2E Tests') {
            steps {
                sh './run-cypress-e2e.sh'
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'artifacts/junit/*.xml'
                    archiveArtifacts artifacts: 'artifacts/**/*'
                }
            }
        }
    }
}
```

## Troubleshooting

### Common Issues

1. **Service Not Ready**: Ensure application is running on `localhost:4000`
2. **WebSocket Connection Failed**: Check if chat service is on port 4002
3. **Timeout Issues**: Verify 60-second timeouts are sufficient
4. **Login Failures**: Confirm demo credentials are configured
5. **Upload Failures**: Check file upload endpoint availability

### Debug Commands

```bash
# Test service availability
curl http://localhost:4000/health
curl http://localhost:4002/health

# Check WebSocket connection
wscat -c ws://localhost:4002

# Validate Cypress installation
npx cypress verify

# Run with debug output
DEBUG=cypress:* npx cypress run
```

### Artifact Analysis

- **Videos**: Review full test execution for visual debugging
- **Screenshots**: Check failure points with captured screens  
- **JUnit Reports**: Parse XML for detailed test metrics
- **Console Logs**: Monitor browser and Cypress debug output

## Performance Considerations

- **Test Duration**: ~5-10 minutes for complete suite
- **Retry Logic**: Prevents flaky test failures
- **Timeout Settings**: Balances stability vs speed
- **Artifact Size**: Videos compressed to reduce storage
- **Parallel Execution**: Can run multiple specs in parallel

## Maintenance

### Regular Updates

1. Update demo credentials if changed
2. Adjust API endpoints for service changes  
3. Modify WebSocket URLs for infrastructure updates
4. Update selectors for UI changes
5. Refresh Docker base images periodically

### Test Data Management

- Use consistent test dataset format
- Clean up uploaded test data after runs
- Maintain realistic test scenarios
- Validate data persistence across sessions

## Security Considerations

- Demo credentials are hardcoded for testing only
- Use environment variables for sensitive data
- Ensure test isolation between runs
- Clean up authentication tokens after tests
- Validate logout completely clears session

---

## Quick Start

```bash
# 1. Ensure your application is running
npm start

# 2. Run E2E tests with Docker
./run-cypress-e2e.sh

# 3. Check results
ls -la ./artifacts/
```

The test suite will validate the complete user journey from login to logout, ensuring all systems work together correctly. JUnit reports and visual artifacts provide comprehensive test evidence for CI/CD pipelines.
