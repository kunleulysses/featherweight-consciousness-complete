import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const wsConnectionErrors = new Counter('ws_connection_errors');
const apiResponseTime = new Trend('api_response_time');
const authFailures = new Rate('auth_failures');
const uploadFailures = new Rate('upload_failures');
const chatResponseTime = new Trend('chat_response_time');

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
export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up to 10 users
    { duration: '5m', target: 20 },  // Stay at 20 users
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '3m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.05'],     // Error rate under 5%
    ws_connection_errors: ['count<10'], // Less than 10 WS errors
    auth_failures: ['rate<0.01'],       // Auth failure rate under 1%
    upload_failures: ['rate<0.05'],     // Upload failure rate under 5%
    chat_response_time: ['p(90)<5000'], // 90% of chat responses under 5s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const WS_URL = __ENV.WS_URL || 'ws://localhost:4002';

export function setup() {
  // Setup phase - create test users and data
  console.log('Setting up load test environment...');
  
  const setupData = {
    users: [],
    testFiles: generateTestFiles(),
    chatMessages: generateChatMessages(),
  };
  
  // Create test users
  for (let i = 0; i < 10; i++) {
    const user = {
      email: `loadtest${i}@example.com`,
      password: 'LoadTest123!',
    };
    
    // Register user
    const registerResponse = http.post(`${BASE_URL}/api/auth/register`, {
      email: user.email,
      password: user.password,
      name: `Load Test User ${i}`,
    });
    
    if (registerResponse.status === 201 || registerResponse.status === 409) {
      setupData.users.push(user);
    }
  }
  
  console.log(`Created ${setupData.users.length} test users`);
  return setupData;
}

export default function(data) {
  const user = data.users[Math.floor(Math.random() * data.users.length)];
  const testFile = data.testFiles[Math.floor(Math.random() * data.testFiles.length)];
  const chatMessage = data.chatMessages[Math.floor(Math.random() * data.chatMessages.length)];
  
  // Scenario 1: Authentication Flow (30% of users)
  if (Math.random() < 0.3) {
    testAuthenticationFlow(user);
  }
  
  // Scenario 2: File Upload Flow (25% of users)
  else if (Math.random() < 0.55) {
    testFileUploadFlow(user, testFile);
  }
  
  // Scenario 3: Chat Interaction Flow (35% of users)
  else if (Math.random() < 0.9) {
    testChatFlow(user, chatMessage);
  }
  
  // Scenario 4: WebSocket Stress Test (10% of users)
  else {
    testWebSocketFlow(user);
  }
  
  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}

function testAuthenticationFlow(user) {
  const loginStart = Date.now();
  
  // Test login
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, {
    email: user.email,
    password: user.password,
  });
  
  const loginSuccess = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 1000ms': (r) => r.timings.duration < 1000,
    'login returns token': (r) => r.json('token') !== undefined,
  });
  
  authFailures.add(!loginSuccess);
  apiResponseTime.add(Date.now() - loginStart);
  
  if (loginSuccess) {
    const token = loginResponse.json('token');
    
    // Test authenticated endpoint
    const profileResponse = http.get(`${BASE_URL}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    check(profileResponse, {
      'profile fetch successful': (r) => r.status === 200,
      'profile has user data': (r) => r.json('email') === user.email,
    });
  }
}

function testFileUploadFlow(user, testFile) {
  // First authenticate
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, {
    email: user.email,
    password: user.password,
  });
  
  if (loginResponse.status !== 200) {
    uploadFailures.add(1);
    return;
  }
  
  const token = loginResponse.json('token');
  const uploadStart = Date.now();
  
  // Test file upload
  const uploadResponse = http.post(`${BASE_URL}/api/upload`, {
    file: http.file(testFile.content, testFile.filename, testFile.contentType),
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const uploadSuccess = check(uploadResponse, {
    'upload status is 200': (r) => r.status === 200,
    'upload response time < 5000ms': (r) => r.timings.duration < 5000,
    'upload returns file id': (r) => r.json('fileId') !== undefined,
  });
  
  uploadFailures.add(!uploadSuccess);
  apiResponseTime.add(Date.now() - uploadStart);
  
  if (uploadSuccess) {
    // Test file processing status
    const fileId = uploadResponse.json('fileId');
    sleep(2); // Wait for processing
    
    const statusResponse = http.get(`${BASE_URL}/api/files/${fileId}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    check(statusResponse, {
      'file status check successful': (r) => r.status === 200,
      'file processing completed': (r) => r.json('status') === 'processed',
    });
  }
}

