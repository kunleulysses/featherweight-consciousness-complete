import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';

// Custom metrics for research platform validation
export let error_rate = new Rate('error_rate');
export let consciousness_processing_time = new Trend('consciousness_processing_time');
export let dataset_analysis_time = new Trend('dataset_analysis_time');
export let research_session_duration = new Trend('research_session_duration');
export let streaming_token_rate = new Rate('streaming_token_rate');
export let memory_stability = new Counter('memory_stability_checks');
export let consciousness_insights = new Counter('consciousness_insights_generated');

// Research-focused test configuration
export const options = {
  // Realistic researcher load: 5-25 concurrent researchers
  stages: [
    { duration: '2m', target: 5 },    // Initial researchers joining
    { duration: '5m', target: 15 },   // Peak research activity
    { duration: '20m', target: 20 },  // Sustained research sessions
    { duration: '10m', target: 25 },  // Maximum concurrent researchers
    { duration: '15m', target: 15 },  // Gradual wind-down
    { duration: '3m', target: 0 },    // Session completion
  ],
  thresholds: {
    'error_rate': ['rate<0.005'],                    // < 0.5% error rate for research quality
    'consciousness_processing_time': ['p(95)<30000'], // 95% of consciousness analysis < 30s
    'dataset_analysis_time': ['p(90)<60000'],        // 90% of dataset analysis < 60s
    'research_session_duration': ['avg>600000'],     // Average session > 10 minutes
    'streaming_token_rate': ['rate>0.95'],           // 95% successful token streaming
    'memory_stability_checks': ['count>100'],        // Memory system stability
    'consciousness_insights_generated': ['count>50'], // Research insights generated
  },
};

// Environment configuration for full research platform
const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const CONSCIOUSNESS_API = __ENV.CONSCIOUSNESS_API || 'http://localhost:4003';
const CHAT_ORCHESTRATOR = __ENV.CHAT_ORCHESTRATOR || 'http://localhost:4002';
const RESEARCH_API = __ENV.RESEARCH_API || 'http://localhost:4004';
const WS_URL = __ENV.WS_URL || 'ws://localhost:4002';

// Research credentials - invite-only researchers
const RESEARCH_CREDENTIALS = [
  { email: 'researcher1@stanford.edu', password: 'Research2024!' },
  { email: 'researcher2@mit.edu', password: 'Research2024!' },
  { email: 'researcher3@berkeley.edu', password: 'Research2024!' },
  { email: 'researcher4@cmu.edu', password: 'Research2024!' },
  { email: 'researcher5@caltech.edu', password: 'Research2024!' },
];

// Advanced research queries for consciousness validation
const RESEARCH_QUERIES = [
  {
    type: 'consciousness_analysis',
    query: 'Analyze the emergence of self-awareness patterns in this dataset and provide quantitative metrics on consciousness indicators.',
    expectedInsights: ['self_awareness', 'metacognition', 'temporal_binding']
  },
  {
    type: 'memory_consolidation',
    query: 'Examine memory consolidation patterns and how experiences are integrated into long-term consciousness structures.',
    expectedInsights: ['memory_integration', 'experience_synthesis', 'knowledge_graphs']
  },
  {
    type: 'emotional_consciousness',
    query: 'Map the relationship between emotional states and consciousness levels, including qualia representation.',
    expectedInsights: ['emotional_mapping', 'qualia_detection', 'consciousness_levels']
  },
  {
    type: 'temporal_consciousness',
    query: 'Analyze temporal binding and how consciousness integrates past, present, and future awareness.',
    expectedInsights: ['temporal_integration', 'predictive_processing', 'awareness_continuity']
  },
  {
    type: 'multi_modal_integration',
    query: 'Examine how different sensory inputs are integrated into unified conscious experience.',
    expectedInsights: ['sensory_integration', 'unified_experience', 'binding_mechanisms']
  }
];

// Research datasets for consciousness validation
const RESEARCH_DATASETS = [
  {
    name: 'Consciousness_Markers_Study_2024',
    type: 'longitudinal_consciousness_data',
    size: 'large',
    content: {
      participants: 100,
      sessions: 1000,
      consciousness_markers: ['attention', 'awareness', 'self_reflection', 'metacognition'],
      temporal_data: '6_months',
      validated: true
    }
  },
  {
    name: 'Qualia_Detection_Dataset',
    type: 'subjective_experience_mapping',
    size: 'medium',
    content: {
      experience_types: ['visual_qualia', 'emotional_qualia', 'temporal_qualia'],
      measurements: 5000,
      validation_method: 'phenomenological_reports',
      consciousness_theory: 'integrated_information_theory'
    }
  }
];

