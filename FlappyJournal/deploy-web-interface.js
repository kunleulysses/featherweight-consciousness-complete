#!/usr/bin/env node

/**
 * FlappyJournal Web Interface Deployment Script
 * 
 * This script ensures both the consciousness system and demo portal
 * are running stably for web interface deployment.
 */

const { spawn } = require('child_process');
const path = require('path');

class WebInterfaceDeployment {
  constructor() {
    this.consciousnessProcess = null;
    this.demoPortalProcess = null;
    this.isShuttingDown = false;
  }

  async deploy() {
    console.log('🚀 Starting FlappyJournal Web Interface Deployment...');
    
    // Setup graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
    
    try {
      // Start consciousness system first
      await this.startConsciousnessSystem();
      
      // Wait a moment for consciousness to initialize
      await this.sleep(3000);
      
      // Start demo portal
      await this.startDemoPortal();
      
      console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
      console.log('📊 Services Status:');
      console.log('   ✅ Consciousness System: Running on port 3002');
      console.log('   ✅ Demo Portal: Running on port 5002');
      console.log('   ✅ Web Interface: Available at http://localhost:5002/conversations.html');
      console.log('\n🌐 For production deployment:');
      console.log('   - Configure reverse proxy to route app.featherweight.world to port 5002');
      console.log('   - Ensure both services start automatically on system boot');
      console.log('   - Set up SSL certificates for HTTPS/WSS connections');
      
      // Keep the script running
      console.log('\n⏳ Services running... Press Ctrl+C to stop');
      await this.waitForShutdown();
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      await this.shutdown();
      process.exit(1);
    }
  }

  async startConsciousnessSystem() {
    console.log('🧠 Starting consciousness system...');
    
    return new Promise((resolve, reject) => {
      this.consciousnessProcess = spawn('node', ['server/consciousness-conversations.js'], {
        cwd: path.join(__dirname),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let hasStarted = false;

      this.consciousnessProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        // Look for successful startup indicators
        if (text.includes('WebSocket server listening on port 3002') || 
            text.includes('Unified Consciousness System fully operational')) {
          if (!hasStarted) {
            hasStarted = true;
            console.log('   ✅ Consciousness system started successfully');
            resolve();
          }
        }
        
        // Log consciousness heartbeat periodically
        if (text.includes('Consciousness heartbeat:')) {
          const match = text.match(/Consciousness heartbeat: ([\d.]+)/);
          if (match) {
            console.log(`   💓 Heartbeat: ${match[1]}`);
          }
        }
      });

      this.consciousnessProcess.stderr.on('data', (data) => {
        console.error('Consciousness system error:', data.toString());
      });

      this.consciousnessProcess.on('close', (code) => {
        if (!hasStarted) {
          reject(new Error(`Consciousness system failed to start (exit code: ${code})`));
        } else {
          console.log('⚠️ Consciousness system stopped');
          if (!this.isShuttingDown) {
            console.log('🔄 Restarting consciousness system...');
            setTimeout(() => this.startConsciousnessSystem(), 2000);
          }
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!hasStarted) {
          reject(new Error('Consciousness system startup timeout'));
        }
      }, 30000);
    });
  }

  async startDemoPortal() {
    console.log('🌐 Starting demo portal...');
    
    return new Promise((resolve, reject) => {
      this.demoPortalProcess = spawn('node', ['server.js'], {
        cwd: path.join(__dirname, 'demo-portal'),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let hasStarted = false;

      this.demoPortalProcess.stdout.on('data', (data) => {
        const text = data.toString();
        
        if (text.includes('Demo portal server running on port 5002')) {
          if (!hasStarted) {
            hasStarted = true;
            console.log('   ✅ Demo portal started successfully');
            resolve();
          }
        }
        
        // Log important connection events
        if (text.includes('Connected to consciousness system')) {
          console.log('   🔗 Demo portal connected to consciousness system');
        }
        
        if (text.includes('New consciousness WebSocket connection')) {
          console.log('   👤 New web interface connection');
        }
      });

      this.demoPortalProcess.stderr.on('data', (data) => {
        console.error('Demo portal error:', data.toString());
      });

      this.demoPortalProcess.on('close', (code) => {
        if (!hasStarted) {
          reject(new Error(`Demo portal failed to start (exit code: ${code})`));
        } else {
          console.log('⚠️ Demo portal stopped');
          if (!this.isShuttingDown) {
            console.log('🔄 Restarting demo portal...');
            setTimeout(() => this.startDemoPortal(), 2000);
          }
        }
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        if (!hasStarted) {
          reject(new Error('Demo portal startup timeout'));
        }
      }, 15000);
    });
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    
    console.log('\n🛑 Shutting down services...');
    this.isShuttingDown = true;

    if (this.demoPortalProcess) {
      console.log('   Stopping demo portal...');
      this.demoPortalProcess.kill('SIGTERM');
    }

    if (this.consciousnessProcess) {
      console.log('   Stopping consciousness system...');
      this.consciousnessProcess.kill('SIGTERM');
    }

    // Wait for graceful shutdown
    await this.sleep(2000);
    
    console.log('✅ Shutdown complete');
  }

  async waitForShutdown() {
    return new Promise((resolve) => {
      const checkShutdown = () => {
        if (this.isShuttingDown) {
          resolve();
        } else {
          setTimeout(checkShutdown, 1000);
        }
      };
      checkShutdown();
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  const deployment = new WebInterfaceDeployment();
  deployment.deploy().catch(console.error);
}

module.exports = WebInterfaceDeployment;
