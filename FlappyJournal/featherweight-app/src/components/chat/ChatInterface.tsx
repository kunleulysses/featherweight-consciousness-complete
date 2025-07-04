import React, { useState, useEffect, useRef } from 'react';
import chatService from '../../services/chatService';
import { toast } from 'react-hot-toast';
import './ChatInterface.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connectToChat();
    
    return () => {
      chatService.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const connectToChat = async () => {
    try {
      await chatService.connect();
      
      chatService.on('connected', (data) => {
        setIsConnected(true);
        console.log('Connected to chat server:', data);
        chatService.createSession();
      });

      chatService.on('disconnected', () => {
        setIsConnected(false);
        toast.error('Disconnected from chat server');
      });

      chatService.on('session_created', (session) => {
        setCurrentSession(session.id);
        console.log('Chat session created:', session.id);
      });

      chatService.on('message_saved', (message) => {
        setMessages(prev => [...prev, message]);
      });

      chatService.on('ai_response_chunk', (data) => {
        setStreamingContent(prev => prev + data.content);
      });

      chatService.on('ai_response_complete', (message) => {
        setMessages(prev => [...prev, message]);
        setStreamingContent('');
        setIsLoading(false);
      });

      chatService.on('error', (error) => {
        console.error('Chat error:', error);
        toast.error(error.message || 'Chat error occurred');
        setIsLoading(false);
      });

      chatService.on('connection_failed', () => {
        toast.error('Failed to connect to chat server');
      });

    } catch (error) {
      console.error('Failed to connect to chat:', error);
      toast.error('Failed to connect to chat server');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || !isConnected || !currentSession || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      chatService.sendMessage(userMessage, currentSession);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <span className="chat-icon">🤖</span>
          <h3>AI Research Assistant</h3>
        </div>
        <div className="connection-status">
          {isConnected ? (
            <>
              <span className="status-dot connected"></span>
              <span>Connected</span>
            </>
          ) : (
            <>
              <span className="status-dot disconnected"></span>
              <span>Connecting...</span>
            </>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && !streamingContent ? (
          <div className="chat-empty">
            <span className="chat-empty-icon">🤖</span>
            <p>Start a conversation with your AI research assistant</p>
            <p className="chat-empty-subtitle">Ask questions about your data, get insights, or request analysis</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.role === 'assistant' ? 'assistant' : 'user'}`}
              >
                <div className="message-avatar">
                  {message.role === 'assistant' ? '🤖' : '👤'}
                </div>
                <div className="message-content">
                  <p>{message.content}</p>
                  <span className="message-time">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            
            {streamingContent && (
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <p>{streamingContent}</p>
                  <span className="typing-indicator">●●●</span>
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
          placeholder={isConnected ? "Ask me anything..." : "Connecting to server..."}
          disabled={!isConnected || isLoading}
        />
        <button 
          onClick={handleSend}
          disabled={!isConnected || isLoading || !input.trim()}
        >
          {isLoading ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  );
}
