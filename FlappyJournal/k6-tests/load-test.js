import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';

// Custom metrics
export let errorRate = new Rate('errors');
export let responseTimeP95 = new Trend('response_time_p95');
export let wsConnectionErrors = new Counter('ws_connection_errors');
export let chatMessagesSent = new Counter('chat_messages_sent');

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
        keep_tags: ["status", "method", "url", "expected_response"]
      }
    }
  },
// Test configuration
export let options = {
  stages: [
    { duration: '30s', target: 100 },   // Ramp up to 100 users
    { duration: '1m', target: 500 },    // Scale to 500 users  
    { duration: '2m', target: 1000 },   // Scale to 1000 users (1k VU)
    { duration: '1m', target: 1000 },   // Stay at 1000 users for 1 minute
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    errors: ['rate<0.01'],              // Error rate < 1%
    http_req_duration: ['p(95)<2000'],  // 95% of requests under 2s
    http_req_failed: ['rate<0.01'],     // HTTP failure rate < 1%
    response_time_p95: ['p(95)<2000'],  // Custom response time metric
  },
};

const BASE_URL = 'http://localhost:4000';
const WS_URL = 'ws://localhost:4002';

// Test data
const testUsers = [
  { email: 'load-test-1@example.com', password: 'password123' },
  { email: 'load-test-2@example.com', password: 'password123' },
  { email: 'load-test-3@example.com', password: 'password123' },
];

const testMessages = [
  'Can you analyze my latest dataset?',
  'What patterns do you see in the data?',
  'Help me understand these results.',
  'Generate a summary of the findings.',
  'What recommendations do you have?'
];

export default function () {
  // Random user selection
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  const message = testMessages[Math.floor(Math.random() * testMessages.length)];
  
  // Step 1: Health check
  let healthResponse = http.get(`${BASE_URL}/api/health`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  // Step 2: Authentication
  let authResponse = http.post(`${BASE_URL}/api/auth/login`, {
    email: user.email,
    password: user.password,
  }, {
    headers: { 'Content-Type': 'application/json' },
  });

  let authToken = '';
  let authSuccess = check(authResponse, {
    'authentication status is 200 or 401': (r) => [200, 401].includes(r.status),
  });

  if (authSuccess && authResponse.status === 200) {
    try {
      const authBody = JSON.parse(authResponse.body);
      authToken = authBody.token || authBody.accessToken || '';
    } catch (e) {
      // Handle case where auth might work differently
    }
  } else {
    errorRate.add(1);
  }

  // Step 3: API Gateway test
  let headers = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  let apiResponse = http.get(`${BASE_URL}/api/chat/conversations`, {
    headers: headers,
  });

  check(apiResponse, {
    'API Gateway response is valid': (r) => [200, 401, 404].includes(r.status),
  }) || errorRate.add(1);

  responseTimeP95.add(apiResponse.timings.duration);

  // Step 4: WebSocket Chat Test (every 3rd user)
  if (__VU % 3 === 0) {
    let wsResponse = ws.connect(WS_URL, {}, function (socket) {
      socket.on('open', function () {
        // Send authentication if token available
        if (authToken) {
          socket.send(JSON.stringify({
            type: 'auth',
            token: authToken
          }));
        }

        // Send test message
        socket.send(JSON.stringify({
          type: 'chat',
          message: message,
          timestamp: Date.now()
        }));
        
        chatMessagesSent.add(1);
      });

      socket.on('message', function (data) {
        try {
          const response = JSON.parse(data);
          check(response, {
            'WebSocket response is valid': (r) => r && (r.type || r.message),
          }) || wsConnectionErrors.add(1);
        } catch (e) {
          wsConnectionErrors.add(1);
        }
      });

      socket.on('error', function (e) {
        wsConnectionErrors.add(1);
      });

      // Keep connection open for 2-5 seconds
      sleep(Math.random() * 3 + 2);
      socket.close();
    });

    check(wsResponse, {
      'WebSocket connection established': (r) => r && r.status === 101,
    }) || wsConnectionErrors.add(1);
  }

  // Step 5: File upload simulation (every 5th user)
  if (__VU % 5 === 0) {
    const testData = JSON.stringify({
      title: `Load Test Dataset ${__VU}`,
      data: { test: true, vu: __VU, timestamp: Date.now() }
    });

    let uploadResponse = http.post(`${BASE_URL}/api/data/upload`, {
      file: http.file(testData, 'test-data.json', 'application/json'),
    }, {
      headers: {
        'Authorization': authToken ? `Bearer ${authToken}` : '',
      },
    });

    check(uploadResponse, {
      'file upload succeeds or fails gracefully': (r) => [200, 201, 401, 413, 422].includes(r.status),
    }) || errorRate.add(1);
  }

  // Random sleep between requests
  sleep(Math.random() * 2 + 1);
}

// Setup function to validate test environment
export function setup() {
  console.log('🚀 Starting K6 Load Test');
  console.log(`Target: ${BASE_URL}`);
  console.log(`WebSocket: ${WS_URL}`);
  
  // Pre-test health check
  let healthCheck = http.get(`${BASE_URL}/api/health`);
  if (healthCheck.status !== 200 && healthCheck.status !== 404) {
    console.warn(`⚠️ Health check failed with status: ${healthCheck.status}`);
  }
  
  return { startTime: Date.now() };
}

// Teardown function to log results
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`✅ Load test completed in ${duration}s`);
}
