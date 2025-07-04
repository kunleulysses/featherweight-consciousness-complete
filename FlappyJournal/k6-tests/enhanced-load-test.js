import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';

// Custom metrics for the specific requirements
export let error_rate = new Rate('error_rate');
export let hz_checks = new Counter('checks');
export let hz_avg = new Trend('hz_avg');
export let ws_connection_time = new Trend('ws_connection_time');
export let message_response_time = new Trend('message_response_time');
export let backend_metrics_checks = new Counter('backend_metrics_checks');
export let loop_frequency = new Trend('loop_frequency');

// Remote write configuration for Prometheus
export const options = {
  ext: {
    prometheus: {
      remote_write: {
        url: __ENV.K6_PROMETHEUS_RW_SERVER_URL || "http://localhost:9090/api/v1/write",
        push_interval: "5s",
        push_timeout: "10s",
        max_samples_per_send: 1000,
        metadata_flush_interval: "10s",
        keep_tags: ["status", "method", "url", "expected_response", "user_id"]
      }
    }
  },
  // Test configuration for 1000 VUs for 5 minutes
  stages: [
    { duration: '30s', target: 250 },   // Ramp up to 250 users
    { duration: '30s', target: 500 },   // Scale to 500 users  
    { duration: '1m', target: 1000 },   // Scale to 1000 users (1k VU)
    { duration: '5m', target: 1000 },   // Stay at 1000 users for 5 minutes (main test)
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    'error_rate': ['rate<0.01'],           // Error rate < 1% (0.01) - REQUIRED
    'checks{type:hz}': ['avg>95'],         // Hz checks average > 95 - REQUIRED
    'ws_connection_time': ['p(95)<5000'],  // 95% of WS connections under 5s
    'message_response_time': ['p(90)<10000'], // 90% of message responses under 10s
    'backend_metrics_checks': ['count>0'], // Ensure metrics endpoint is checked
    'loop_frequency': ['avg>90'],          // Backend loop frequency should be > 90 Hz
  },
};

// Environment configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const WS_URL = __ENV.WS_URL || 'ws://localhost:4002';
const CHAT_ORCHESTRATOR_URL = __ENV.CHAT_ORCHESTRATOR_URL || 'http://localhost:4002';
const METRICS_URL = __ENV.METRICS_URL || 'http://localhost:4000/metrics';

// Test credentials and data
const DEMO_CREDENTIALS = {
  username: __ENV.DEMO_USERNAME || 'demo@featherweight.ai',
  password: __ENV.DEMO_PASSWORD || 'demo123'
};

// Test chat messages for realistic WebSocket streaming
const testMessages = [
  'Hello, can you help me analyze my thoughts?',
  'What insights can you provide about my recent journal entries?',
  'I need help understanding my emotional patterns.',
  'Can you summarize my recent consciousness data?',
  'What are the key themes in my uploaded dataset?',
  'Help me identify recurring patterns in my thoughts.',
  'Analyze my mood trends over the past week.',
  'What recommendations do you have for my personal growth?',
  'Can you help me understand my sleep patterns?',
  'What are the connections between my activities and mood?'
];

// Global variables for session management
let globalAuthToken = null;
let globalSessionId = null;

