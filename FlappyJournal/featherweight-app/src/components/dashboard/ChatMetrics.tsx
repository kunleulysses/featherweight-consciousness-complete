import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useMetricData } from '../../hooks/useMetricData';
import './ChatMetrics.css';

export default function ChatMetrics() {
  const { messages, isGenerating } = useChat();
  const messageSentData = useMetricData('message_sent');
  const messageReceivedData = useMetricData('message_received');
  
  const [stats, setStats] = useState({
    totalMessages: 0,
    userMessages: 0,
    assistantMessages: 0,
    avgResponseTime: 0,
    lastMessageTime: null as Date | null
  });

  useEffect(() => {
    const userMessages = messages.filter(m => m.role === 'user').length;
    const assistantMessages = messages.filter(m => m.role === 'assistant').length;
    
    // Calculate average response time from metadata
    const responseTimes = messages
      .filter(m => m.role === 'assistant' && m.metadata?.processingTime)
      .map(m => m.metadata!.processingTime!);
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    
    setStats({
      totalMessages: messages.length,
      userMessages,
      assistantMessages,
      avgResponseTime,
      lastMessageTime: messages.length > 0 ? messages[messages.length - 1].timestamp : null
    });
  }, [messages]);

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatLastMessageTime = (time: Date | null) => {
    if (!time) return 'No messages yet';
    const now = new Date();
    const diff = now.getTime() - time.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return time.toLocaleTimeString();
  };

  return (
    <div className="chat-metrics">
      <h3 className="section-title">Chat Activity</h3>
      
      <div className="chat-stats-grid">
        <div className="stat-item">
          <div className="stat-label">Total Messages</div>
          <div className="stat-value">{stats.totalMessages}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">User Messages</div>
          <div className="stat-value user">{stats.userMessages}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">AI Responses</div>
          <div className="stat-value assistant">{stats.assistantMessages}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Avg Response Time</div>
          <div className="stat-value">{formatTime(stats.avgResponseTime)}</div>
        </div>
      </div>
      
      <div className="chat-activity">
        <div className="activity-status">
          <div className={`status-indicator ${isGenerating ? 'active' : 'idle'}`}></div>
          <span>{isGenerating ? 'AI is thinking...' : 'Ready'}</span>
        </div>
        
        <div className="last-activity">
          Last message: {formatLastMessageTime(stats.lastMessageTime)}
        </div>
      </div>
      
      {messageSentData && (
        <div className="recent-activity">
          <div className="activity-item sent">
            📤 Message sent ({messageSentData.messageLength} chars)
          </div>
        </div>
      )}
      
      {messageReceivedData && (
        <div className="recent-activity">
          <div className="activity-item received">
            📥 Response received ({formatTime(messageReceivedData.processingTime)})
          </div>
        </div>
      )}
    </div>
  );
}
