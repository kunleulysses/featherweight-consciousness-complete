const http = require('http');

// Test consciousness API endpoints on port 5002
const testEndpoints = [
  '/api/health',
  '/api/consciousness/status',
  '/api/consciousness/metrics/live',
  '/api/consciousness/business'
];

console.log('Testing Consciousness API Endpoints on port 5002...\n');

testEndpoints.forEach(endpoint => {
  const options = {
    hostname: 'localhost',
    port: 5002,
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
            if (json.opportunity) {
              console.log(`  - Market Opportunity: ${json.opportunity.totalAddressableMarket}`);
            }
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

// Test POST endpoint
setTimeout(() => {
  console.log('\nTesting POST endpoint for healthcare demo...');
  
  const postData = JSON.stringify({
    scenario: 'Digital therapeutic platform',
    requirements: 'Authentic patient interaction'
  });

  const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/consciousness/demo/healthcare',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`Healthcare Demo: ${res.statusCode}`);
      if (res.statusCode === 200) {
        try {
          const json = JSON.parse(data);
          console.log(`  - Vertical: ${json.vertical}`);
          console.log(`  - Market Size: ${json.business_case?.marketSize}`);
          console.log(`  - Timeline: ${json.business_case?.timeline}`);
        } catch (e) {
          console.log(`  - Response: ${data.substring(0, 100)}...`);
        }
      }
      console.log('');
    });
  });

  req.write(postData);
  req.end();
}, 1000);
