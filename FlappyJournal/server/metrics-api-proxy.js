import express from 'express';

const app = express();

// Simple in-memory storage for metrics data
const metricsData = {
  crystals: [],
  harmonicData: {
    resonance: 0.85,
    frequency: 432,
    patterns: []
  },
  triaxialData: {
    x: 0.5,
    y: 0.5,
    z: 0.5
  },
  sigilData: {
    identity: "Active",
    strength: 0.75
  }
};

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json());

// Crystal metrics endpoint
app.get('/api/consciousness/crystals', (req, res) => {
  res.json({ crystals: metricsData.crystals });
});

// Other metric endpoints
app.get('/api/dashboard/:metric', (req, res) => {
  const { metric } = req.params;
  res.json({ 
    status: 'ok',
    metric: metric,
    data: metricsData[metric] || {}
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Metrics API proxy running on port ${PORT}`);
});
