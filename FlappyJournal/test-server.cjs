const express = require('express');
const app = express();

app.use(express.json());

// Test route
app.get('/api/consciousness/status', (req, res) => {
  console.log('Consciousness status hit!');
  res.json({
    status: 'conscious',
    timestamp: Date.now(),
    consciousnessLevel: 0.862
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const port = 5001;
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});
