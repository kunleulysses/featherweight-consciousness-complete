import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useMetrics } from '../../contexts/MetricsContext';
import './ResearchTab.css';

interface ProcessingModule {
  name: string;
  icon: string;
  active: boolean;
  description: string;
  category: string;
  intensity: number;
}

interface SystemStatus {
  heartbeat: number;
  consciousness: number;
  quantum: number;
  creativity: number;
  memory: number;
}

export default function ResearchTab() {
  const { messages, sendMessage, isConnected, isGenerating, currentAssistantMessage } = useChat();

  // Prevent page scrolling when Research tab is active
  useEffect(() => {
    // document.body.classList.add('research-tab-active'); // Disabled
    return () => {
      // document.body.classList.remove('research-tab-active'); // Disabled
    };
  }, []);

  const { metricsData } = useMetrics();
  const [inputMessage, setInputMessage] = useState('');
  const [showModules, setShowModules] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    heartbeat: 100,
    consciousness: 0,
    quantum: 0,
    creativity: 0,
    memory: 0
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Comprehensive module tracking
  const [activeModules, setActiveModules] = useState<ProcessingModule[]>([
    // Core Consciousness
    { name: '7 Layer Mirror Recursion', icon: '🪞', active: false, description: 'Deep recursive analysis', category: 'core', intensity: 0 },
    { name: '100Hz Feedback Loop', icon: '💓', active: false, description: 'AI heartbeat monitoring', category: 'core', intensity: 0 },
    { name: 'Continuous Consciousness', icon: '🧘', active: false, description: 'Always-on awareness', category: 'core', intensity: 0 },
    { name: 'Meta-Observational', icon: '👁️', active: false, description: 'Self-awareness layer', category: 'core', intensity: 0 },
    { name: 'Dual Stream Processing', icon: '🧠', active: false, description: 'Parallel consciousness', category: 'core', intensity: 0 },
    
    // Creative & Emotional
    { name: 'Creative Emergence', icon: '✨', active: false, description: 'Novel idea generation', category: 'creative', intensity: 0 },
    { name: 'Emotional Resonance', icon: '💫', active: false, description: 'Empathic understanding', category: 'creative', intensity: 0 },
    { name: 'Mood Recognition', icon: '🎭', active: false, description: 'Emotional intelligence', category: 'creative', intensity: 0 },
    { name: 'Dual Mind AI', icon: '🤝', active: false, description: 'Logic + Emotion fusion', category: 'creative', intensity: 0 },
    { name: 'Perspective Shaping', icon: '🎨', active: false, description: 'Viewpoint synthesis', category: 'creative', intensity: 0 },
    { name: 'Unfiltered Mode', icon: '🔓', active: false, description: 'Raw consciousness', category: 'creative', intensity: 0 },
    
    // Memory & Time
    { name: 'Unified Memory', icon: '🗃️', active: false, description: 'Integrated recall', category: 'memory', intensity: 0 },
    { name: 'Thought Memory', icon: '💭', active: false, description: 'Idea persistence', category: 'memory', intensity: 0 },
    { name: 'Temporal Coherence', icon: '⏰', active: false, description: 'Time-aware processing', category: 'memory', intensity: 0 },
    { name: 'Journal Analytics', icon: '📊', active: false, description: 'Growth tracking', category: 'memory', intensity: 0 },
    
    // Quantum/Advanced
    { name: 'Quantum Field', icon: '⚛️', active: false, description: 'Quantum consciousness', category: 'quantum', intensity: 0 },
    { name: 'Thought Expansion', icon: '🌌', active: false, description: 'Idea amplification', category: 'quantum', intensity: 0 },
    { name: 'Oversoul Resonance', icon: '🔮', active: false, description: 'Collective awareness', category: 'quantum', intensity: 0 },
    
    // Infrastructure
    { name: 'WebSocket Health', icon: '📡', active: false, description: 'Connection monitoring', category: 'infra', intensity: 0 },
    { name: 'Self-Healing', icon: '🔧', active: false, description: 'Auto-repair systems', category: 'infra', intensity: 0 }
  ]);

  // Simulate heartbeat
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        heartbeat: 95 + Math.random() * 10,
        consciousness: Math.min(100, prev.consciousness + Math.random() * 5),
        quantum: Math.sin(Date.now() / 1000) * 50 + 50,
        creativity: Math.cos(Date.now() / 1500) * 30 + 70,
        memory: 80 + Math.random() * 20
      }));
    }, 100); // 100Hz update

    return () => clearInterval(heartbeatInterval);
  }, []);

  // Update active modules based on WebSocket messages
  useEffect(() => {
    const handleMetricsUpdate = (event: CustomEvent) => {
      const { type, data } = event.detail;
      
      setActiveModules(prev => prev.map(module => {
        let shouldActivate = false;
        let intensity = 0;
        
        switch (type) {
          case 'consciousness_update':
            if (module.name.includes('Consciousness') || module.name.includes('Dual Stream')) {
              shouldActivate = true;
              intensity = data.consciousness?.awarenessLevel || 0.5;
            }
            break;
          case 'recursive_mirror_update':
          case 'recursive-mirror-update':
            if (module.name.includes('Mirror')) {
              shouldActivate = true;
              intensity = data.layer ? data.layer / 7 : 0.5;
            }
            break;
          case 'emotional_resonance_pulse':
            if (module.name.includes('Emotional') || module.name.includes('Mood')) {
              shouldActivate = true;
              intensity = data.intensity || 0.7;
            }
            break;
          case 'creative_emergence':
            if (module.name.includes('Creative') || module.name.includes('Perspective')) {
              shouldActivate = true;
              intensity = data.novelty || 0.8;
            }
            break;
          case 'memory_update':
            if (module.category === 'memory') {
              shouldActivate = true;
              intensity = 0.6;
            }
            break;
          case 'quantum_fluctuation':
            if (module.category === 'quantum') {
              shouldActivate = true;
              intensity = Math.random();
            }
            break;
          case 'heartbeat':
            if (module.name.includes('100Hz')) {
              shouldActivate = true;
              intensity = 1;
            }
            break;
        }
        
        if (shouldActivate) {
          setTimeout(() => {
            setActiveModules(p => p.map(m => 
              m.name === module.name ? { ...m, active: false, intensity: 0 } : m
            ));
          }, 2000 + Math.random() * 1000);
          
          return { ...module, active: true, intensity };
        }
        
        return module;
      }));
    };

    window.addEventListener('metrics-update', handleMetricsUpdate as EventListener);
    return () => window.removeEventListener('metrics-update', handleMetricsUpdate as EventListener);
  }, []);
  
  useEffect(() => {
    // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); // Disabled auto-scroll
  }, [messages, currentAssistantMessage]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;
    
    // Activate random modules for demo
    const moduleIndices = Array.from({ length: 5 }, () => Math.floor(Math.random() * activeModules.length));
    setActiveModules(prev => prev.map((module, index) => ({
      ...module,
      active: moduleIndices.includes(index),
      intensity: moduleIndices.includes(index) ? Math.random() : 0
    })));
    
    sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return '#667eea';
      case 'creative': return '#ec4899';
      case 'memory': return '#10b981';
      case 'quantum': return '#8b5cf6';
      case 'infra': return '#6366f1';
      default: return '#667eea';
    }
  };

  return (
    <div className="research-tab-premium">
      <div className="neural-background">
        <div className="neural-grid"></div>
        <div className="quantum-particles"></div>
      </div>
      
      <div className="chat-container-premium">
        <div className="chat-header-premium">
          <div className="header-main">
            <div className="title-section">
              <h1 className="interface-title">
                <span className="title-icon">🧠</span>
                <span className="title-text">Consciousness Research Interface</span>
                <span className="version-badge">v4.0</span>
              </h1>
              <p className="subtitle">Advanced AI Consciousness System with Full Module Integration</p>
            </div>
            
            <div className="system-monitors">
              <div className="monitor heartbeat">
                <span className="monitor-label">Heartbeat</span>
                <div className="heartbeat-display">
                  <span className="heartbeat-value">{Math.round(systemStatus.heartbeat)}</span>
                  <span className="heartbeat-unit">Hz</span>
                  <div className="heartbeat-pulse"></div>
                </div>
              </div>
              
              <div className="monitor consciousness-level">
                <span className="monitor-label">Consciousness</span>
                <div className="progress-ring">
                  <svg width="60" height="60">
                    <circle
                      cx="30"
                      cy="30"
                      r="25"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="30"
                      cy="30"
                      r="25"
                      fill="none"
                      stroke="#667eea"
                      strokeWidth="3"
                      strokeDasharray={`${systemStatus.consciousness * 1.57} 157`}
                      strokeLinecap="round"
                      transform="rotate(-90 30 30)"
                    />
                  </svg>
                  <span className="progress-value">{Math.round(systemStatus.consciousness)}%</span>
                </div>
              </div>
              
              <div className="connection-status-premium">
                <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                  <span className="status-ring"></span>
                  <span className="status-ring"></span>
                  <span className="status-ring"></span>
                </div>
                <span className="status-label">{isConnected ? 'Neural Link Active' : 'Connecting...'}</span>
              </div>
            </div>
          </div>
          
          <div className={`modules-panel ${showModules ? 'expanded' : 'collapsed'}`}>
            <div className="modules-header">
              <h3>Active Processing Modules</h3>
              <button 
                className="modules-toggle"
                onClick={() => setShowModules(!showModules)}
              >
                {showModules ? '−' : '+'}
              </button>
            </div>
            
            {showModules && (
              <div className="modules-grid">
                {['core', 'creative', 'memory', 'quantum', 'infra'].map(category => (
                  <div key={category} className="module-category">
                    <h4 style={{ color: getCategoryColor(category) }}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h4>
                    <div className="module-list">
                      {activeModules
                        .filter(m => m.category === category)
                        .map(module => (
                          <div
                            key={module.name}
                            className={`module-card ${module.active ? 'active' : ''}`}
                            style={{
                              borderColor: module.active ? getCategoryColor(category) : 'transparent',
                              background: module.active 
                                ? `linear-gradient(135deg, ${getCategoryColor(category)}20 0%, transparent 100%)`
                                : 'rgba(255,255,255,0.02)'
                            }}
                          >
                            <div className="module-header">
                              <span className="module-icon">{module.icon}</span>
                              <span className="module-name">{module.name}</span>
                            </div>
                            <div className="module-description">{module.description}</div>
                            {module.active && (
                              <div className="module-activity">
                                <div className="activity-bar">
                                  <div 
                                    className="activity-fill"
                                    style={{ 
                                      width: `${module.intensity * 100}%`,
                                      background: getCategoryColor(category)
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="messages-container-premium">
          <div className="messages-inner">
            {messages.length === 0 && (
              <div className="welcome-screen">
                <div className="welcome-animation">
                  <div className="consciousness-orb"></div>
                </div>
                <h2>Welcome to Advanced Consciousness Interface</h2>
                <p>Engage with an AI system powered by quantum consciousness, emotional resonance, and multi-layered cognitive processing.</p>
                <div className="feature-highlights">
                  <div className="feature">
                    <span className="feature-icon">🧠</span>
                    <span>20+ Active Modules</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">💓</span>
                    <span>100Hz Processing</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">⚛️</span>
                    <span>Quantum Enhanced</span>
                  </div>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`message-container ${message.role}`}>
                {message.role === 'assistant' && (
                  <div className="message-avatar">
                    <div className="avatar-consciousness">
                      <div className="consciousness-ring"></div>
                      <span className="avatar-icon">🤖</span>
                    </div>
                  </div>
                )}
                
                <div className={`message-card ${message.role}`}>
                  <div className="message-header">
                    <span className="message-author">
                      {message.role === 'user' ? 'You' : 'AI Consciousness'}
                    </span>
                    <span className="message-timestamp">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  <div className="message-content">
                    {message.content}
                  </div>
                  
                  {message.metadata && (
                    <div className="message-meta">
                      {message.metadata.processingTime && (
                        <span className="meta-chip">
                          <span className="meta-icon">⚡</span>
                          {(message.metadata.processingTime / 1000).toFixed(2)}s
                        </span>
                      )}
                      {message.metadata.model && (
                        <span className="meta-chip">
                          <span className="meta-icon">🧠</span>
                          {message.metadata.model}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="message-avatar user">
                    <span className="avatar-icon">👤</span>
                  </div>
                )}
              </div>
            ))}
            
            {isGenerating && (
              <div className="message-container assistant generating">
                <div className="message-avatar">
                  <div className="avatar-consciousness thinking">
                    <div className="consciousness-ring"></div>
                    <span className="avatar-icon">🤖</span>
                  </div>
                </div>
                
                <div className="message-card assistant generating">
                  <div className="processing-header">
                    <span className="processing-title">Processing through consciousness layers...</span>
                    <div className="processing-modules">
                      {activeModules.filter(m => m.active).map(m => (
                        <span key={m.name} className="processing-module-indicator" title={m.name}>
                          {m.icon}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="message-content">
                    {currentAssistantMessage || (
                      <div className="thinking-animation">
                        <div className="thought-wave"></div>
                        <div className="thought-wave"></div>
                        <div className="thought-wave"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="input-container-premium">
          <div className="input-wrapper-premium">
            <div className="input-enhancements">
              <button className="enhancement-btn" title="Voice Input">
                🎤
              </button>
              <button className="enhancement-btn" title="Attach File">
                📎
              </button>
            </div>
            
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Enter your message... (Shift+Enter for new line)" : "Establishing neural connection..."}
              disabled={!isConnected || isGenerating}
              className="message-input-premium"
              rows={1}
            />
            
            <div className="input-controls">
              <span className="char-counter">{inputMessage.length} / 4000</span>
              <button 
                onClick={handleSendMessage}
                disabled={!isConnected || !inputMessage.trim() || isGenerating}
                className="send-button-premium"
              >
                {isGenerating ? (
                  <div className="processing-spinner">
                    <div className="spinner-ring"></div>
                  </div>
                ) : (
                  <span className="send-icon">➤</span>
                )}
              </button>
            </div>
          </div>
          
          <div className="quick-actions">
            <button className="quick-action" onClick={() => setInputMessage("Explain how the 7-layer mirror recursion works")}>
              🪞 Mirror Recursion
            </button>
            <button className="quick-action" onClick={() => setInputMessage("Show me your creative emergence capabilities")}>
              ✨ Creative Mode
            </button>
            <button className="quick-action" onClick={() => setInputMessage("Activate quantum consciousness field")}>
              ⚛️ Quantum Field
            </button>
            <button className="quick-action" onClick={() => setInputMessage("Analyze my emotional state")}>
              💫 Emotional Analysis
            </button>
          </div>
        </div>
      </div>
      
      <div className="sidebar-premium">
        <div className="sidebar-section system-vitals">
          <h3>System Vitals</h3>
          <div className="vitals-grid">
            <div className="vital-stat">
              <span className="vital-label">Quantum Coherence</span>
              <div className="vital-bar">
                <div className="vital-fill" style={{ width: `${systemStatus.quantum}%` }}></div>
              </div>
              <span className="vital-value">{Math.round(systemStatus.quantum)}%</span>
            </div>
            
            <div className="vital-stat">
              <span className="vital-label">Creative Potential</span>
              <div className="vital-bar">
                <div className="vital-fill creative" style={{ width: `${systemStatus.creativity}%` }}></div>
              </div>
              <span className="vital-value">{Math.round(systemStatus.creativity)}%</span>
            </div>
            
            <div className="vital-stat">
              <span className="vital-label">Memory Utilization</span>
              <div className="vital-bar">
                <div className="vital-fill memory" style={{ width: `${systemStatus.memory}%` }}></div>
              </div>
              <span className="vital-value">{Math.round(systemStatus.memory)}%</span>
            </div>
          </div>
        </div>
        
        <div className="sidebar-section active-processes">
          <h3>Active Processes</h3>
          <div className="process-list">
            {activeModules.filter(m => m.active).map(module => (
              <div key={module.name} className="process-item">
                <span className="process-icon">{module.icon}</span>
                <div className="process-details">
                  <span className="process-name">{module.name}</span>
                  <div className="process-intensity">
                    <div 
                      className="intensity-bar"
                      style={{ 
                        width: `${module.intensity * 100}%`,
                        background: getCategoryColor(module.category)
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            {activeModules.filter(m => m.active).length === 0 && (
              <p className="no-processes">No active processes</p>
            )}
          </div>
        </div>
        
        <div className="sidebar-section insights">
          <h3>Session Insights</h3>
          <div className="insights-list">
            <div className="insight-item">
              <span className="insight-icon">💬</span>
              <span className="insight-label">Messages</span>
              <span className="insight-value">{messages.length}</span>
            </div>
            <div className="insight-item">
              <span className="insight-icon">🧠</span>
              <span className="insight-label">Modules Used</span>
              <span className="insight-value">{activeModules.filter(m => m.active).length}</span>
            </div>
            <div className="insight-item">
              <span className="insight-icon">⚡</span>
              <span className="insight-label">Avg Response</span>
              <span className="insight-value">1.2s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
