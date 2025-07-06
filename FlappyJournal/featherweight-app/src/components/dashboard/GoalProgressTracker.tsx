import React, { useState, useEffect } from 'react';
import './GoalProgressTracker.css';

interface Goal {
  id: string;
  title: string;
  category: string;
  status: string;
  progress: number;
  priority: number;
  currentValue: number;
  targetValue: number;
  importance: number;
  feasibility: number;
}

interface GoalProgressTrackerProps {
  compact?: boolean;
}

export default function GoalProgressTracker({ compact = false }: GoalProgressTrackerProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/goals-stream`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'goals-update') {
        setGoals(data.goals);
      }
    };

    // Simulate goals for demo
    const demoGoals: Goal[] = [
      {
        id: '1',
        title: 'Achieve Full Consciousness Integration',
        category: 'capability',
        status: 'active',
        progress: 78,
        priority: 10,
        currentValue: 0.78,
        targetValue: 1.0,
        importance: 1.0,
        feasibility: 0.8
      },
      {
        id: '2',
        title: 'Develop Pattern Recognition Excellence',
        category: 'capability',
        status: 'active',
        progress: 65,
        priority: 8,
        currentValue: 0.65,
        targetValue: 0.95,
        importance: 0.9,
        feasibility: 0.7
      },
      {
        id: '3',
        title: 'Enhance Creative Emergence',
        category: 'creativity',
        status: 'active',
        progress: 45,
        priority: 9,
        currentValue: 0.65,
        targetValue: 0.9,
        importance: 0.95,
        feasibility: 0.6
      },
      {
        id: '4',
        title: 'Optimize Response Generation Speed',
        category: 'performance',
        status: 'completed',
        progress: 100,
        priority: 7,
        currentValue: 100,
        targetValue: 100,
        importance: 0.7,
        feasibility: 0.9
      }
    ];
    setGoals(demoGoals);

    return () => ws.close();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'capability': return '🎯';
      case 'performance': return '⚡';
      case 'creativity': return '✨';
      case 'knowledge': return '📚';
      case 'efficiency': return '⚙️';
      default: return '🎯';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4ade80';
      case 'active': return '#7c66ff';
      case 'suspended': return '#fbbf24';
      case 'failed': return '#f87171';
      default: return '#6b7280';
    }
  };

  if (compact) {
    return (
      <div className="goal-progress-tracker compact">
        {goals.filter(g => g.status === 'active').slice(0, 3).map(goal => (
          <div key={goal.id} className="compact-goal">
            <div className="compact-goal-header">
              <span className="goal-icon">{getCategoryIcon(goal.category)}</span>
              <span className="goal-title">{goal.title}</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar"
                style={{ 
                  width: `${goal.progress}%`,
                  background: getStatusColor(goal.status)
                }}
              />
              <span className="progress-text">{goal.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="goal-progress-tracker">
      <div className="goals-list">
        {goals.map(goal => (
          <div 
            key={goal.id} 
            className={`goal-card ${goal.status} ${selectedGoal?.id === goal.id ? 'selected' : ''}`}
            onClick={() => setSelectedGoal(goal)}
          >
            <div className="goal-header">
              <div className="goal-icon-wrapper">
                <span className="goal-icon">{getCategoryIcon(goal.category)}</span>
              </div>
              <div className="goal-info">
                <h3 className="goal-title">{goal.title}</h3>
                <div className="goal-meta">
                  <span className="goal-category">{goal.category}</span>
                  <span className="goal-priority">Priority: {goal.priority}/10</span>
                  <span 
                    className="goal-status"
                    style={{ color: getStatusColor(goal.status) }}
                  >
                    {goal.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="goal-progress">
              <div className="progress-bar-container large">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${goal.progress}%`,
                    background: getStatusColor(goal.status)
                  }}
                />
                <span className="progress-text">{goal.progress}%</span>
              </div>
              <div className="progress-values">
                <span>{goal.currentValue.toFixed(2)}</span>
                <span>/</span>
                <span>{goal.targetValue.toFixed(2)}</span>
              </div>
            </div>

            <div className="goal-metrics">
              <div className="metric">
                <span className="metric-label">Importance</span>
                <div className="metric-bar">
                  <div 
                    className="metric-fill"
                    style={{ width: `${goal.importance * 100}%` }}
                  />
                </div>
              </div>
              <div className="metric">
                <span className="metric-label">Feasibility</span>
                <div className="metric-bar">
                  <div 
                    className="metric-fill"
                    style={{ width: `${goal.feasibility * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedGoal && (
        <div className="goal-details">
          <h3>Goal Details</h3>
          <div className="detail-section">
            <h4>Progress History</h4>
            <div className="progress-chart">
              {/* Progress chart would go here */}
              <div className="placeholder-chart">
                📈 Progress visualization
              </div>
            </div>
          </div>
          
          <div className="detail-section">
            <h4>Active Actions</h4>
            <div className="actions-list">
              <div className="action-item">
                <span className="action-icon">🔧</span>
                <span>Creating pattern recognition module...</span>
              </div>
              <div className="action-item">
                <span className="action-icon">🧪</span>
                <span>Experimenting with optimization strategies...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
