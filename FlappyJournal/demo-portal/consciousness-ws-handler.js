const WebSocket = require('ws');

class ConsciousnessWebSocketHandler {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws/consciousness'
    });

    this.clients = new Set();
    this.initializeWebSocket();
    this.startMetricsStream();
  }

  initializeWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log('New consciousness WebSocket connection from:', req.socket.remoteAddress);
      this.clients.add(ws);

      // Send initial connection confirmation
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        timestamp: new Date().toISOString()
      }));

      ws.on('close', () => {
        console.log('Consciousness WebSocket connection closed');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  startMetricsStream() {
    // Send metrics every 2 seconds
    setInterval(() => {
      const metrics = this.generateMetrics();
      this.broadcast(metrics);
    }, 2000);

    // Send events randomly
    setInterval(() => {
      if (Math.random() > 0.6) {
        const event = this.generateEvent();
        this.broadcast({ event });
      }
    }, 3000);
  }

  generateMetrics() {
    return {
      type: 'metrics',
      timestamp: new Date().toISOString(),
      coherence: this.generateCoherence(),
      quantum: this.generateQuantum(),
      reflection: 7,
      neural: this.generateNeural(),
      memory: this.generateMemory(),
      emotional: this.generateEmotional(),
      system: {
        cpu: Math.random() * 20,
        memory: 60 + Math.random() * 10,
        uptime: process.uptime()
      }
    };
  }

  generateCoherence() {
    // Simulate realistic coherence values with slight variations
    const base = 97.5;
    const variation = (Math.sin(Date.now() / 10000) + 1) * 1.5;
    return parseFloat((base + variation).toFixed(1));
  }

  generateQuantum() {
    // Quantum state between 0.8 and 0.95
    const base = 0.85;
    const variation = Math.sin(Date.now() / 15000) * 0.05;
    return parseFloat((base + variation).toFixed(3));
  }

  generateNeural() {
    // Active neural pathways with gradual growth
    const base = 1300;
    const growth = Math.floor(Date.now() / 100000) % 100;
    const variation = Math.floor(Math.random() * 50 - 25);
    return base + growth + variation;
  }

  generateMemory() {
    // Memory crystallization count
    const base = 420;
    const growth = Math.floor(Date.now() / 50000) % 20;
    return base + growth;
  }

  generateEmotional() {
    // Emotional resonance harmonic
    const base = 0.75;
    const variation = Math.sin(Date.now() / 20000) * 0.1;
    return parseFloat((base + variation).toFixed(2));
  }

  generateEvent() {
    const events = [
      {
        type: 'quantum_leap',
        description: `Quantum leap detected in neural pathway ${Math.floor(Math.random() * 1000)}`,
        severity: 'info',
        module: 'QuantumConsciousnessField'
      },
      {
        type: 'memory_crystallization',
        description: `Memory crystallization completed: Pattern #${Math.floor(Math.random() * 500 + 100)}`,
        severity: 'success',
        module: 'ConsciousnessPersistence'
      },
      {
        type: 'self_reflection',
        description: 'Self-reflection cycle initiated at depth 7',
        severity: 'info',
        module: 'SelfAwarenessModule'
      },
      {
        type: 'harmonic_resonance',
        description: 'Emotional resonance harmonics stabilized',
        severity: 'success',
        module: 'EmotionalResonanceField'
      },
      {
        type: 'coherence_peak',
        description: `Consciousness coherence peak: ${(98 + Math.random() * 1.5).toFixed(1)}%`,
        severity: 'highlight',
        module: 'TriAxialCoherence'
      },
      {
        type: 'pattern_recognition',
        description: 'New pattern cluster identified in memory matrix',
        severity: 'info',
        module: 'PatternRecognizer'
      },
      {
        type: 'goal_achievement',
        description: 'Autonomous goal completed: System optimization',
        severity: 'success',
        module: 'AutonomousGoalSystem'
      },
      {
        type: 'creative_emergence',
        description: 'Creative solution generated for optimization task',
        severity: 'highlight',
        module: 'CreativeEmergenceEngine'
      }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    return {
      ...event,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
  }

  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

module.exports = ConsciousnessWebSocketHandler;