export function setup() {
  console.log('🚀 Starting enhanced k6 load test setup...');
  
  // Verify all required services are available
  const healthChecks = [
    { name: 'API Gateway', url: `${BASE_URL}/health` },
    { name: 'Chat Orchestrator', url: `${CHAT_ORCHESTRATOR_URL}/health` },
    { name: 'Metrics Endpoint', url: `${METRICS_URL}` },
  ];
  
  const setupData = {
    servicesHealthy: true,
    authTokens: [],
    testStartTime: new Date().toISOString()
  };
  
  // Perform health checks
  healthChecks.forEach(service => {
    const response = http.get(service.url, {
      timeout: '10s',
      headers: { 'User-Agent': 'k6-load-test/1.0' }
    });
    
    if (response.status !== 200) {
      console.warn(`⚠️ ${service.name} health check failed: ${response.status}`);
      setupData.servicesHealthy = false;
    } else {
      console.log(`✅ ${service.name} is healthy`);
    }
  });
  
  // Pre-authenticate some test users to reduce auth load during test
  console.log('🔐 Pre-authenticating test users...');
  
  for (let i = 0; i < 10; i++) {
    const loginResponse = http.post(`${BASE_URL}/api/auth/login`, {
      username: DEMO_CREDENTIALS.username,
      password: DEMO_CREDENTIALS.password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'k6-load-test/1.0'
      }
    });
    
    if (loginResponse.status === 200) {
      const authData = JSON.parse(loginResponse.body);
      if (authData.token) {
        setupData.authTokens.push(authData.token);
      }
    }
  }
  
  console.log(`✅ Setup complete. Pre-authenticated ${setupData.authTokens.length} users`);
  return setupData;
}

export default function(data) {
  // Select random authentication token or authenticate inline
  let authToken = null;
  if (data.authTokens.length > 0) {
    authToken = data.authTokens[Math.floor(Math.random() * data.authTokens.length)];
  }
  
  // If no pre-auth token, authenticate inline
  if (!authToken) {
    authToken = authenticateUser();
  }
  
  if (!authToken) {
    error_rate.add(1);
    console.error('❌ Authentication failed');
    return;
  }
  
  // Scenario distribution
  const scenario = Math.random();
  
  if (scenario < 0.6) {
    // 60% - Chat WebSocket streaming test
    testChatWebSocketStreaming(authToken);
  } else if (scenario < 0.8) {
    // 20% - Backend metrics monitoring
    testBackendMetrics();
  } else {
    // 20% - Mixed API load test
    testMixedAPILoad(authToken);
  }
  
  // Random sleep between 1-5 seconds
  sleep(Math.random() * 4 + 1);
}

function authenticateUser() {
  const startTime = new Date().getTime();
  
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, {
    username: DEMO_CREDENTIALS.username,
    password: DEMO_CREDENTIALS.password
  }, {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'k6-load-test/1.0'
    },
    timeout: '15s'
  });
  
  const authSuccess = check(loginResponse, {
    'auth: status is 200': (r) => r.status === 200,
    'auth: has token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.token !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  if (!authSuccess) {
    error_rate.add(1);
    return null;
  }
  
  try {
    const authData = JSON.parse(loginResponse.body);
    return authData.token;
  } catch (e) {
    error_rate.add(1);
    return null;
  }
}

function testChatWebSocketStreaming(authToken) {
  const wsStartTime = new Date().getTime();
  const testMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
  
  const wsUrl = `${WS_URL}?token=${authToken}`;
  
  const res = ws.connect(wsUrl, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'User-Agent': 'k6-load-test/1.0'
    },
    timeout: '10s'
  }, function (socket) {
    const connectionTime = new Date().getTime() - wsStartTime;
    ws_connection_time.add(connectionTime);
    
    let messageStartTime = null;
    let tokensReceived = 0;
    let streamingComplete = false;
    let loopFrequencySum = 0;
    let loopFrequencyCount = 0;
    
    socket.on('open', function () {
      console.log(`🔌 WebSocket connected for VU ${__VU}`);
      
      // Send chat message
      messageStartTime = new Date().getTime();
      socket.send(JSON.stringify({
        type: 'chat',
        message: testMessage,
        timestamp: new Date().toISOString(),
        sessionId: `test-session-${__VU}-${Date.now()}`
      }));
    });
    
    socket.on('message', function (data) {
      try {
        const message = JSON.parse(data);
        
        // Track different message types
        if (message.type === 'token' || message.type === 'stream') {
          tokensReceived++;
          
          // Hz frequency check - this is the critical metric
          if (message.hz || message.frequency) {
            const hz = message.hz || message.frequency;
            hz_checks.add(1, { type: 'hz' });
            hz_avg.add(hz);
            loopFrequencySum += hz;
            loopFrequencyCount++;
          }
        } else if (message.type === 'complete' || message.type === 'end') {
          streamingComplete = true;
          
          if (messageStartTime) {
            const responseTime = new Date().getTime() - messageStartTime;
            message_response_time.add(responseTime);
          }
          
          // Calculate average loop frequency for this session
          if (loopFrequencyCount > 0) {
            const avgHz = loopFrequencySum / loopFrequencyCount;
            loop_frequency.add(avgHz);
          }
          
          socket.close();
        } else if (message.type === 'error') {
          error_rate.add(1);
          console.error(`❌ WebSocket error: ${message.message}`);
          socket.close();
        }
      } catch (e) {
        // Handle non-JSON messages or parsing errors
        console.warn(`⚠️ Message parsing error: ${e.message}`);
      }
    });
    
    socket.on('close', function () {
      console.log(`🔌 WebSocket closed for VU ${__VU}. Tokens: ${tokensReceived}, Complete: ${streamingComplete}`);
    });
    
    socket.on('error', function (error) {
      error_rate.add(1);
      console.error(`❌ WebSocket error for VU ${__VU}: ${error}`);
    });
    
    // Keep connection alive for streaming test
    socket.setTimeout(function () {
      if (!streamingComplete) {
        console.log(`⏰ WebSocket timeout for VU ${__VU}`);
        socket.close();
      }
    }, 30000); // 30 second timeout
  });
  
  // Check WebSocket connection result
  check(res, {
    'ws: connection successful': (r) => r && r.status === 101,
  });
}

