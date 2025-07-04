FROM grafana/k6:latest

# Set working directory
WORKDIR /scripts

# Copy all k6 test scripts
COPY *.js ./

# Copy any configuration files if they exist
COPY *.json ./ 2>/dev/null || true

# Set default command to run the WebSocket streaming load test
CMD ["run", "--vus", "1000", "--duration", "5m", "websocket-streaming-load-test.js"]

# Add labels for identification
LABEL description="K6 Load Testing Suite for Featherweight Chat API"
LABEL version="1.0.0"
LABEL test.type="websocket-streaming"
LABEL test.target="api/chat"
LABEL test.vus="1000"
LABEL test.duration="5m"

# Environment variables with defaults
ENV BASE_URL=http://localhost:4000
ENV WS_URL=ws://localhost:8080
ENV CHAT_ORCHESTRATOR_URL=http://localhost:8080

# Add health check script
COPY <<'HEALTH_EOF' /scripts/health-check.js
import http from 'k6/http';

export let options = {
  vus: 1,
  duration: '10s',
  thresholds: {
    http_req_failed: ['rate<0.1'],
  },
};

export default function() {
  let baseUrl = __ENV.BASE_URL || 'http://localhost:4000';
  let wsUrl = __ENV.WS_URL || 'ws://localhost:8080';
  
  // Quick health checks
  let metricsCheck = http.get(`${baseUrl}/metrics`);
  let healthCheck = http.get(`${wsUrl}/healthz`);
  
  console.log(`Metrics endpoint: ${metricsCheck.status}`);
  console.log(`Health endpoint: ${healthCheck.status}`);
}
HEALTH_EOF

# Add entrypoint script for different test modes
COPY <<'ENTRYPOINT_EOF' /scripts/entrypoint.sh
#!/bin/bash

# Default values
TEST_TYPE=${TEST_TYPE:-"websocket-streaming"}
VUS=${VUS:-1000}
DURATION=${DURATION:-"5m"}

case "$TEST_TYPE" in
  "health")
    echo "Running health check..."
    k6 run health-check.js
    ;;
  "websocket-streaming")
    echo "Running WebSocket streaming load test..."
    echo "VUs: $VUS, Duration: $DURATION"
    k6 run --vus $VUS --duration $DURATION websocket-streaming-load-test.js
    ;;
  "comprehensive")
    echo "Running comprehensive load test..."
    k6 run --vus $VUS --duration $DURATION comprehensive-load-test.js
    ;;
  "custom")
    echo "Running custom test: $CUSTOM_SCRIPT"
    k6 run ${CUSTOM_ARGS:-} ${CUSTOM_SCRIPT:-"load-test.js"}
    ;;
  *)
    echo "Unknown test type: $TEST_TYPE"
    echo "Available types: health, websocket-streaming, comprehensive, custom"
    exit 1
    ;;
esac
ENTRYPOINT_EOF

RUN chmod +x /scripts/entrypoint.sh

ENTRYPOINT ["/scripts/entrypoint.sh"]
