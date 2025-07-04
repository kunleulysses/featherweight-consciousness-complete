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
// Test configuration for 1000 VUs for 5 minutes
export let options = {
  stages: [
    { duration: '30s', target: 250 },   // Ramp up to 250 users
    { duration: '30s', target: 500 },   // Scale to 500 users  
    { duration: '1m', target: 1000 },   // Scale to 1000 users (1k VU)
    { duration: '5m', target: 1000 },   // Stay at 1000 users for 5 minutes (main test)
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    'error_rate': ['rate<0.01'],           // Error rate < 1% (0.01)
    'checks{type:hz}': ['avg>95'],         // Hz checks average > 95
    'ws_connection_time': ['p(95)<5000'],  // 95% of WS connections under 5s
    'message_response_time': ['p(90)<10000'], // 90% of message responses under 10s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const WS_URL = __ENV.WS_URL || 'ws://localhost:8080';
const CHAT_ORCHESTRATOR_URL = __ENV.CHAT_ORCHESTRATOR_URL || 'http://localhost:8080';

// Test chat messages for realistic WebSocket streaming
const testMessages = [
  'Hello, can you help me analyze my thoughts?',
  'What patterns do you see in my behavior?',
  'Can you provide insights on my productivity?',
  'Help me understand my emotional state.',
  'What recommendations do you have for me?',
  'Analyze my recent activities and suggest improvements.',
  'What are the key themes in my recent thoughts?',
  'Can you help me set better goals for next week?'
];

export function setup() {
  console.log('🚀 Starting WebSocket Streaming Load Test');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`WebSocket URL: ${WS_URL}`);
  console.log(`Chat Orchestrator: ${CHAT_ORCHESTRATOR_URL}`);
  
  // Verify metrics endpoint is available
  let metricsCheck = http.get(`${BASE_URL}/metrics`);
  if (metricsCheck.status !== 200) {
    console.warn(`⚠️ Metrics endpoint not responding correctly: ${metricsCheck.status}`);
  }
  
  // Verify chat orchestrator health
  let healthCheck = http.get(`${CHAT_ORCHESTRATOR_URL}/healthz`);
  if (healthCheck.status !== 200) {
    console.warn(`⚠️ Chat orchestrator health check failed: ${healthCheck.status}`);
  }
  
  return { startTime: Date.now() };
}

export default function() {
  // Step 1: Check 100 Hz backend loop metric via /metrics
  checkBackendLoopMetrics();
  
  // Step 2: Establish WebSocket connection and stream chat
  testWebSocketStreaming();
  
  // Random sleep to simulate realistic user behavior
  sleep(Math.random() * 2 + 1);
}

function checkBackendLoopMetrics() {
  let startTime = Date.now();
  
  let metricsResponse = http.get(`${BASE_URL}/metrics`);
  
  let metricsSuccess = check(metricsResponse, {
    'metrics endpoint responds': (r) => r.status === 200,
    'metrics response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  if (!metricsSuccess) {
    error_rate.add(1);
    return;
  }
  
  // Parse Hz metric from response (assuming Prometheus format)
  let metricsBody = metricsResponse.body;
  let hzMatch = metricsBody.match(/consciousness_loop_hz\s+(\d+\.?\d*)/);
  
  if (hzMatch) {
    let currentHz = parseFloat(hzMatch[1]);
    hz_avg.add(currentHz);
    
    // Add check for Hz > 95
    let hzCheck = check(currentHz, {
      'consciousness loop Hz > 95': (hz) => hz > 95,
    });
    
    hz_checks.add(1, { type: 'hz' });
    
    if (!hzCheck) {
      error_rate.add(1);
    }
  } else {
    // Try alternative metric formats
    let healthResponse = http.get(`${CHAT_ORCHESTRATOR_URL}/healthz`);
    if (healthResponse.status === 200) {
      try {
        let healthData = JSON.parse(healthResponse.body);
        if (healthData.hz) {
          let currentHz = healthData.hz;
          hz_avg.add(currentHz);
          
          let hzCheck = check(currentHz, {
            'consciousness loop Hz > 95': (hz) => hz > 95,
          });
          
          hz_checks.add(1, { type: 'hz' });
          
          if (!hzCheck) {
            error_rate.add(1);
          }
        }
      } catch (e) {
        error_rate.add(1);
      }
    } else {
      error_rate.add(1);
    }
  }
}

function testWebSocketStreaming() {
  let connectionStart = Date.now();
  let message = testMessages[Math.floor(Math.random() * testMessages.length)];
  let messageId = `msg_${__VU}_${Date.now()}`;
  
  let wsResponse = ws.connect(`${WS_URL}/chat`, {}, function(socket) {
    let connectionTime = Date.now() - connectionStart;
    ws_connection_time.add(connectionTime);
    
    let messageStart = Date.now();
    let responseReceived = false;
    
    socket.on('open', function() {
      // Send chat message for streaming
      socket.send(JSON.stringify({
        type: 'chat',
        content: message,
        messageId: messageId,
        userId: `user_${__VU}`,
        timestamp: Date.now()
      }));
    });
    
    socket.on('message', function(data) {
      try {
        let response = JSON.parse(data);
        
        let messageCheck = check(response, {
          'WebSocket message is valid': (r) => r && (r.type || r.content),
          'Message has correct structure': (r) => r.type && (r.event || r.content),
        });
        
        if (!messageCheck) {
          error_rate.add(1);
        }
        
        // Check if this is a completion or final response
        if (response.type === 'stream_event' && response.event && response.event.type === 'complete') {
          responseReceived = true;
          let responseTime = Date.now() - messageStart;
          message_response_time.add(responseTime);
        }
        
        // For streaming responses, also track individual tokens
        if (response.type === 'stream_event' && response.event && response.event.type === 'token') {
          // Each token received is a good sign of streaming
          check(response.event, {
            'Streaming token received': (event) => event.data !== undefined,
          });
        }
        
      } catch (e) {
        error_rate.add(1);
      }
    });
    
    socket.on('error', function(e) {
      error_rate.add(1);
      console.log(`WebSocket error: ${e}`);
    });
    
    socket.on('close', function() {
      if (!responseReceived) {
        // Connection closed without proper response
        error_rate.add(1);
      }
    });
    
    // Keep connection open for streaming (up to 15 seconds)
    sleep(Math.random() * 10 + 5);
    socket.close();
  });
  
  let wsConnectionCheck = check(wsResponse, {
    'WebSocket connection established': (r) => r && r.status === 101,
  });
  
  if (!wsConnectionCheck) {
    error_rate.add(1);
  }
}

export function teardown(data) {
  let duration = (Date.now() - data.startTime) / 1000;
  console.log(`✅ WebSocket Streaming Load Test completed in ${duration}s`);
  console.log('📊 Check the thresholds to ensure:');
  console.log('   - error_rate < 0.01 (1%)');
  console.log('   - checks{type:hz}.avg > 95');
}
