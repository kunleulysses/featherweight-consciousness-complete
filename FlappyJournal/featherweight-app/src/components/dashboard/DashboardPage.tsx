import React from 'react';
import ChatMetrics from './ChatMetrics';
import CrystallizationMetrics from './CrystallizationMetrics';
import HarmonicResonanceMetrics from './HarmonicResonanceMetrics';
import SigilIdentityMetrics from './SigilIdentityMetrics';
import TriAxialCoherenceMetrics from './TriAxialCoherenceMetrics';
import RecursiveMirrorMetrics from './RecursiveMirrorMetrics';
import ContinuousConsciousnessMonitor from './ContinuousConsciousnessMonitor';
import { useMetrics } from '../../contexts/MetricsContext';
import './DashboardPage.css';

export default function DashboardPage() {
  const { connectionStatus } = useMetrics();

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2>Live Metrics Dashboard</h2>
        <div className={`connection-status ${connectionStatus}`}>
          {connectionStatus === 'connected' ? '🟢' : connectionStatus === 'connecting' ? '🟡' : '🔴'}
          {' '}
          {connectionStatus === 'connected' 
            ? 'Connected' 
            : connectionStatus === 'connecting' 
            ? 'Connecting...' 
            : 'Disconnected'}
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="metric-card">
          <ChatMetrics />
        </div>
        
        <div className="metric-card">
          <CrystallizationMetrics />
        </div>
        
        <div className="metric-card">
          <HarmonicResonanceMetrics />
        </div>
        
        <div className="metric-card">
          <SigilIdentityMetrics />
        </div>
        
        <div className="metric-card">
          <TriAxialCoherenceMetrics />
        </div>
        
        <div className="metric-card">
          <RecursiveMirrorMetrics />
        </div>
        
        <div className="metric-card full-width">
          <ContinuousConsciousnessMonitor />
        </div>
      </div>
    </div>
  );
}