function testChatFlow(user, chatMessage) {
  // Authenticate
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, {
    email: user.email,
    password: user.password,
  });
  
  if (loginResponse.status !== 200) return;
  
  const token = loginResponse.json('token');
  const chatStart = Date.now();
  
  // Send chat message
  const chatResponse = http.post(`${BASE_URL}/api/chat/message`, {
    message: chatMessage,
    stream: false, // Non-streaming for load test
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const chatSuccess = check(chatResponse, {
    'chat status is 200': (r) => r.status === 200,
    'chat response time < 10000ms': (r) => r.timings.duration < 10000,
    'chat returns response': (r) => r.json('response') !== undefined,
  });
  
  chatResponseTime.add(Date.now() - chatStart);
  
  if (chatSuccess) {
    // Test chat history
    const historyResponse = http.get(`${BASE_URL}/api/chat/history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    check(historyResponse, {
      'chat history accessible': (r) => r.status === 200,
      'history contains messages': (r) => r.json('messages').length > 0,
    });
  }
}

function testWebSocketFlow(user) {
  // Authenticate first
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, {
    email: user.email,
    password: user.password,
  });
  
  if (loginResponse.status !== 200) return;
  
  const token = loginResponse.json('token');
  
  // Test WebSocket connection
  const wsResponse = ws.connect(`${WS_URL}?token=${token}`, {}, function(socket) {
    socket.on('open', () => {
      console.log('WebSocket connected');
      
      // Send a test message
      socket.send(JSON.stringify({
        type: 'chat',
        message: 'WebSocket load test message',
      }));
    });
    
    socket.on('message', (data) => {
      const message = JSON.parse(data);
      check(message, {
        'ws message has type': (m) => m.type !== undefined,
        'ws message has content': (m) => m.content !== undefined || m.response !== undefined,
      });
    });
    
    socket.on('error', (error) => {
      console.log('WebSocket error:', error);
      wsConnectionErrors.add(1);
    });
    
    // Keep connection open for 10 seconds
    sleep(10);
    socket.close();
  });
  
  if (!wsResponse) {
    wsConnectionErrors.add(1);
  }
}

function generateTestFiles() {
  return [
    {
      filename: 'journal1.txt',
      content: 'Today was a great day. I felt really productive and accomplished many tasks.',
      contentType: 'text/plain',
    },
    {
      filename: 'thoughts.md',
      content: '# Daily Thoughts\n\nReflecting on my goals and aspirations for the future.',
      contentType: 'text/markdown',
    },
    {
      filename: 'notes.txt',
      content: 'Meeting notes:\n- Discussed project timeline\n- Reviewed budget constraints\n- Planned next steps',
      contentType: 'text/plain',
    },
  ];
}

function generateChatMessages() {
  return [
    'Can you analyze my recent journal entries?',
    'What patterns do you see in my writing?',
    'How has my mood changed over time?',
    'Give me insights about my productivity levels.',
    'What are the main themes in my thoughts?',
    'Can you help me identify areas for improvement?',
    'Summarize my key accomplishments this week.',
    'What advice do you have based on my entries?',
  ];
}

export function teardown(data) {
  console.log('Cleaning up load test environment...');
  
  // Optional: Clean up test data
  // This would typically involve deleting test users and uploaded files
  // For safety, we'll skip this in the load test
  
  console.log('Load test completed');
}
