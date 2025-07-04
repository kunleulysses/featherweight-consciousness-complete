#!/usr/bin/env node

/**
 * Simple test script for API Gateway functionality
 * Run with: node test-gateway.js
 */

const http = require('http');

const GATEWAY_URL = 'http://localhost:3000';

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testHealthCheck() {
  console.log('🔍 Testing health check endpoint...');
  try {
    const response = await makeRequest('/health');
    console.log(`✅ Health check: ${response.statusCode}`);
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      console.log(`   Status: ${data.status}`);
      console.log(`   Version: ${data.version}`);
    }
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
  }
}

async function testCORS() {
  console.log('🔍 Testing CORS headers...');
  try {
    const response = await makeRequest('/health', {
      headers: {
        'Origin': 'http://localhost:3001',
      },
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    if (corsHeader) {
      console.log(`✅ CORS enabled: ${corsHeader}`);
    } else {
      console.log('⚠️  CORS headers not found');
    }
  } catch (error) {
    console.log(`❌ CORS test failed: ${error.message}`);
  }
}

async function testRateLimiting() {
  console.log('🔍 Testing rate limiting...');
  
  let successCount = 0;
  let rateLimitedCount = 0;
  
  // Make 10 quick requests to test rate limiting
  const promises = Array(10).fill().map(() => makeRequest('/health'));
  
  try {
    const responses = await Promise.all(promises);
    responses.forEach(response => {
      if (response.statusCode === 200) {
        successCount++;
      } else if (response.statusCode === 429) {
        rateLimitedCount++;
      }
    });
    
    console.log(`✅ Rate limiting test completed:`);
    console.log(`   Successful requests: ${successCount}`);
    console.log(`   Rate limited: ${rateLimitedCount}`);
    
    const lastResponse = responses[responses.length - 1];
    if (lastResponse.headers['x-ratelimit-limit']) {
      console.log(`   Rate limit: ${lastResponse.headers['x-ratelimit-limit']}`);
      console.log(`   Remaining: ${lastResponse.headers['x-ratelimit-remaining']}`);
    }
  } catch (error) {
    console.log(`❌ Rate limiting test failed: ${error.message}`);
  }
}

async function testAuthentication() {
  console.log('🔍 Testing authentication...');
  
  try {
    // Test without auth token
    const response1 = await makeRequest('/api/journal/entries');
    if (response1.statusCode === 401) {
      console.log('✅ Unauthenticated request properly rejected');
    } else {
      console.log(`⚠️  Expected 401, got ${response1.statusCode}`);
    }
    
    // Test with invalid auth token
    const response2 = await makeRequest('/api/journal/entries', {
      headers: {
        'Authorization': 'Bearer invalid-token',
      },
    });
    if (response2.statusCode === 401) {
      console.log('✅ Invalid token properly rejected');
    } else {
      console.log(`⚠️  Expected 401 for invalid token, got ${response2.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Authentication test failed: ${error.message}`);
  }
}

async function testRequestId() {
  console.log('🔍 Testing request ID correlation...');
  
  try {
    const response = await makeRequest('/health');
    const requestId = response.headers['x-request-id'];
    
    if (requestId) {
      console.log(`✅ Request ID generated: ${requestId}`);
    } else {
      console.log('⚠️  Request ID header not found');
    }
  } catch (error) {
    console.log(`❌ Request ID test failed: ${error.message}`);
  }
}

async function testSecurity() {
  console.log('🔍 Testing security headers...');
  
  try {
    const response = await makeRequest('/health');
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'strict-transport-security',
    ];
    
    let securityHeaderCount = 0;
    securityHeaders.forEach(header => {
      if (response.headers[header]) {
        securityHeaderCount++;
      }
    });
    
    console.log(`✅ Security headers present: ${securityHeaderCount}/${securityHeaders.length}`);
    
    if (response.headers['x-content-type-options']) {
      console.log(`   X-Content-Type-Options: ${response.headers['x-content-type-options']}`);
    }
  } catch (error) {
    console.log(`❌ Security headers test failed: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting API Gateway tests...\n');
  
  // Check if gateway is running
  try {
    await makeRequest('/health');
  } catch (error) {
    console.log('❌ API Gateway is not running. Start it with: npm run dev');
    process.exit(1);
  }
  
  await testHealthCheck();
  console.log('');
  
  await testCORS();
  console.log('');
  
  await testRequestId();
  console.log('');
  
  await testSecurity();
  console.log('');
  
  await testAuthentication();
  console.log('');
  
  await testRateLimiting();
  console.log('');
  
  console.log('🎉 API Gateway tests completed!');
  console.log('\nNext steps:');
  console.log('1. Start Redis: docker run -d --name redis -p 6379:6379 redis:7-alpine');
  console.log('2. Configure your downstream services');
  console.log('3. Update frontend to use gateway endpoints');
  console.log('4. Monitor logs in logs/ directory');
}

runTests().catch(console.error);