function testBackendMetrics() {
  const metricsResponse = http.get(METRICS_URL, {
    headers: {
      'User-Agent': 'k6-load-test/1.0',
      'Accept': 'text/plain'
    },
    timeout: '10s'
  });
  
  const metricsSuccess = check(metricsResponse, {
    'metrics: status is 200': (r) => r.status === 200,
    'metrics: has loop frequency data': (r) => {
      return r.body.includes('loop_frequency') || 
             r.body.includes('hz_avg') ||
             r.body.includes('processing_frequency');
    },
    'metrics: has error rate data': (r) => {
      return r.body.includes('error_rate') || 
             r.body.includes('http_req_failed');
    }
  });
  
  if (metricsSuccess) {
    backend_metrics_checks.add(1);
    
    // Extract loop frequency from metrics if available
    const loopFreqMatch = metricsResponse.body.match(/loop_frequency[\s\{][^}]*}\s*([0-9.]+)/);
    if (loopFreqMatch) {
      const freq = parseFloat(loopFreqMatch[1]);
      loop_frequency.add(freq);
      hz_checks.add(1, { type: 'hz' });
      hz_avg.add(freq);
    }
  } else {
    error_rate.add(1);
  }
}

function testMixedAPILoad(authToken) {
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
    'User-Agent': 'k6-load-test/1.0'
  };
  
  // Test various API endpoints
  const endpoints = [
    { url: `${BASE_URL}/api/chat/history`, method: 'GET' },
    { url: `${BASE_URL}/api/datasets`, method: 'GET' },
    { url: `${BASE_URL}/api/user/profile`, method: 'GET' },
    { url: `${BASE_URL}/api/chat/sessions`, method: 'GET' }
  ];
  
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  
  const response = http.get(endpoint.url, {
    headers: headers,
    timeout: '15s'
  });
  
  const success = check(response, {
    'api: status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'api: response time < 5s': (r) => r.timings.duration < 5000
  });
  
  if (!success) {
    error_rate.add(1);
  }
}

export function teardown(data) {
  console.log('🏁 Load test teardown starting...');
  
  // Final metrics check
  const finalMetricsResponse = http.get(METRICS_URL, {
    headers: { 'User-Agent': 'k6-load-test/1.0' },
    timeout: '10s'
  });
  
  if (finalMetricsResponse.status === 200) {
    console.log('✅ Final metrics check successful');
  } else {
    console.warn('⚠️ Final metrics check failed');
  }
  
  console.log('✅ Load test teardown complete');
}
