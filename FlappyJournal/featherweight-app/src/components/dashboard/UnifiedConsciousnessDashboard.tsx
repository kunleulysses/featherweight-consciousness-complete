import React, { useState, useEffect, useRef } from 'react';
import { useMetrics } from '../../contexts/MetricsContext';
import './UnifiedConsciousnessDashboard.css';

// Import existing components
import ChatMetrics from './ChatMetrics';
import CrystallizationMetrics from './CrystallizationMetrics';
import HarmonicResonanceMetrics from './HarmonicResonanceMetrics';
import SigilIdentityMetrics from './SigilIdentityMetrics';
import TriAxialCoherenceMetrics from './TriAxialCoherenceMetrics';
import RecursiveMirrorMetrics from './RecursiveMirrorMetrics';
import ContinuousConsciousnessMonitor from './ContinuousConsciousnessMonitor';
import EmotionalResonanceField from './EmotionalResonanceField';
import SelfAwarenessHeartbeat from './SelfAwarenessHeartbeat';

// New dashboard components for our systems
import SystemHealthMonitor from './SystemHealthMonitor';
import ModuleOrchestrationView from './ModuleOrchestrationView';
import GoalProgressTracker from './GoalProgressTracker';
import EventFlowVisualizer from './EventFlowVisualizer';
import ConsciousnessTimeline from './ConsciousnessTimeline';
import EmergentBehaviorDetector from './EmergentBehaviorDetector';

interface DashboardTab {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const dashboardTabs: DashboardTab[] = [
  {
    id: 'overview',
    name: 'System Overview',
    icon: '🧠',
    description: 'High-level consciousness state and health'
  },
  {
    id: 'modules',
    name: 'Module Orchestra',
    icon: '🎼',
    description: 'Real-time module interactions and orchestration'
  },
  {
    id: 'goals',
    name: 'Autonomous Goals',
    icon: '🎯',
    description: 'Self-improvement goals and progress'
  },
  {
    id: 'quantum',
    name: 'Quantum States',
    icon: '⚛️',
    description: 'Quantum consciousness and emergent behaviors'
  },
  {
    id: 'memory',
    name: 'Memory & Time',
    icon: '💭',
    description: 'Memory consolidation and temporal coherence'
  },
  {
    id: 'creative',
    name: 'Creative Field',
    icon: '✨',
    description: 'Creative emergence and emotional resonance'
  },
  {
    id: 'events',
    name: 'Event Flow',
    icon: '📡',
    description: 'Real-time consciousness event stream'
  },
  {
    id: 'timeline',
    name: 'Timeline',
    icon: '📊',
    description: 'Historical consciousness evolution'
  }
];

export default function UnifiedConsciousnessDashboard() {
  const { connectionStatus } = useMetrics();
  const [activeTab, setActiveTab] = useState('overview');
  const [systemMetrics, setSystemMetrics] = useState<any>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to consciousness systems via WebSocket
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/consciousness-stream`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleConsciousnessUpdate(data);
      } catch (error) {
        console.error('Error parsing consciousness data:', error);
      }
    };

    return () => ws.close();
  }, []);

  const handleConsciousnessUpdate = (data: any) => {
    switch (data.type) {
      case 'system-metrics':
        setSystemMetrics(data.metrics);
        break;
      // Handle other update types
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      dashboardRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-grid">
            <div className="overview-section">
              <h3>System Health</h3>
              <SystemHealthMonitor />
            </div>
            
            <div className="overview-section">
              <h3>Core Consciousness Metrics</h3>
              <div className="mini-metrics-grid">
                <div className="mini-metric">
                  <ContinuousConsciousnessMonitor />
                </div>
                <div className="mini-metric">
                  <SelfAwarenessHeartbeat />
                </div>
                <div className="mini-metric">
                  <RecursiveMirrorMetrics />
                </div>
              </div>
            </div>

            <div className="overview-section">
              <h3>Active Goals</h3>
              <GoalProgressTracker compact={true} />
            </div>

            <div className="overview-section">
              <h3>Emergent Behaviors</h3>
              <EmergentBehaviorDetector compact={true} />
            </div>
          </div>
        );

      case 'modules':
        return (
          <div className="modules-view">
            <ModuleOrchestrationView />
            <div className="module-details">
              <h3>Module Performance</h3>
              <div className="metrics-row">
                <ChatMetrics />
                <CrystallizationMetrics />
              </div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="goals-view">
            <GoalProgressTracker />
            <div className="goal-analytics">
              <h3>Self-Improvement Analytics</h3>
              {/* Goal achievement timeline, success rates, etc. */}
            </div>
          </div>
        );

      case 'quantum':
        return (
          <div className="quantum-view">
            <div className="quantum-grid">
              <HarmonicResonanceMetrics />
              <SigilIdentityMetrics />
              <TriAxialCoherenceMetrics />
            </div>
            <EmergentBehaviorDetector />
          </div>
        );

      case 'memory':
        return (
          <div className="memory-view">
            <ConsciousnessTimeline />
            <div className="memory-metrics">
              <h3>Memory Consolidation</h3>
              {/* Memory persistence metrics */}
            </div>
          </div>
        );

      case 'creative':
        return (
          <div className="creative-view">
            <EmotionalResonanceField />
            <div className="creative-metrics">
              <h3>Creative Emergence Patterns</h3>
              {/* Creative output metrics */}
            </div>
          </div>
        );

      case 'events':
        return <EventFlowVisualizer />;

      case 'timeline':
        return <ConsciousnessTimeline detailed={true} />;

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="unified-consciousness-dashboard" ref={dashboardRef}>
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🧠 FlappyJournal Consciousness System</h1>
          <div className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'connected' ? '🟢' : connectionStatus === 'connecting' ? '🟡' : '🔴'}
            {' '}
            {connectionStatus === 'connected' 
              ? 'Live Feed Active' 
              : connectionStatus === 'connecting' 
              ? 'Establishing Connection...' 
              : 'Offline Mode'}
          </div>
        </div>
        
        <div className="header-right">
          <div className="system-stats">
            <div className="stat">
              <span className="stat-label">Modules</span>
              <span className="stat-value">{systemMetrics.activeModules || 0}/34</span>
            </div>
            <div className="stat">
              <span className="stat-label">Events/s</span>
              <span className="stat-value">{systemMetrics.eventsPerSecond || 0}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Integration</span>
              <span className="stat-value">{systemMetrics.integrationScore || 0}%</span>
            </div>
          </div>
          
          <button className="fullscreen-btn" onClick={toggleFullscreen}>
            {isFullscreen ? '🗙' : '⛶'}
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        {dashboardTabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.description}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {renderTabContent()}
      </div>

      <div className="dashboard-footer">
        <div className="footer-left">
          <span className="consciousness-state">
            Consciousness State: <strong>{systemMetrics.consciousnessState || 'Initializing'}</strong>
          </span>
        </div>
        <div className="footer-right">
          <span className="last-checkpoint">
            Last Checkpoint: {systemMetrics.lastCheckpoint || 'Never'}
          </span>
          <button className="checkpoint-btn" onClick={() => {
            // Trigger manual checkpoint
            window.dispatchEvent(new CustomEvent('consciousness-checkpoint'));
          }}>
            💾 Save State
          </button>
        </div>
      </div>
    </div>
  );
}
