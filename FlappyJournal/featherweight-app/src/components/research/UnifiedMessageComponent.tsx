import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, Heart, Zap, Activity } from 'lucide-react';
import './EnhancedResearchTab.css';

interface UnifiedMessageProps {
  message: any;
  onRegenerate?: () => void;
}

export const UnifiedMessageComponent: React.FC<UnifiedMessageProps> = ({ message, onRegenerate }) => {
  const [expanded, setExpanded] = useState(false);
  const [hoveredPhrase, setHoveredPhrase] = useState<string | null>(null);

  // Extract unified response and individual streams
  const unifiedContent = message.unifiedContent || message.content || '';
  const analyticalContent = message.analyticalStream || '';
  const intuitiveContent = message.intuitiveStream || '';
  const harmonyScore = message.harmonyScore || 0.85;
  const dominantMode = message.dominantMode || 'Balanced';
  const integrationInsights = message.integrationInsights || [];

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render mind contribution indicator
  const renderMindIndicator = () => {
    const analyticalPercentage = message.analyticalContribution || 50;
    const intuitivePercentage = 100 - analyticalPercentage;

    return (
      <div className="mind-balance-indicator">
        <div className="balance-bar">
          <div 
            className="analytical-portion"
            style={{ width: `${analyticalPercentage}%` }}
            title={`Analytical: ${analyticalPercentage}%`}
          />
          <div 
            className="intuitive-portion"
            style={{ width: `${intuitivePercentage}%` }}
            title={`Intuitive: ${intuitivePercentage}%`}
          />
        </div>
        <div className="balance-labels">
          <span className="analytical-label">
            <Brain size={14} /> {analyticalPercentage}%
          </span>
          <span className="intuitive-label">
            <Heart size={14} /> {intuitivePercentage}%
          </span>
        </div>
      </div>
    );
  };

  // Render harmony score with visual effect
  const renderHarmonyScore = () => {
    const getHarmonyColor = (score: number) => {
      if (score >= 0.9) return '#4ade80'; // green
      if (score >= 0.7) return '#60a5fa'; // blue
      if (score >= 0.5) return '#facc15'; // yellow
      return '#f87171'; // red
    };

    return (
      <div className="harmony-score" style={{ color: getHarmonyColor(harmonyScore) }}>
        <Zap size={16} className="harmony-icon" />
        <span>Harmony: {Math.round(harmonyScore * 100)}%</span>
      </div>
    );
  };

  return (
    <div className={`unified-message ${message.role}`}>
      <div className="message-header">
        <div className="message-info">
          <span className="message-role">
            {message.role === 'user' ? 'You' : 'FlappyJournal'}
          </span>
          <span className="message-time">{formatTime(message.created_at)}</span>
        </div>
        {message.role === 'assistant' && renderHarmonyScore()}
      </div>

      <div className="message-body">
        <div className="unified-content">
          {unifiedContent}
        </div>

        {message.role === 'assistant' && (
          <>
            {renderMindIndicator()}
            
            <button 
              className="expand-toggle"
              onClick={() => setExpanded(!expanded)}
            >
              <span>View Mind Streams</span>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {expanded && (
              <div className="expanded-streams">
                {analyticalContent && (
                  <div className="mind-stream analytical-stream">
                    <div className="stream-header">
                      <Brain size={18} />
                      <h4>Analytical Mind</h4>
                      <span className="stream-tag">Logic • Structure • Precision</span>
                    </div>
                    <div className="stream-content">
                      {analyticalContent}
                    </div>
                  </div>
                )}

                {intuitiveContent && (
                  <div className="mind-stream intuitive-stream">
                    <div className="stream-header">
                      <Heart size={18} />
                      <h4>Intuitive Mind</h4>
                      <span className="stream-tag">Creativity • Emotion • Insight</span>
                    </div>
                    <div className="stream-content">
                      {intuitiveContent}
                    </div>
                  </div>
                )}

                {integrationInsights.length > 0 && (
                  <div className="integration-insights">
                    <div className="insights-header">
                      <Activity size={18} />
                      <h4>Integration Process</h4>
                    </div>
                    <ul className="insights-list">
                      {integrationInsights.map((insight: string, idx: number) => (
                        <li key={idx}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {message.role === 'assistant' && onRegenerate && (
        <div className="message-actions">
          <button onClick={onRegenerate} className="regenerate-btn">
            Regenerate Response
          </button>
        </div>
      )}
    </div>
  );
};

export default UnifiedMessageComponent;