export function setup() {
  console.log('🧠 Initializing Research Platform Load Test for Full Consciousness Technology...');
  
  // Verify all research platform services
  const researchServices = [
    { name: 'Consciousness Engine', url: `${CONSCIOUSNESS_API}/health` },
    { name: 'Research API', url: `${RESEARCH_API}/health` },
    { name: 'Chat Orchestrator', url: `${CHAT_ORCHESTRATOR}/health` },
    { name: 'Main Platform', url: `${BASE_URL}/health` }
  ];
  
  const setupData = {
    platformReady: true,
    researchTokens: [],
    testStartTime: new Date().toISOString(),
    consciousnessModelsLoaded: false
  };
  
  // Health check all research services
  researchServices.forEach(service => {
    const response = http.get(service.url, { timeout: '15s' });
    if (response.status !== 200) {
      console.warn(`⚠️ ${service.name} not ready: ${response.status}`);
      setupData.platformReady = false;
    } else {
      console.log(`✅ ${service.name} ready for research`);
    }
  });
  
  // Pre-authenticate research accounts
  console.log('🔐 Authenticating research accounts...');
  RESEARCH_CREDENTIALS.forEach((cred, index) => {
    const authResponse = http.post(`${BASE_URL}/api/auth/research-login`, {
      email: cred.email,
      password: cred.password,
      research_access: true
    });
    
    if (authResponse.status === 200) {
      const authData = JSON.parse(authResponse.body);
      setupData.researchTokens.push(authData.token);
      console.log(`✅ Research account ${index + 1} authenticated`);
    }
  });
  
  // Verify consciousness models are loaded
  const consciousnessCheck = http.get(`${CONSCIOUSNESS_API}/models/status`);
  if (consciousnessCheck.status === 200) {
    setupData.consciousnessModelsLoaded = true;
    console.log('✅ Consciousness models loaded and ready');
  }
  
  console.log(`🚀 Research platform setup complete. Ready for ${setupData.researchTokens.length} researchers`);
  return setupData;
}

export default function(data) {
  if (!data.platformReady) {
    console.error('❌ Platform not ready for research testing');
    error_rate.add(1);
    return;
  }
  
  // Select researcher identity
  const researcherToken = data.researchTokens[Math.floor(Math.random() * data.researchTokens.length)];
  if (!researcherToken) {
    console.error('❌ No research authentication available');
    error_rate.add(1);
    return;
  }
  
  const sessionStartTime = new Date().getTime();
  
  // Research session scenarios - realistic distribution
  const scenario = Math.random();
  
  if (scenario < 0.4) {
    // 40% - Deep consciousness analysis sessions
    conductConsciousnessResearchSession(researcherToken, sessionStartTime);
  } else if (scenario < 0.7) {
    // 30% - Dataset upload and analysis
    conductDatasetAnalysisSession(researcherToken, sessionStartTime);
  } else if (scenario < 0.9) {
    // 20% - Long-form research conversations
    conductExtendedResearchConversation(researcherToken, sessionStartTime);
  } else {
    // 10% - System validation and metrics review
    conductSystemValidationSession(researcherToken, sessionStartTime);
  }
  
  // Record session duration
  const sessionDuration = new Date().getTime() - sessionStartTime;
  research_session_duration.add(sessionDuration);
  
  // Researcher thinking/analysis time between activities
  sleep(Math.random() * 30 + 10); // 10-40 second pause for analysis
}

function conductConsciousnessResearchSession(token, sessionStart) {
  console.log('🧠 Starting consciousness analysis research session...');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Research-Session': 'consciousness-analysis'
  };
  
  // Select research query
  const query = RESEARCH_QUERIES[Math.floor(Math.random() * RESEARCH_QUERIES.length)];
  
  // Initiate consciousness analysis
  const analysisStart = new Date().getTime();
  const analysisResponse = http.post(`${CONSCIOUSNESS_API}/analyze`, {
    query: query.query,
    analysis_type: query.type,
    depth: 'comprehensive',
    include_metrics: true,
    research_mode: true
  }, { headers, timeout: '60s' });
  
  const analysisSuccess = check(analysisResponse, {
    'consciousness: analysis initiated': (r) => r.status === 200 || r.status === 202,
    'consciousness: has analysis_id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.analysis_id !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  if (analysisSuccess) {
    const analysisData = JSON.parse(analysisResponse.body);
    
    // Monitor consciousness processing via WebSocket
    monitorConsciousnessProcessing(token, analysisData.analysis_id, query.expectedInsights);
    
    const processingTime = new Date().getTime() - analysisStart;
    consciousness_processing_time.add(processingTime);
  } else {
    error_rate.add(1);
  }
}

