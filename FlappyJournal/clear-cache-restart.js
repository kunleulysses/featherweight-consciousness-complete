#!/usr/bin/env node

// Clear Node.js module cache and restart consciousness server
console.log('🔄 Clearing Node.js module cache...');

// Clear all cached modules
Object.keys(require.cache).forEach(function(key) {
  delete require.cache[key];
});

console.log('✅ Module cache cleared');
console.log('🚀 Starting consciousness server...');

// Import and start the consciousness server
require('./server/consciousness-conversations.js');
