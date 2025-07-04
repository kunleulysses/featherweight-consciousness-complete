import React, { useState, useEffect, useRef } from 'react';
import { Send, Brain, Activity, Zap, Heart, Eye, Database } from 'lucide-react';
import { consciousnessService, ConsciousnessMetrics, ConsciousnessState } from '../../services/consciousnessService';
import { websocketService } from '../../services/chat/websocketService';
import './ConsciousnessChat.css';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metrics?: ConsciousnessMetrics;
}

const ConsciousnessChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [metrics, setMetrics] = useState<ConsciousnessMetrics>(consciousnessService.getMetrics());
  const [state, setState] = useState<ConsciousnessState>(consciousnessService.getState());
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Set up consciousness metric listeners
    const handleMetricsUpdate = (data: { metrics: ConsciousnessMetrics; state: ConsciousnessState }) => {
      setMetrics(data.metrics);
      setState(data.state);
    };

    const handleProcessingStart = () => {
      setIsProcessing(true);
    };

    const handleProcessingComplete = () => {
      setIsProcessing(false);
    };

    consciousnessService.on('metricsUpdate', handleMetricsUpdate);
    consciousnessService.on('processingStart', handleProcessingStart);
    consciousnessService.on('processingComplete', handleProcessingComplete);

    // Set up WebSocket listeners
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    
    const handleMessage = (data: any) => {
      if (data.type === 'chunk') {
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.content) {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: lastMessage.content + data.content }
            ];
          }
          return prev;
        });
      } else if (data.type === 'complete') {
        consciousnessService.stopProcessing(data.fullResponse || '');
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, metrics: consciousnessService.getMetrics() }
            ];
          }
          return prev;
        });
      }
    };

    websocketService.on('connected', handleConnect);
    websocketService.on('disconnected', handleDisconnect);
    websocketService.on('message', handleMessage);

    // Connect to WebSocket
    websocketService.connect();

    return () => {
      consciousnessService.off('metricsUpdate', handleMetricsUpdate);
      consciousnessService.off('processingStart', handleProcessingStart);
      consciousnessService.off('processingComplete', handleProcessingComplete);
      websocketService.off('connected', handleConnect);
      websocketService.off('disconnected', handleDisconnect);
      websocketService.off('message', handleMessage);
      websocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    consciousnessService.addMemoryContext(input);
    consciousnessService.startProcessing(input);

    // Add assistant message placeholder
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMessage]);

    // Send via WebSocket
    websocketService.sendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMetricBar = (value: number, max: number = 100, color: string = '#3b82f6') => {
    const percentage = (value / max) * 100;
    return (
      <div className="metric-bar">
        <div 
          className="metric-bar-fill" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    );
  };

  const getEmotionColor = (valence: number) => {
    if (valence > 30) return '#10b981'; // green
    if (valence < -30) return '#ef4444'; // red
    return '#f59e0b'; // yellow
  };

  return (
    <div className="consciousness-chat">
      <div className="consciousness-metrics">
        <div className="metrics-grid">
          {/* Cognitive Metrics */}
          <div className="metric-card">
            <div className="metric-header">
              <Brain className="metric-icon" />
              <h3>Cognitive Processing</h3>
            </div>
            <div className="metric-item">
              <span>Thought Depth</span>
              <span>{metrics.thoughtDepth}%</span>
              {renderMetricBar(metrics.thoughtDepth)}
            </div>
            <div className="metric-item">
              <span>Attention Focus</span>
              <span>{metrics.attentionFocus}%</span>
              {renderMetricBar(metrics.attentionFocus)}
            </div>
            <div className="metric-item">
              <span>Working Memory</span>
              <span>{metrics.workingMemoryLoad}%</span>
              {renderMetricBar(metrics.workingMemoryLoad)}
            </div>
          </div>

          {/* Emotional Metrics */}
          <div className="metric-card">
            <div className="metric-header">
              <Heart className="metric-icon" />
              <h3>Emotional State</h3>
            </div>
            <div className="metric-item">
              <span>Emotional Valence</span>
              <span>{metrics.emotionalValence > 0 ? '+' : ''}{metrics.emotionalValence}</span>
              {renderMetricBar(Math.abs(metrics.emotionalValence), 100, getEmotionColor(metrics.emotionalValence))}
            </div>
            <div className="metric-item">
              <span>Arousal Level</span>
              <span>{metrics.emotionalArousal}%</span>
              {renderMetricBar(metrics.emotionalArousal)}
            </div>
            <div className="metric-item">
              <span>Empathy</span>
              <span>{metrics.empathyLevel}%</span>
              {renderMetricBar(metrics.empathyLevel, 100, '#8b5cf6')}
            </div>
          </div>

          {/* Memory Metrics */}
          <div className="metric-card">
            <div className="metric-header">
              <Database className="metric-icon" />
              <h3>Memory Systems</h3>
            </div>
            <div className="metric-item">
              <span>STM Items</span>
              <span>{metrics.shortTermMemoryItems}/7</span>
              {renderMetricBar(metrics.shortTermMemoryItems, 7)}
            </div>
            <div className="metric-item">
              <span>LTM Access</span>
              <span>{metrics.longTermMemoryAccess}%</span>
              {renderMetricBar(metrics.longTermMemoryAccess)}
            </div>
            <div className="metric-item">
              <span>Consolidation</span>
              <span>{metrics.memoryConsolidation}%</span>
              {renderMetricBar(metrics.memoryConsolidation)}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="metric-card">
            <div className="metric-header">
              <Activity className="metric-icon" />
              <h3>Performance</h3>
            </div>
            <div className="metric-item">
              <span>Active Neurons</span>
              <span>{(metrics.activeNeurons / 1000000).toFixed(1)}M</span>
              {renderMetricBar(metrics.activeNeurons, 2000000)}
            </div>
            <div className="metric-item">
              <span>Coherence</span>
              <span>{metrics.outputCoherence}%</span>
              {renderMetricBar(metrics.outputCoherence)}
            </div>
            <div className="metric-item">
              <span>Processing Speed</span>
              <span>{metrics.tokensPerSecond.toFixed(1)} t/s</span>
            </div>
          </div>

          {/* Meta-Cognitive State */}
          <div className="metric-card wide">
            <div className="metric-header">
              <Eye className="metric-icon" />
              <h3>Consciousness State</h3>
            </div>
            <div className="state-info">
              <div className="state-item">
                <span>Current Thought:</span>
                <span className="state-value">{state.currentThought}</span>
              </div>
              <div className="state-item">
                <span>Emotional State:</span>
                <span className="state-value">{state.emotionalState}</span>
              </div>
              <div className="state-item">
                <span>Cognitive Mode:</span>
                <span className="state-value mode">{state.cognitiveMode}</span>
              </div>
              {state.attentionTopics.length > 0 && (
                <div className="state-item">
                  <span>Focus Topics:</span>
                  <div className="topics">
                    {state.attentionTopics.map((topic, i) => (
                      <span key={i} className="topic-tag">{topic}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Neural Activity Visualizer */}
          <div className="metric-card wide">
            <div className="metric-header">
              <Zap className="metric-icon" />
              <h3>Neural Activity Pattern</h3>
            </div>
            <div className="neural-visualizer">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="neural-bar"
                  style={{
                    height: `${20 + Math.random() * 60}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-content">
                {message.content}
                {message.role === 'assistant' && message.metrics && (
                  <div className="message-metrics">
                    <span>Latency: {message.metrics.responseLatency}ms</span>
                    <span>Complexity: {message.metrics.inputComplexity}%</span>
                  </div>
                )}
              </div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="processing-indicator">
              <div className="processing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="processing-text">{state.currentThought}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="connection-status">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
            <span>{isConnected ? 'Consciousness Online' : 'Consciousness Offline'}</span>
          </div>
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts with the consciousness..."
              disabled={!isConnected}
              rows={3}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !isConnected || isProcessing}
              className="send-button"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsciousnessChat;