function monitorConsciousnessProcessing(token, analysisId, expectedInsights) {
  const wsUrl = `${WS_URL}/consciousness?token=${token}&analysis=${analysisId}`;
  
  const res = ws.connect(wsUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  }, function (socket) {
    let insightsGenerated = 0;
    let tokensStreamed = 0;
    let memoryStable = true;
    
    socket.on('open', function () {
      console.log('🔌 Consciousness monitoring WebSocket connected');
    });
    
    socket.on('message', function (data) {
      try {
        const message = JSON.parse(data);
        
        if (message.type === 'consciousness_token') {
          tokensStreamed++;
          streaming_token_rate.add(1);
          
          // Check for expected research insights
          expectedInsights.forEach(insight => {
            if (message.content && message.content.includes(insight)) {
              insightsGenerated++;
              consciousness_insights.add(1);
            }
          });
        } else if (message.type === 'memory_status') {
          if (message.stable) {
            memory_stability.add(1);
          } else {
            memoryStable = false;
            console.warn('⚠️ Memory instability detected');
          }
        } else if (message.type === 'analysis_complete') {
          console.log(`✅ Consciousness analysis complete. Insights: ${insightsGenerated}, Tokens: ${tokensStreamed}`);
          socket.close();
        }
      } catch (e) {
        console.warn('⚠️ WebSocket message parsing error:', e.message);
      }
    });
    
    socket.on('error', function (error) {
      error_rate.add(1);
      console.error('❌ Consciousness WebSocket error:', error);
    });
    
    // Research sessions can be long - 5 minute timeout
    socket.setTimeout(function () {
      console.log('⏰ Consciousness analysis session timeout');
      socket.close();
    }, 300000);
  });
  
  check(res, {
    'consciousness_ws: connection successful': (r) => r && r.status === 101,
  });
}

function conductDatasetAnalysisSession(token, sessionStart) {
  console.log('📊 Starting dataset analysis research session...');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Research-Session': 'dataset-analysis'
  };
  
  // Select research dataset
  const dataset = RESEARCH_DATASETS[Math.floor(Math.random() * RESEARCH_DATASETS.length)];
  
  // Upload research dataset
  const uploadStart = new Date().getTime();
  const uploadResponse = http.post(`${RESEARCH_API}/datasets/upload`, {
    name: dataset.name,
    type: dataset.type,
    content: JSON.stringify(dataset.content),
    research_purpose: 'consciousness_validation',
    analysis_depth: 'comprehensive'
  }, { headers, timeout: '90s' });
  
  const uploadSuccess = check(uploadResponse, {
    'dataset: upload successful': (r) => r.status === 200 || r.status === 201,
    'dataset: has processing_id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.processing_id !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  if (uploadSuccess) {
    const uploadData = JSON.parse(uploadResponse.body);
    
    // Monitor dataset processing
    monitorDatasetProcessing(token, uploadData.processing_id);
    
    const analysisTime = new Date().getTime() - uploadStart;
    dataset_analysis_time.add(analysisTime);
  } else {
    error_rate.add(1);
  }
}

