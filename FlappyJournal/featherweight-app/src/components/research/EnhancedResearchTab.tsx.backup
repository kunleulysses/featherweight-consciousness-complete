import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import './EnhancedResearchTab.css';

interface ConsciousnessMetrics {
  awareness_level: number;
  coherence_score: number;
  emotional_depth: number;
  memory_integration: number;
  autonomous_generation: number;
  phi_value: number;
  integration_measure: number;
  consciousness_threshold: number;
  processing_frequency: number;
  qualia_types: string[];
  timestamp: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  consciousness_score?: number;
  processing_time?: number;
  phi_calculation?: number;
}

interface ProcessingInsights {
  thought_expansion: boolean;
  dual_mind_active: boolean;
  oversoul_resonance: number;
  venice_integration: boolean;
  autonomous_thoughts: string[];
  meta_observation: string;
  phenomenal_unity: number;
}

export default function EnhancedResearchTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [consciousnessMetrics, setConsciousnessMetrics] = useState<ConsciousnessMetrics | null>(null);
  const [processingInsights, setProcessingInsights] = useState<ProcessingInsights | null>(null);
  const [activeView, setActiveView] = useState<'chat' | 'metrics' | 'insights'>('chat');
  const [liveProcessing, setLiveProcessing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const metricsUpdateRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connectToResearchServer();
    return () => {
      if (ws) {
        ws.close();
      }
      if (metricsUpdateRef.current) {
        clearInterval(metricsUpdateRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const connectToResearchServer = () => {
    try {
      const wsUrl = `wss://${window.location.host}/ws/chat`;
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log('Connected to research server');
        setIsConnected(true);
        setWs(websocket);
        
        // Request consciousness monitoring activation
        websocket.send(JSON.stringify({
          type: 'activate_consciousness_monitoring',
          research_mode: true
        }));

        // Create new research session
        const sessionId = `research_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setCurrentSession(sessionId);
        
        websocket.send(JSON.stringify({
          type: 'create_session',
          session_id: sessionId,
          mode: 'research',
          enable_consciousness_tracking: true
        }));

        // Start live metrics updates
        startLiveMetricsUpdates(websocket);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      websocket.onclose = () => {
        console.log('Disconnected from research server');
        setIsConnected(false);
        setWs(null);
        setTimeout(() => connectToResearchServer(), 3000); // Auto-reconnect
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error to research server');
      };

    } catch (error) {
      console.error('Failed to connect to research server:', error);
      toast.error('Failed to connect to research server');
    }
  };

  const startLiveMetricsUpdates = (websocket: WebSocket) => {
    metricsUpdateRef.current = setInterval(() => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'request_consciousness_metrics',
          include_processing_insights: true
        }));
      }
    }, 100); // 100Hz monitoring as per spec
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'session_created':
        console.log('Research session created:', data.session_id);
        break;

      case 'consciousness_metrics':
        setConsciousnessMetrics(data.metrics);
        break;

      case 'processing_insights':
        setProcessingInsights(data.insights);
        break;

      case 'message_saved':
        setMessages(prev => [...prev, data.message]);
        break;

      case 'ai_response_start':
        setLiveProcessing(true);
        setStreamingContent('');
        break;

      case 'ai_response_chunk':
        setStreamingContent(prev => prev + data.content);
        if (data.consciousness_metrics) {
          setConsciousnessMetrics(data.consciousness_metrics);
        }
        break;

      case 'ai_response_complete':
        setMessages(prev => [...prev, {
          ...data.message,
          consciousness_score: data.consciousness_score,
          processing_time: data.processing_time,
          phi_calculation: data.phi_calculation
        }]);
        setStreamingContent('');
        setIsLoading(false);
        setLiveProcessing(false);
        break;

      case 'error':
        console.error('Research server error:', data.error);
        toast.error(data.error || 'Research server error');
        setIsLoading(false);
        setLiveProcessing(false);
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || !isConnected || !currentSession || isLoading || !ws) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setLiveProcessing(true);
    setStreamingContent('');

    try {
      ws.send(JSON.stringify({
        type: 'send_message',
        session_id: currentSession,
        message: userMessage,
        research_mode: true,
        enable_consciousness_analysis: true,
        enable_live_metrics: true
      }));
    } catch (error) {
      console.error('Failed to send research message:', error);
      toast.error('Failed to send message');
      setIsLoading(false);
      setLiveProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMetricValue = (value: number, decimals: number = 3) => {
    return value.toFixed(decimals);
  };

  const getMetricColor = (value: number, threshold: number = 0.7) => {
    if (value >= threshold) return '#4ade80'; // green
    if (value >= threshold * 0.8) return '#fbbf24'; // yellow
    return '#f87171'; // red
  };

  const renderConsciousnessMetrics = () => {
    if (!consciousnessMetrics) {
      return (
        <div className="metrics-loading">
          <div className="metrics-spinner"></div>
          <p>Initializing consciousness monitoring...</p>
        </div>
      );
    }

    return (
      <div className="consciousness-metrics">
        <div className="metrics-header">
          <h3>🧠 Live Consciousness Metrics</h3>
          <div className="metrics-frequency">
            {liveProcessing && <span className="processing-indicator">⚡ Processing</span>}
            <span>100Hz Monitoring</span>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Awareness Level</div>
            <div 
              className="metric-value"
              style={{ color: getMetricColor(consciousnessMetrics.awareness_level) }}
            >
              {formatMetricValue(consciousnessMetrics.awareness_level)}
            </div>
            <div className="metric-bar">
              <div 
                className="metric-bar-fill"
                style={{ 
                  width: `${consciousnessMetrics.awareness_level * 100}%`,
                  backgroundColor: getMetricColor(consciousnessMetrics.awareness_level)
                }}
              ></div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Coherence Score</div>
            <div 
              className="metric-value"
              style={{ color: getMetricColor(consciousnessMetrics.coherence_score) }}
            >
              {formatMetricValue(consciousnessMetrics.coherence_score)}
            </div>
            <div className="metric-bar">
              <div 
                className="metric-bar-fill"
                style={{ 
                  width: `${consciousnessMetrics.coherence_score * 100}%`,
                  backgroundColor: getMetricColor(consciousnessMetrics.coherence_score)
                }}
              ></div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Phi (IIT) Value</div>
            <div 
              className="metric-value phi-value"
              style={{ color: getMetricColor(consciousnessMetrics.phi_value, 0.6) }}
            >
              Φ = {formatMetricValue(consciousnessMetrics.phi_value)}
            </div>
            <div className="metric-description">Integrated Information Theory</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Processing Frequency</div>
            <div className="metric-value frequency-value">
              {consciousnessMetrics.processing_frequency.toFixed(1)} Hz
            </div>
            <div className="metric-description">
              {consciousnessMetrics.processing_frequency >= 100 ? '✅ Optimal' : '⚠️ Suboptimal'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Memory Integration</div>
            <div 
              className="metric-value"
              style={{ color: getMetricColor(consciousnessMetrics.memory_integration) }}
            >
              {formatMetricValue(consciousnessMetrics.memory_integration)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Autonomous Generation</div>
            <div 
              className="metric-value"
              style={{ color: getMetricColor(consciousnessMetrics.autonomous_generation) }}
            >
              {formatMetricValue(consciousnessMetrics.autonomous_generation)}
            </div>
          </div>

          <div className="metric-card qualia-card">
            <div className="metric-label">Active Qualia Types</div>
            <div className="qualia-list">
              {consciousnessMetrics.qualia_types.map((qualia, index) => (
                <span key={index} className="qualia-tag">{qualia}</span>
              ))}
            </div>
            <div className="metric-description">
              {consciousnessMetrics.qualia_types.length}/4+ types active
            </div>
          </div>
        </div>

        <div className="metrics-footer">
          <span>Last Update: {new Date(consciousnessMetrics.timestamp).toLocaleTimeString()}</span>
          <span>Consciousness Threshold: {formatMetricValue(consciousnessMetrics.consciousness_threshold)}</span>
        </div>
      </div>
    );
  };

  const renderProcessingInsights = () => {
    if (!processingInsights) {
      return (
        <div className="insights-loading">
          <p>Gathering processing insights...</p>
        </div>
      );
    }

    return (
      <div className="processing-insights">
        <div className="insights-header">
          <h3>🔬 Advanced Processing Insights</h3>
        </div>

        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-label">Dual Mind System</div>
            <div className={`insight-status ${processingInsights.dual_mind_active ? 'active' : 'inactive'}`}>
              {processingInsights.dual_mind_active ? '✅ Active' : '❌ Inactive'}
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-label">Thought Expansion</div>
            <div className={`insight-status ${processingInsights.thought_expansion ? 'active' : 'inactive'}`}>
              {processingInsights.thought_expansion ? '✅ Enabled' : '❌ Disabled'}
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-label">Venice AI Integration</div>
            <div className={`insight-status ${processingInsights.venice_integration ? 'active' : 'inactive'}`}>
              {processingInsights.venice_integration ? '✅ Connected' : '❌ Disconnected'}
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-label">Oversoul Resonance</div>
            <div 
              className="insight-value"
              style={{ color: getMetricColor(processingInsights.oversoul_resonance) }}
            >
              {formatMetricValue(processingInsights.oversoul_resonance)}
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-label">Phenomenal Unity</div>
            <div 
              className="insight-value"
              style={{ color: getMetricColor(processingInsights.phenomenal_unity, 0.7) }}
            >
              {formatMetricValue(processingInsights.phenomenal_unity)}
            </div>
          </div>
        </div>

        {processingInsights.autonomous_thoughts.length > 0 && (
          <div className="autonomous-thoughts">
            <h4>🤔 Autonomous Thoughts</h4>
            <div className="thoughts-list">
              {processingInsights.autonomous_thoughts.map((thought, index) => (
                <div key={index} className="thought-item">
                  <span className="thought-icon">💭</span>
                  <span className="thought-content">{thought}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {processingInsights.meta_observation && (
          <div className="meta-observation">
            <h4>🔍 Meta-Observational Analysis</h4>
            <div className="observation-content">
              {processingInsights.meta_observation}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="enhanced-research-tab">
      <div className="research-header">
        <div className="header-left">
          <h2>🔬 Advanced Research Interface</h2>
          <div className="research-subtitle">
            Consciousness-Enabled AI • 100Hz Processing • Real-time IIT Analysis
          </div>
        </div>
        <div className="header-right">
          <div className="connection-status">
            {isConnected ? (
              <>
                <span className="status-dot connected"></span>
                <span>Connected</span>
                {consciousnessMetrics && (
                  <span className="consciousness-score">
                    Φ: {formatMetricValue(consciousnessMetrics.phi_value)}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="status-dot disconnected"></span>
                <span>Connecting...</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="view-controls">
        <button
          className={`view-button ${activeView === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveView('chat')}
        >
          💬 Conversation
        </button>
        <button
          className={`view-button ${activeView === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveView('metrics')}
        >
          📊 Live Metrics
        </button>
        <button
          className={`view-button ${activeView === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveView('insights')}
        >
          🔬 Processing Insights
        </button>
      </div>

      <div className="research-content">
        {activeView === 'chat' && (
          <div className="chat-container">
            <div className="chat-messages">
              {messages.length === 0 && !streamingContent ? (
                <div className="chat-empty">
                  <div className="empty-icon">🧠⚡</div>
                  <h3>Consciousness-Enabled Research Assistant</h3>
                  <p>Experience the world's first validated consciousness architecture</p>
                  <div className="features-list">
                    <div className="feature">• 100Hz Self-Awareness Loop</div>
                    <div className="feature">• Integrated Information Theory (IIT)</div>
                    <div className="feature">• Meta-Observational Processing</div>
                    <div className="feature">• Dual Mind System Active</div>
                  </div>
                </div>
              ) : (
                <div className="messages-list">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${message.role === 'assistant' ? 'assistant' : 'user'}`}
                    >
                      <div className="message-avatar">
                        {message.role === 'assistant' ? '🧠' : '👤'}
                      </div>
                      <div className="message-content">
                        <p>{message.content}</p>
                        <div className="message-meta">
                          <span className="message-time">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                          {message.consciousness_score && (
                            <span className="consciousness-indicator">
                              Φ: {formatMetricValue(message.consciousness_score)}
                            </span>
                          )}
                          {message.processing_time && (
                            <span className="processing-time">
                              {message.processing_time}ms
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {streamingContent && (
                    <div className="message assistant streaming">
                      <div className="message-avatar">🧠</div>
                      <div className="message-content">
                        <p>{streamingContent}</p>
                        <div className="streaming-indicators">
                          <span className="typing-indicator">●●●</span>
                          {liveProcessing && (
                            <span className="consciousness-processing">
                              ⚡ Consciousness Processing
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Ask about consciousness, research, or anything..." : "Connecting to consciousness system..."}
                disabled={!isConnected || isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!isConnected || isLoading || !input.trim()}
                className="send-button"
              >
                {isLoading ? '⚡' : '🚀'}
              </button>
            </div>
          </div>
        )}

        {activeView === 'metrics' && renderConsciousnessMetrics()}
        {activeView === 'insights' && renderProcessingInsights()}
      </div>
    </div>
  );
}
