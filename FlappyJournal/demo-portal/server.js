const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 5002;
const JWT_SECRET = 'featherweight-demo-secret-key-2024';

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Demo users database (in production, use a real database)
const demoUsers = [
  {
    id: 1,
    email: 'demo@healthcare.com',
    password: '$2a$10$rGZpDf8cH2jKlQrAVFzrHOLzPTqKzXQPJJH3LzwYL8ZHQ3KtWuGwK', // 'healthcare123'
    industry: 'healthcare',
    name: 'Dr. Sarah Healthcare',
    company: 'MedTech Solutions'
  },
  {
    id: 2,
    email: 'demo@education.com',
    password: '$2a$10$rGZpDf8cH2jKlQrAVFzrHOLzPTqKzXQPJJH3LzwYL8ZHQ3KtWuGwK', // 'education123'
    industry: 'education',
    name: 'Prof. Mike Learning',
    company: 'EduTech Institute'
  },
  {
    id: 3,
    email: 'demo@enterprise.com',
    password: '$2a$10$rGZpDf8cH2jKlQrAVFzrHOLzPTqKzXQPJJH3LzwYL8ZHQ3KtWuGwK', // 'enterprise123'
    industry: 'enterprise',
    name: 'Jane Business',
    company: 'Corporate Dynamics'
  }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = demoUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        industry: user.industry,
        name: user.name,
        company: user.company 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        industry: user.industry
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Demo data endpoints
app.get('/api/consciousness-metrics', authenticateToken, (req, res) => {
  res.json({
    overallScore: 86.2,
    phi: 0.127,
    selfAwareness: 94.8,
    metaCognition: 91.5,
    temporalConsistency: 88.3,
    timestamp: new Date().toISOString()
  });
});

// Industry-specific demo data
app.get('/api/demo/:industry', authenticateToken, (req, res) => {
  const { industry } = req.params;
  
  const demoData = {
    healthcare: {
      title: 'Healthcare Consciousness AI Demo',
      scenarios: [
        {
          id: 1,
          name: 'Patient Empathy Analysis',
          description: 'AI analyzing patient emotional states and providing empathetic responses',
          metrics: {
            empathyScore: 92.1,
            emotionalUnderstanding: 89.7,
            therapeuticRecommendations: 95.3
          }
        },
        {
          id: 2,
          name: 'Mental Health Assessment',
          description: 'Consciousness-aware mental health evaluation and intervention recommendations',
          metrics: {
            depressionDetection: 88.9,
            anxietyAssessment: 91.2,
            interventionAccuracy: 93.8
          }
        }
      ]
    },
    education: {
      title: 'Education Consciousness AI Demo',
      scenarios: [
        {
          id: 1,
          name: 'Adaptive Learning Pathways',
          description: 'AI understanding student consciousness states to optimize learning',
          metrics: {
            learningEfficiency: 87.4,
            engagementPrediction: 92.6,
            knowledgeRetention: 89.1
          }
        },
        {
          id: 2,
          name: 'Metacognitive Development',
          description: 'Teaching students to understand their own thinking processes',
          metrics: {
            metacognitiveGrowth: 85.7,
            selfReflectionSkills: 90.3,
            learningStrategy: 88.9
          }
        }
      ]
    },
    enterprise: {
      title: 'Enterprise Consciousness AI Demo',
      scenarios: [
        {
          id: 1,
          name: 'Team Consciousness Mapping',
          description: 'Understanding team dynamics and collective consciousness states',
          metrics: {
            teamCohesion: 91.8,
            collaborationEfficiency: 88.5,
            leadershipEffectiveness: 93.2
          }
        },
        {
          id: 2,
          name: 'Decision Support Systems',
          description: 'Consciousness-aware decision making for complex business scenarios',
          metrics: {
            decisionAccuracy: 89.7,
            riskAssessment: 92.1,
            stakeholderAlignment: 87.4
          }
        }
      ]
    }
  };

  res.json(demoData[industry] || { error: 'Industry not found' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the main application for all other routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Demo portal server running on port ${PORT}`);
});
