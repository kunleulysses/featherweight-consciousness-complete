#!/usr/bin/env node

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testAccessCode(code, email = null) {
  console.log(`\n🔓 Testing access code: ${code}`);
  
  try {
    const response = await fetch(`${API_URL}/api/validate-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessCode: code,
        email: email,
        timestamp: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Access granted!`);
      console.log(`   Message: ${result.message}`);
      console.log(`   Access Level: ${result.accessLevel}`);
      console.log(`   User Level: ${result.userLevel}`);
      console.log(`   Session Duration: ${result.sessionDuration}`);
    } else {
      console.log(`❌ Access denied!`);
      console.log(`   Message: ${result.message}`);
      console.log(`   Reason: ${result.reason}`);
    }
    
  } catch (error) {
    console.error(`🚨 Error testing access code:`, error.message);
  }
}

async function getAccessStats() {
  console.log(`\n📊 Fetching access statistics...`);
  
  try {
    const response = await fetch(`${API_URL}/api/admin/access-stats`);
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Access statistics:`);
      console.log(`   Total codes: ${result.stats.totalCodes}`);
      console.log(`   Active codes: ${result.stats.activeCodes}`);
      console.log(`   Total attempts: ${result.stats.totalAttempts}`);
      console.log(`   Successful attempts: ${result.stats.successfulAttempts}`);
      console.log(`   Success rate: ${result.stats.successRate}`);
      console.log(`   Recent activity (24h): ${result.stats.recentActivity24h}`);
      console.log(`   Global code active: ${result.stats.globalCodeActive}`);
    } else {
      console.log(`❌ Failed to fetch stats: ${result.message}`);
    }
    
  } catch (error) {
    console.error(`🚨 Error fetching stats:`, error.message);
  }
}

async function runTests() {
  console.log(`🚀 Testing Featherweight Access Code System`);
  console.log(`🌐 API URL: ${API_URL}`);
  
  // Test valid global access code
  await testAccessCode('g00dnews', 'test@featherweight.world');
  
  // Test invalid access code
  await testAccessCode('wrongcode', 'test@featherweight.world');
  
  // Test empty access code
  await testAccessCode('', 'test@featherweight.world');
  
  // Test without email
  await testAccessCode('g00dnews');
  
  // Get statistics
  await getAccessStats();
  
  console.log(`\n🎉 Access code testing complete!`);
  console.log(`💡 Use access code "g00dnews" to access the full platform`);
}

// Run tests
runTests().catch(console.error);
