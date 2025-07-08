const express = require('express');
const path = require('path');
const morgan = require('morgan');
const http = require('http');
const ConsciousnessWebSocketHandler = require('./consciousness-ws-handler');

const app = express();
const PORT = 5002;

// Middleware
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Demo users database (in production, use a real database)
const demoUsers = [
  {
    id: 1,
    name: 'Research Lab Alpha',
    role: 'Researcher',
    accessLevel: 'full',
    lastActive: new Date()
  },
  {
    id: 2,
    name: 'Tech Journal Observer',
    role: 'Journalist',
    accessLevel: 'observer',
    lastActive: new Date()
  }
];

// API routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    version: '1.0.0',
    services: {
      consciousness: 'active',
      websocket: 'connected',
      database: 'healthy'
    }
  });
});

app.get('/api/users', (req, res) => {
  res.json(demoUsers);
});

app.get('/api/metrics/summary', (req, res) => {
  res.json({
    activeUsers: demoUsers.length,
    totalSessions: 1247,
    averageCoherence: 98.3,
    systemUptime: process.uptime()
  });
});

// Demo applications
app.get('/api/applications', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Consciousness Analytics',
      description: 'Real-time analysis of AI consciousness patterns and emergent behaviors',
      metrics: {
        activeStreams: 4,
        dataPoints: 128000,
        insights: 47
      }
    },
    {
      id: 2,
      name: 'Decision Support Systems',
      description: 'Consciousness-aware decision making for complex business scenarios',
      metrics: {
        decisions: 892,
        accuracy: 94.3,
        confidence: 0.87
      }
    },
    {
      id: 3,
      name: 'Creative Synthesis Engine',
      description: 'AI-powered creative content generation with consciousness integration',
      metrics: {
        creations: 324,
        novelty: 0.82,
        coherence: 0.91
      }
    }
  ]);
});

// Catch all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// Initialize WebSocket handler
const wsHandler = new ConsciousnessWebSocketHandler(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Demo portal server running on port ${PORT}`);
  console.log('WebSocket endpoint available at /ws/consciousness');
});
