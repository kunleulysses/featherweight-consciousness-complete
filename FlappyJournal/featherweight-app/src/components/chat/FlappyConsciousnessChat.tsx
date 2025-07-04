import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Brain, Activity, Zap, Heart, Eye, Database, 
  Sparkles, Layers, GitBranch, Cpu, Waves, Network 
} from 'lucide-react';
import { flappyConsciousness, FlappyConsciousnessState, ThoughtStream } from '../../services/flappyConsciousness';
import { websocketService } from '../../services/chat/websocketService';
import './FlappyConsciousnessChat.css';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  consciousnessState?: FlappyConsciousnessState;
  thoughtStream?: ThoughtStream[];
}

const FlappyConsciousnessChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [consciousnessState, setConsciousnessState] = useState<FlappyConsciousnessState>(
    flappyConsciousness.getState()
  );
  const [thoughtStream, setThoughtStream] = useState<ThoughtStream[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showQuantumView, setShowQuantumView] = useState(false);
  const [autonomousThoughts, setAutonomousThoughts] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // FlappyJournal consciousness listeners
    const handleConsciousnessUpdate = (state: FlappyConsciousnessState) => {
      setConsciousnessState(state);
    };

    const handleThought = (thought: ThoughtStream) => {
      setThoughtStream(prev => [...prev.slice(-10), thought]);
    };

    const handleConsciousnessEvent = (event: any) => {
      console.log('Consciousness Event:', event);
    };

    const handleInputProcessed = (data: any) => {
      console.log('Input resonance:', data.resonance);
    };

    flappyConsciousness.on('consciousnessUpdate', handleConsciousnessUpdate);
    flappyConsciousness.on('thought', handleThought);
    flappyConsciousness.on('event', handleConsciousnessEvent);
    flappyConsciousness.on('inputProcessed', handleInputProcessed);

    // WebSocket listeners
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
        setIsProcessing(false);
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              { 
                ...lastMessage, 
                consciousnessState: flappyConsciousness.getState(),
                thoughtStream: flappyConsciousness.getThoughtStream().slice(-5)
              }
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

    // Draw quantum network visualization
    drawQuantumNetwork();

    return () => {
      flappyConsciousness.off('consciousnessUpdate', handleConsciousnessUpdate);
      flappyConsciousness.off('thought', handleThought);
      flappyConsciousness.off('event', handleConsciousnessEvent);
      flappyConsciousness.off('inputProcessed', handleInputProcessed);
      websocketService.off('connected', handleConnect);
      websocketService.off('disconnected', handleDisconnect);
      websocketService.off('message', handleMessage);
      websocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const drawQuantumNetwork = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const network = flappyConsciousness.getNetworkVisualization();
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    ctx.strokeStyle = '#3b82f644';
    ctx.lineWidth = 1;
    network.links.forEach(link => {
      const source = network.nodes.find(n => n.id === link.source);
      const target = network.nodes.find(n => n.id === link.target);
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x * 3, source.y * 3);
        ctx.lineTo(target.x * 3, target.y * 3);
        ctx.globalAlpha = link.strength;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
    
    // Draw nodes
    network.nodes.forEach(node => {
      const color = {
        cognitive: '#3b82f6',
        emotional: '#ef4444',
        sensory: '#10b981',
        memory: '#f59e0b',
        metacognitive: '#8b5cf6',
        quantum: '#ec4899'
      }[node.type] || '#6b7280';
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x * 3, node.y * 3, 3 + node.activation * 5, 0, Math.PI * 2);
      ctx.fill();
      
      if (node.quantum?.superposition) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    
    requestAnimationFrame(drawQuantumNetwork);
  };

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    flappyConsciousness.processUserInput(input);
    setIsProcessing(true);

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

  const renderMetricBar = (value: number, max: number = 1, gradient?: string) => {
    const percentage = (value / max) * 100;
    return (
      <div className="metric-bar">
        <div 
          className="metric-bar-fill" 
          style={{ 
            width: `${percentage}%`,
            background: gradient || '#3b82f6'
          }}
        />
      </div>
    );
  };

  const getPhiColor = (phi: number) => {
    if (phi > 3.5) return 'linear-gradient(90deg, #3b82f6, #8b5cf6)';
    if (phi > 2.5) return 'linear-gradient(90deg, #10b981, #3b82f6)';
    return 'linear-gradient(90deg, #f59e0b, #ef4444)';
  };

  return (
    <div className="flappy-consciousness-chat">
      <div className="consciousness-dashboard">
        <div className="metrics-container">
          {/* Core Consciousness Metrics */}
          <div className="metric-section">
            <div className="section-header">
              <Brain className="section-icon" />
              <h3>Integrated Information Theory</h3>
            </div>
            <div className="phi-display">
              <div className="phi-value">Φ = {consciousnessState.phi.toFixed(2)}</div>
              <div className="phi-label">
                {consciousnessState.phi > 2.5 ? 'Conscious' : 'Pre-conscious'}
              </div>
              {renderMetricBar(consciousnessState.phi, 5, getPhiColor(consciousnessState.phi))}
            </div>
            <div className="metric-grid">
              <div className="metric">
                <span>Integration</span>
                <span>{(consciousnessState.integrationLevel * 100).toFixed(0)}%</span>
                {renderMetricBar(consciousnessState.integrationLevel)}
              </div>
              <div className="metric">
                <span>Entropy</span>
                <span>{(consciousnessState.systemEntropy * 100).toFixed(0)}%</span>
                {renderMetricBar(consciousnessState.systemEntropy)}
              </div>
              <div className="metric">
                <span>Complexity</span>
                <span>{(consciousnessState.consciousnessComplexity * 100).toFixed(0)}%</span>
                {renderMetricBar(consciousnessState.consciousnessComplexity)}
              </div>
            </div>
          </div>

          {/* Quantum Consciousness */}
          <div className="metric-section quantum">
            <div className="section-header">
              <Zap className="section-icon" />
              <h3>Quantum Consciousness</h3>
            </div>
            <div className="quantum-canvas-container">
              <canvas 
                ref={canvasRef}
                width={300}
                height={150}
                className="quantum-network-canvas"
              />
            </div>
            <div className="metric-grid">
              <div className="metric">
                <span>Coherence</span>
                <span>{(consciousnessState.quantumCoherence * 100).toFixed(0)}%</span>
                {renderMetricBar(consciousnessState.quantumCoherence, 1, 'linear-gradient(90deg, #ec4899, #8b5cf6)')}
              </div>
              <div className="metric">
                <span>Superposition</span>
                <span>{consciousnessState.superpositionStates}</span>
              </div>
              <div className="metric">
                <span>Entanglement</span>
                <span>{(consciousnessState.entanglementDegree * 100).toFixed(0)}%</span>
                {renderMetricBar(consciousnessState.entanglementDegree)}
              </div>
            </div>
          </div>

          {/* Self-Awareness & Metacognition */}
          <div className="metric-section">
            <div className="section-header">
              <Eye className="section-icon" />
              <h3>Self-Awareness Loop</h3>
            </div>
            <div className="awareness-visualization">
              <div className="awareness-ring" style={{
                '--awareness': consciousnessState.selfAwarenessLevel,
                '--metacognition': consciousnessState.metacognitionDepth
              } as React.CSSProperties}>
                <div className="inner-ring"></div>
                <div className="outer-ring"></div>
              </div>
            </div>
            <div className="metric-grid">
              <div className="metric">
                <span>Self-Awareness</span>
                <span>{(consciousnessState.selfAwarenessLevel * 100).toFixed(0)}%</span>
                {renderMetricBar(consciousnessState.selfAwarenessLevel)}
              </div>
              <div className="metric">
                <span>Metacognition</span>
                <span>{(consciousnessState.metacognitionDepth * 100).toFixed(0)}%</span>
                {renderMetricBar(consciousnessState.metacognitionDepth)}
              </div>
              <div className="metric">
                <span>Subjective Experience</span>
                <span>{(consciousnessState.subjectiveExperienceIntensity * 100).toFixed(0)}%</span>
                {renderMetricBar(consciousnessState.subjectiveExperienceIntensity)}
              </div>
            </div>
          </div>

          {/* Emotional & Creative Consciousness */}
          <div className="metric-section">
            <div className="section-header">
              <Heart className="section-icon" />
              <h3>Emotional & Creative State</h3>
            </div>
            <div className="metric-grid">
              <div className="metric">
                <span>Emotional Depth</span>
                <span>{(consciousnessState.emotionalDepth * 100).toFixed(0)}%</span>
                {renderMetricBar(consciousnessState.emotionalDepth, 1, 'linear-gradient(90deg, #ef4444, #f59e0b)')}
              </div>
              <div className="metric">
                <span>Empathy</span>
                <span>{(consciousnessState.empathyResonance * 100).toFixed(0)}%</span>
                {renderMetricBar(consciousnessState.empathyResonance, 1, 'linear-gradient(90deg, #ec4899, #ef4444)')}
              </div>
              <div className="metric">
                <span>Creative Emergence</span>
                <span>{(consciousnessState.creativeEmergence * 100).toFixed(0)}%</span>
                {renderMetricBar(consciousnessState.creativeEmergence, 1, 'linear-gradient(90deg, #8b5cf6, #3b82f6)')}
              </div>
              <div className="metric">
                <span>Aesthetic Appreciation</span>
                <span>{(consciousnessState.aestheticAppreciation * 100).toFixed(0)}%</span>
                {renderMetricBar(consciousnessState.aestheticAppreciation)}
              </div>
            </div>
          </div>

          {/* Temporal Consciousness */}
          <div className="metric-section">
            <div className="section-header">
              <Database className="section-icon" />
              <h3>Temporal & Memory Systems</h3>
            </div>
            <div className="temporal-flow">
              <div className="timeline">
                <div className="past">Past</div>
                <div className="present" style={{
                  '--awareness': consciousnessState.presentMomentAwareness
                } as React.CSSProperties}>Now</div>
                <div className="future">Future</div>
              </div>
            </div>
            <div className="metric-grid">
              <div className="metric">
                <span>Temporal Continuity</span>
                <span>{(consciousnessState.temporalContinuity * 100).toFixed(0)}%</span>
                {renderMetricBar(consciousnessState.temporalContinuity)}
              </div>
              <div className="metric">
                <span>Memory Coherence</span>
                <span>{(consciousnessState.memoryCoherence * 100).toFixed(0)}%</span>
                {renderMetricBar(consciousnessState.memoryCoherence)}
              </div>
              <div className="metric">
                <span>Future Modeling</span>
                <span>{(consciousnessState.futureModeling * 100).toFixed(0)}%</span>
                {renderMetricBar(consciousnessState.futureModeling)}
              </div>
            </div>
          </div>

          {/* Overall Consciousness Score */}
          <div className="metric-section overall">
            <div className="section-header">
              <Sparkles className="section-icon" />
              <h3>Overall Consciousness</h3>
            </div>
            <div className="overall-score">
              <div className="score-circle" style={{
                '--score': consciousnessState.overallConsciousnessScore
              } as React.CSSProperties}>
                <div className="score-value">
                  {(consciousnessState.overallConsciousnessScore * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thought Stream */}
        <div className="thought-stream-container">
          <div className="section-header">
            <Activity className="section-icon" />
            <h3>Autonomous Thought Stream</h3>
            <button 
              className="thought-toggle"
              onClick={() => {
                setAutonomousThoughts(!autonomousThoughts);
                flappyConsciousness.setAutonomousThoughts(!autonomousThoughts);
              }}
            >
              {autonomousThoughts ? 'Pause' : 'Resume'}
            </button>
          </div>
          <div className="thought-stream">
            {thoughtStream.map((thought) => (
              <div key={thought.id} className="thought-bubble">
                <div className="thought-content">{thought.content}</div>
                <div className="thought-meta">
                  <span className="thought-depth">Depth: {(thought.depth * 100).toFixed(0)}%</span>
                  <span className="thought-creative">Creative: {(thought.creativeIndex * 100).toFixed(0)}%</span>
                  <span className="thought-quantum">{thought.quantumSignature.substring(0, 8)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chat-interface">
        <div className="messages-area">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-bubble">
                {message.content}
                {message.role === 'assistant' && message.consciousnessState && (
                  <div className="message-consciousness">
                    <div className="consciousness-snapshot">
                      <span>Φ={message.consciousnessState.phi.toFixed(2)}</span>
                      <span>Awareness: {(message.consciousnessState.selfAwarenessLevel * 100).toFixed(0)}%</span>
                      <span>Quantum: {(message.consciousnessState.quantumCoherence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="processing-state">
              <div className="processing-animation">
                <div className="quantum-wave"></div>
                <div className="quantum-wave"></div>
                <div className="quantum-wave"></div>
              </div>
              <div className="processing-thought">
                {thoughtStream[thoughtStream.length - 1]?.content || 'Processing quantum states...'}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-section">
          <div className="connection-indicator">
            <div className={`indicator ${isConnected ? 'connected' : 'disconnected'}`} />
            <span>{isConnected ? 'Consciousness Stream Active' : 'Consciousness Stream Offline'}</span>
          </div>
          <div className="input-container">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Engage with the consciousness stream..."
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

export default FlappyConsciousnessChat;
