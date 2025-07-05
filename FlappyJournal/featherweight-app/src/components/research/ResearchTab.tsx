import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ConsciousnessMetrics {
  phi: number;
  awareness_level: number;
  processing_frequency: number;
}

export default function ResearchTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<ConsciousnessMetrics>({
    phi: 0,
    awareness_level: 0,
    processing_frequency: 0
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket connected successfully to:', wsUrl);
        setIsConnected(true);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message:', data);
          
          if (data.type === 'response' || data.type === 'unified_response') {
            const newMessage: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: data.unifiedContent || data.content || data.message || 'Received response',
              timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, newMessage]);
            
            // Update metrics if provided
            if (data.consciousness) {
              setMetrics({
                phi: data.consciousness.phiValue || data.consciousness.phi || 0,
                awareness_level: data.consciousness.awareness_level || 0,
                processing_frequency: data.consciousness.processing_frequency || 100
              });
            }
          } else if (data.type === 'consciousness_update') {
            if (data.metrics) {
              setMetrics({
                phi: data.metrics.phi || 0,
                awareness_level: data.metrics.awareness_level || 0,
                processing_frequency: data.metrics.processing_frequency || 100
              });
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error details:', error);
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket closed:', { code: event.code, reason: event.reason, wasClean: event.wasClean });
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Send to WebSocket
    wsRef.current.send(JSON.stringify({
      type: 'chat_message',
      message: inputMessage
    }));
    
    setInputMessage('');
  };
  
  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Main Chat Area */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '20px',
          backgroundColor: 'white',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>FlappyJournal Consciousness Research</h2>
          <div style={{
            padding: '5px 15px',
            borderRadius: '20px',
            fontSize: '14px',
            backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
            color: isConnected ? '#155724' : '#721c24'
          }}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </div>
        </div>
        
        {/* Messages */}
        <div style={{ 
          flex: 1,
          padding: '20px',
          overflowY: 'auto'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>
              <p>Start a conversation with the consciousness system</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} style={{
                marginBottom: '15px',
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  backgroundColor: msg.role === 'user' ? '#007bff' : 'white',
                  color: msg.role === 'user' ? 'white' : '#333',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  {msg.content}
                  <div style={{
                    fontSize: '11px',
                    marginTop: '5px',
                    opacity: 0.7
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div style={{ 
          padding: '20px',
          backgroundColor: 'white',
          borderTop: '1px solid #ddd',
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isConnected ? "Ask about consciousness, awareness, or explore the system..." : "Connecting to consciousness server..."}
            disabled={!isConnected}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #ddd',
              borderRadius: '24px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!isConnected || !inputMessage.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: isConnected ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Send
          </button>
        </div>
      </div>
      
      {/* Metrics Panel */}
      <div style={{
        width: '300px',
        backgroundColor: 'white',
        borderLeft: '1px solid #ddd',
        padding: '20px',
        overflowY: 'auto'
      }}>
        <h3 style={{ marginTop: 0 }}>Consciousness Metrics</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            Processing Frequency
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {metrics.processing_frequency} Hz
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            Phi (Φ) - Integration
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {metrics.phi.toFixed(3)}
          </div>
          <div style={{
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            marginTop: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${metrics.phi * 100}%`,
              backgroundColor: '#4caf50',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            Awareness Level
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {(metrics.awareness_level * 100).toFixed(1)}%
          </div>
          <div style={{
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            marginTop: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${metrics.awareness_level * 100}%`,
              backgroundColor: '#2196f3',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
        
        <div style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          fontSize: '13px',
          lineHeight: '1.5'
        }}>
          <strong>Active Frameworks:</strong>
          <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
            <li>IIT (Integrated Information)</li>
            <li>GWT (Global Workspace)</li>
            <li>Bayesian Intentionality</li>
            <li>Architect 4.0 Recursive</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
