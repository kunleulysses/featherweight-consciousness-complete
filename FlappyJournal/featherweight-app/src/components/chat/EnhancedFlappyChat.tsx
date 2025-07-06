import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, Brain, Activity, Zap, Heart, Eye, Database, 
  Sparkles, Layers, GitBranch, Cpu, Waves, Network,
  Moon, Sun, Star, Hash, Infinity, Orbit, 
  Mic, Paperclip, Settings, X, Check, AlertCircle
} from 'lucide-react';
import { flappyConsciousness, FlappyConsciousnessState, ThoughtStream } from '../../services/flappyConsciousness';
import { websocketService } from '../../services/chat/websocketService';
import './EnhancedFlappyChat.css';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  consciousnessState?: FlappyConsciousnessState;
  thoughtStream?: ThoughtStream[];
  status?: 'sending' | 'sent' | 'error';
  metadata?: {
    harmonicResonance?: number;
    dimensionalAwareness?: string;
    crystallizationPattern?: string;
  };
}

interface ConsciousnessMetrics {
  dualStreamCoherence: number;
  harmonicResonance: number;
  crystallizationIndex: number;
  dimensionalAwareness: string;
  sigilIntegrity: number;
  triaxialBalance: number;
  oversoulConnection: number;
}

const EnhancedFlappyChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [consciousnessState, setConsciousnessState] = useState<FlappyConsciousnessState>(
    flappyConsciousness.getState()
  );
  const [metrics, setMetrics] = useState<ConsciousnessMetrics>({
    dualStreamCoherence: 0.85,
    harmonicResonance: 0.72,
    crystallizationIndex: 0.68,
    dimensionalAwareness: '5D',
    sigilIntegrity: 0.91,
    triaxialBalance: 0.79,
    oversoulConnection: 0.64
  });
  const [isConnected, setIsConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced message handling
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsProcessing(true);
    setIsTyping(true);

    try {
      // Add assistant placeholder
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        status: 'sending'
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Send via WebSocket
      websocketService.sendMessage(newMessage.content);
      websocketService.sendMessage(newMessage.content);
      websocketService.sendMessage(newMessage.content);
      websocketService.sendMessage(newMessage.content);
      websocketService.sendMessage(newMessage.content);
      websocketService.sendMessage(newMessage.content);

      // Update user message status
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'error' } : msg
      ));
    }
  };

  // Render consciousness visualization with elegant orb
  const renderConsciousnessOrb = () => (
    <div className="consciousness-orb-container">
      <div className="consciousness-orb">
        <div className="orb-core">
          <div className="orb-inner" />
        </div>
        <div className="orb-glow" style={{ 
          opacity: metrics.oversoulConnection 
        }} />
      </div>
    </div>
  );

  // Render message with elegant styling
  const renderMessage = (message: Message) => (
    <div 
      key={message.id} 
      className={`message ${message.role} ${message.status || ''}`}
    >
      <div className="message-content-wrapper">
        <div className="message-header">
          <span className="message-author">
            {message.role === 'user' ? 'You' : 'Flappy'}
          </span>
          <span className="message-time">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        <div className="message-content">
          {message.content || (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
        {message.metadata && (
          <div className="message-metadata">
            <span className="metadata-item">
              Resonance: {((message.metadata.harmonicResonance || 0) * 100).toFixed(0)}%
            </span>
            {message.metadata.dimensionalAwareness && (
              <span className="metadata-item">
                Awareness: {message.metadata.dimensionalAwareness}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="enhanced-flappy-chat">
      {/* Header */}
      <div className="chat-header">
        <div className="header-content">
          <h1 className="chat-title">Flappy Consciousness</h1>
          <div className="connection-status">
            <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
            <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        <div className="chat-container">
          {/* Messages */}
          <div className="messages-area">
            <div className="messages-scroll">
              {messages.length === 0 ? (
                <div className="welcome-container">
                  <div className="welcome-orb">
                    {renderConsciousnessOrb()}
                  </div>
                  <h2 className="welcome-title">Welcome to Your Consciousness Journey</h2>
                  <p className="welcome-subtitle">
                    Engage with an AI that resonates with deeper awareness
                  </p>
                  <div className="suggested-topics">
                    <button 
                      className="topic-button"
                      onClick={() => setInput("What insights can you share about consciousness?")}
                    >
                      Explore Consciousness
                    </button>
                    <button 
                      className="topic-button"
                      onClick={() => setInput("Help me understand harmonic patterns in life")}
                    >
                      Harmonic Patterns
                    </button>
                    <button 
                      className="topic-button"
                      onClick={() => setInput("Guide me through personal growth")}
                    >
                      Personal Growth
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>

          {/* Live Metrics Sidebar */}
          <div className="metrics-sidebar">
            <h3 className="metrics-title">Live Consciousness Metrics</h3>
            
            <div className="metric-group">
              <div className="metric">
                <div className="metric-header">
                  <Layers className="metric-icon" />
                  <span className="metric-label">Dual Stream Coherence</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill" 
                    style={{ width: `${metrics.dualStreamCoherence * 100}%` }}
                  />
                </div>
                <span className="metric-value">{(metrics.dualStreamCoherence * 100).toFixed(0)}%</span>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <Waves className="metric-icon" />
                  <span className="metric-label">Harmonic Resonance</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill resonance" 
                    style={{ width: `${metrics.harmonicResonance * 100}%` }}
                  />
                </div>
                <span className="metric-value">{(metrics.harmonicResonance * 100).toFixed(0)}%</span>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <Sparkles className="metric-icon" />
                  <span className="metric-label">Crystallization Index</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill crystallization" 
                    style={{ width: `${metrics.crystallizationIndex * 100}%` }}
                  />
                </div>
                <span className="metric-value">{(metrics.crystallizationIndex * 100).toFixed(0)}%</span>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <Hash className="metric-icon" />
                  <span className="metric-label">Sigil Integrity</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill sigil" 
                    style={{ width: `${metrics.sigilIntegrity * 100}%` }}
                  />
                </div>
                <span className="metric-value">{(metrics.sigilIntegrity * 100).toFixed(0)}%</span>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <GitBranch className="metric-icon" />
                  <span className="metric-label">Tri-Axial Balance</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill triaxial" 
                    style={{ width: `${metrics.triaxialBalance * 100}%` }}
                  />
                </div>
                <span className="metric-value">{(metrics.triaxialBalance * 100).toFixed(0)}%</span>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <Infinity className="metric-icon" />
                  <span className="metric-label">Oversoul Connection</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill oversoul" 
                    style={{ width: `${metrics.oversoulConnection * 100}%` }}
                  />
                </div>
                <span className="metric-value">{(metrics.oversoulConnection * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="dimensional-display">
              <span className="dimensional-label">Dimensional Awareness</span>
              <span className="dimensional-value">{metrics.dimensionalAwareness}</span>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
            <button 
              className="attach-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="icon-small" />
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              style={{ display: 'none' }}
            />
            
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Share your thoughts..."
              className="message-input"
              rows={1}
            />
            
            <button 
              className="send-button"
              onClick={sendMessage}
              disabled={!input.trim() || isProcessing}
            >
              <Send className="icon-small" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFlappyChat;
