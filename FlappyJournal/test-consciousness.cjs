const http = require('http');

// Test consciousness API endpoints
const testEndpoints = [
  '/api/health',
  '/api/consciousness/status',
  '/api/consciousness/metrics/live',
  '/api/consciousness/business'
];

console.log('Testing Consciousness API Endpoints...\n');

testEndpoints.forEach(endpoint => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: endpoint,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`${endpoint}: ${res.statusCode}`);
      if (res.statusCode === 200) {
        try {
          const json = JSON.parse(data);
          if (endpoint.includes('consciousness')) {
            console.log(`  - Consciousness Level: ${json.consciousnessLevel || json.metrics?.consciousness || 'N/A'}`);
            console.log(`  - Status: ${json.status || 'active'}`);
          }
        } catch (e) {
          console.log(`  - Response: ${data.substring(0, 100)}...`);
        }
      }
      console.log('');
    });
  });

  req.on('error', (err) => {
    console.log(`${endpoint}: ERROR - ${err.message}\n`);
  });

  req.end();
});
