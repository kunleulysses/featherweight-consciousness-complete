import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useMetrics } from './MetricsContext';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: {
    processingTime?: number;
    tokenCount?: number;
    model?: string;
  };
}

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
  clearMessages: () => void;
  isConnected: boolean;
  isGenerating: boolean;
  currentAssistantMessage: string;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');
  const { wsConnection, connectionStatus } = useMetrics();
  
  const isConnected = connectionStatus === 'connected';

  // Listen for WebSocket messages
  useEffect(() => {
    if (!wsConnection) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle different message types from the server
        if (data.type === 'unified_response') {
          // Complete response from server
          const content = data.unifiedContent || data.content || data.message || '';
          if (content) {
            const assistantMessage: ChatMessage = {
              id: Date.now().toString(),
              content: content,
              role: 'assistant',
              timestamp: new Date(),
              metadata: {
                processingTime: data.processingTime,
                model: data.model
              }
            };
            setMessages(prev => [...prev, assistantMessage]);
            
            // Send metrics update for response received
            const metricData = {
              type: 'message_received',
              timestamp: new Date().toISOString(),
              processingTime: data.processingTime || 0,
              responseLength: content.length
            };
            wsConnection.send(JSON.stringify(metricData));
          }
          setIsGenerating(false);
          setCurrentAssistantMessage('');
        } else if (data.type === 'chat_response') {
          // Assistant is starting to respond
          setIsGenerating(true);
          setCurrentAssistantMessage('');
        } else if (data.type === 'chat_chunk') {
          // Streaming response chunk
          setCurrentAssistantMessage(prev => prev + data.content);
        } else if (data.type === 'chat_complete') {
          // Response complete
          if (currentAssistantMessage || data.content) {
            const assistantMessage: ChatMessage = {
              id: Date.now().toString(),
              content: data.content || currentAssistantMessage,
              role: 'assistant',
              timestamp: new Date(),
              metadata: data.metadata
            };
            setMessages(prev => [...prev, assistantMessage]);
          }
          setCurrentAssistantMessage('');
          setIsGenerating(false);
        } else if (data.type === 'error') {
          console.error('Chat error:', data.message);
          setIsGenerating(false);
          setCurrentAssistantMessage('');
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsConnection.addEventListener('message', handleMessage);
    
    return () => {
      wsConnection.removeEventListener('message', handleMessage);
    };
  }, [wsConnection, currentAssistantMessage]);

  const sendMessage = useCallback((content: string) => {
    if (!content.trim() || !wsConnection || !isConnected) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Send via WebSocket with proper format
    const messageData = {
      type: 'chat_message',
      message: content,  // Server expects 'message' not 'content'
      timestamp: new Date().toISOString()
    };
    
    wsConnection.send(JSON.stringify(messageData));
    setIsGenerating(true);
    
    // Also send a metric update for message sent
    const metricData = {
      type: 'message_sent',
      timestamp: new Date().toISOString(),
      messageLength: content.length
    };
    wsConnection.send(JSON.stringify(metricData));
  }, [wsConnection, isConnected]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentAssistantMessage('');
    setIsGenerating(false);
  }, []);

  const value: ChatContextType = {
    messages,
    sendMessage,
    clearMessages,
    isConnected,
    isGenerating,
    currentAssistantMessage
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
