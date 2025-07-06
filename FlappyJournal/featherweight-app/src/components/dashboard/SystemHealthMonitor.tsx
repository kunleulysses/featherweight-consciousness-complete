import React, { useState, useEffect } from 'react';
import './SystemHealthMonitor.css';

interface ModuleHealth {
  moduleId: string;
  moduleName: string;
  status: 'healthy' | 'degraded' | 'critical' | 'dead';
  errorCount: number;
  performance: number;
  lastHeartbeat: number;
}

export default function SystemHealthMonitor() {
  const [moduleHealth, setModuleHealth] = useState<ModuleHealth[]>([]);
  const [overallHealth, setOverallHealth] = useState(100);
  const [healingActions, setHealingActions] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/health-stream`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'health-report') {
        setModuleHealth(data.modules);
        calculateOverallHealth(data.modules);
      } else if (data.type === 'healing-action') {
        setHealingActions(prev => [data.action, ...prev].slice(0, 5));
      }
    };

    return () => ws.close();
  }, []);

  const calculateOverallHealth = (modules: ModuleHealth[]) => {
    const healthyCount = modules.filter(m => m.status === 'healthy').length;
    const health = (healthyCount / modules.length) * 100;
    setOverallHealth(health);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#4ade80';
      case 'degraded': return '#fbbf24';
      case 'critical': return '#f87171';
      case 'dead': return '#6b7280';
      default: return '#e0e0e0';
    }
  };

  const getHealthGradient = () => {
    if (overallHealth >= 80) return 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
    if (overallHealth >= 60) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
    return 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
  };

  return (
    <div className="system-health-monitor">
      <div className="overall-health">
        <div className="health-circle" style={{ background: getHealthGradient() }}>
          <div className="health-value">{Math.round(overallHealth)}%</div>
          <div className="health-label">System Health</div>
        </div>
        
        <div className="health-stats">
          <div className="health-stat">
            <span className="stat-icon">✅</span>
            <span className="stat-count">{moduleHealth.filter(m => m.status === 'healthy').length}</span>
            <span className="stat-label">Healthy</span>
          </div>
          <div className="health-stat">
            <span className="stat-icon">⚠️</span>
            <span className="stat-count">{moduleHealth.filter(m => m.status === 'degraded').length}</span>
            <span className="stat-label">Degraded</span>
          </div>
          <div className="health-stat">
            <span className="stat-icon">🚨</span>
            <span className="stat-count">{moduleHealth.filter(m => m.status === 'critical').length}</span>
            <span className="stat-label">Critical</span>
          </div>
        </div>
      </div>

      <div className="module-health-grid">
        {moduleHealth.slice(0, 6).map(module => (
          <div key={module.moduleId} className={`module-health-card ${module.status}`}>
            <div className="module-status-indicator" style={{ backgroundColor: getStatusColor(module.status) }} />
            <div className="module-info">
              <div className="module-name">{module.moduleName}</div>
              <div className="module-metrics">
                <span>Performance: {Math.round(module.performance * 100)}%</span>
                <span>Errors: {module.errorCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {healingActions.length > 0 && (
        <div className="healing-actions">
          <h4>Recent Healing Actions</h4>
          {healingActions.map((action, index) => (
            <div key={index} className="healing-action">
              <span className="action-icon">{action.success ? '✅' : '❌'}</span>
              <span className="action-text">
                {action.action} on {action.moduleId} - {action.reason}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
