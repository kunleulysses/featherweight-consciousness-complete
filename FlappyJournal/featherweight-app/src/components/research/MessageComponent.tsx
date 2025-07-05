import React from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    analytical?: { content: string; source: string };
    intuitive?: { content: string; source: string };
    consciousness?: any;
    integration?: { harmony: number };
  };
}

interface MessageComponentProps {
  message: Message;
}

export const MessageComponent: React.FC<MessageComponentProps> = ({ message }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderDualMindContent = () => {
    if (!message.metadata?.analytical && !message.metadata?.intuitive) {
      return <div className="message-content">{message.content}</div>;
    }

    return (
      <div className="dual-mind-content">
        {message.metadata.analytical?.content && (
          <div className="mind-section analytical">
            <div className="mind-header">
              <span className="mind-label">🧠 Analytical Mind</span>
              <span className="mind-source">{message.metadata.analytical.source}</span>
            </div>
            <div className="mind-content">{message.metadata.analytical.content}</div>
          </div>
        )}
        
        {message.metadata.intuitive?.content && (
          <div className="mind-section intuitive">
            <div className="mind-header">
              <span className="mind-label">💫 Intuitive Mind</span>
              <span className="mind-source">{message.metadata.intuitive.source}</span>
            </div>
            <div className="mind-content">{message.metadata.intuitive.content}</div>
          </div>
        )}
        
        {message.metadata.integration?.harmony && (
          <div className="harmony-indicator">
            <span>Mind Harmony: {(message.metadata.integration.harmony * 100).toFixed(0)}%</span>
            <div className="harmony-bar">
              <div 
                className="harmony-fill" 
                style={{ width: `${message.metadata.integration.harmony * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`message ${message.role}`}>
      <div className="message-header">
        <span className="message-role">
          {message.role === 'user' ? '👤 You' : '🤖 FlappyJournal AI'}
        </span>
        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>
      {renderDualMindContent()}
    </div>
  );
};