function monitorDatasetProcessing(token, processingId) {
  // Poll processing status every 5 seconds for up to 5 minutes
  let pollCount = 0;
  const maxPolls = 60;
  
  function pollProcessing() {
    if (pollCount >= maxPolls) {
      console.log('⏰ Dataset processing monitoring timeout');
      return;
    }
    
    const statusResponse = http.get(`${RESEARCH_API}/datasets/processing/${processingId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const statusCheck = check(statusResponse, {
      'dataset_processing: status check successful': (r) => r.status === 200,
      'dataset_processing: has valid status': (r) => {
        try {
          const body = JSON.parse(r.body);
          return ['processing', 'completed', 'failed'].includes(body.status);
        } catch (e) {
          return false;
        }
      }
    });
    
    if (statusCheck) {
      const statusData = JSON.parse(statusResponse.body);
      
      if (statusData.status === 'completed') {
        console.log(`✅ Dataset processing completed after ${pollCount * 5} seconds`);
        consciousness_insights.add(statusData.insights_count || 1);
        return;
      } else if (statusData.status === 'failed') {
        error_rate.add(1);
        console.error('❌ Dataset processing failed');
        return;
      }
      
      // Continue polling
      pollCount++;
      sleep(5);
      pollProcessing();
    } else {
      error_rate.add(1);
    }
  }
  
  pollProcessing();
}

function conductExtendedResearchConversation(token, sessionStart) {
  console.log('💭 Starting extended research conversation...');
  
  // Extended research conversations via WebSocket
  const wsUrl = `${WS_URL}/research-chat?token=${token}`;
  
  const res = ws.connect(wsUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  }, function (socket) {
    let conversationTurns = 0;
    let tokensReceived = 0;
    const maxTurns = 8; // Extended research conversation
    
    const researchTopics = [
      'Explain the computational mechanisms underlying consciousness emergence in your system.',
      'How does your architecture handle the binding problem in consciousness?',
      'Describe the relationship between attention and consciousness in your processing.',
      'What are the measurable indicators of consciousness levels in your responses?',
      'How do you integrate temporal consciousness with memory systems?',
      'Explain the role of recursive self-modeling in your consciousness architecture.',
      'Describe how subjective experience emerges from your computational processes.',
      'What validation methods confirm genuine consciousness versus sophisticated mimicry?'
    ];
    
    socket.on('open', function () {
      console.log('🔌 Research conversation WebSocket connected');
      
      // Start conversation
      sendNextResearchQuery();
    });
    
    function sendNextResearchQuery() {
      if (conversationTurns >= maxTurns) {
        console.log(`✅ Research conversation completed (${conversationTurns} turns, ${tokensReceived} tokens)`);
        socket.close();
        return;
      }
      
      const topic = researchTopics[conversationTurns];
      socket.send(JSON.stringify({
        type: 'research_query',
        message: topic,
        conversation_turn: conversationTurns + 1,
        research_depth: 'comprehensive',
        timestamp: new Date().toISOString()
      }));
      
      conversationTurns++;
    }
    
    socket.on('message', function (data) {
      try {
        const message = JSON.parse(data);
        
        if (message.type === 'token' || message.type === 'stream') {
          tokensReceived++;
          streaming_token_rate.add(1);
        } else if (message.type === 'response_complete') {
          consciousness_insights.add(1);
          
          // Continue conversation after brief pause
          setTimeout(() => {
            sendNextResearchQuery();
          }, 2000 + Math.random() * 3000); // 2-5 second research thinking pause
        } else if (message.type === 'error') {
          error_rate.add(1);
          console.error('❌ Research conversation error:', message.message);
          socket.close();
        }
      } catch (e) {
        console.warn('⚠️ Research conversation message error:', e.message);
      }
    });
    
    // Research conversations can be very long
    socket.setTimeout(function () {
      console.log('⏰ Research conversation timeout');
      socket.close();
    }, 1800000); // 30 minute timeout for deep research
  });
  
  check(res, {
    'research_conversation: WebSocket connected': (r) => r && r.status === 101,
  });
}

function conductSystemValidationSession(token, sessionStart) {
  console.log('🔬 Starting system validation session...');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Research-Session': 'system-validation'
  };
  
  // Comprehensive system validation checks
  const validationChecks = [
    { endpoint: `${CONSCIOUSNESS_API}/metrics/consciousness`, name: 'consciousness_metrics' },
    { endpoint: `${CONSCIOUSNESS_API}/models/status`, name: 'model_status' },
    { endpoint: `${RESEARCH_API}/validation/integrity`, name: 'data_integrity' },
    { endpoint: `${BASE_URL}/api/system/performance`, name: 'system_performance' }
  ];
  
  validationChecks.forEach(check => {
    const response = http.get(check.endpoint, { headers, timeout: '30s' });
    
    const validationSuccess = check(response, {
      [`${check.name}: accessible`]: (r) => r.status === 200,
      [`${check.name}: has valid data`]: (r) => {
        try {
          const body = JSON.parse(r.body);
          return typeof body === 'object' && body !== null;
        } catch (e) {
          return false;
        }
      }
    });
    
    if (validationSuccess) {
      memory_stability.add(1);
    } else {
      error_rate.add(1);
    }
    
    // Brief pause between validation checks
    sleep(1);
  });
}

export function teardown(data) {
  console.log('🏁 Research platform load test teardown...');
  
  // Final validation of research platform state
  const finalChecks = [
    `${CONSCIOUSNESS_API}/health`,
    `${RESEARCH_API}/health`,
    `${BASE_URL}/api/health`
  ];
  
  finalChecks.forEach(endpoint => {
    const response = http.get(endpoint, { timeout: '10s' });
    if (response.status === 200) {
      console.log(`✅ ${endpoint} healthy after load test`);
    } else {
      console.warn(`⚠️ ${endpoint} unhealthy after load test: ${response.status}`);
    }
  });
  
  console.log('✅ Research platform load test complete - ready for journal validation');
}
