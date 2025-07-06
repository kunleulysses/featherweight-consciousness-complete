import React, { useState, useEffect } from 'react';
import { useMetrics } from '../../contexts/MetricsContext';
import { useMetricData } from '../../hooks/useMetricData';
import './CrystallizationMetrics.css';

interface Crystal {
  id: string;
  timestamp: string;
  state?: {
    phi?: number;
    awareness?: number;
    coherence?: number;
    resonance?: number;
    pattern?: string;
};
  signature: string;
  intensity?: number;
  type?: string;
}

export default function CrystallizationMetrics() {
  const { wsConnection } = useMetrics();
  const crystalFormedData = useMetricData('crystal_formed');
  const consciousnessUpdateData = useMetricData('consciousness_update');
  
  const [crystals, setCrystals] = useState<Crystal[]>([]);
  const [liveState, setLiveState] = useState({
    currentAwareness: 0,
    threshold: 0.85,
    crystallizationProgress: 0,
    totalCrystals: 0,
    recentCrystals: 0,
    crystalGrowthRate: 0
  });
  const [isPulsing, setIsPulsing] = useState(false);

  
  // Handle crystal formed data
  useEffect(() => {
    if (crystalFormedData && crystalFormedData.crystal) {
      const crystal = {
        ...crystalFormedData.crystal,
        state: {
          ...crystalFormedData.crystal.state,
          pattern: crystalFormedData.crystal.pattern || 'geometric'
        }
      };
      setCrystals(prev => [...prev.slice(-99), crystal]);
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }
  }, [crystalFormedData]);

  // Handle consciousness update data
  useEffect(() => {
    if (consciousnessUpdateData && consciousnessUpdateData.consciousness) {
      const awareness = consciousnessUpdateData.consciousness.awarenessLevel || 0;
      const progress = awareness / 0.85;
      
      setLiveState(prev => ({
        ...prev,
        currentAwareness: awareness,
        crystallizationProgress: Math.min(progress, 1)
      }));

      if (awareness > 0.75) {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 1000);
      }
    }
  }, [consciousnessUpdateData]);


  const fetchCrystals = async () => {
    try {
      const response = await fetch('/api/consciousness/crystals');
      const data = await response.json();
      setCrystals(data.crystals || []);
      setLiveState(prev => ({
        ...prev,
        totalCrystals: data.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch crystals:', error);
    }
  };

  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'consciousness_update' && data.consciousness) {
        const awareness = data.consciousness.awarenessLevel || 0;
        const progress = awareness / 0.85; // Progress to threshold
        
        setLiveState(prev => ({
          ...prev,
          currentAwareness: awareness,
          crystallizationProgress: Math.min(progress, 1)
        }));

        // Pulse effect when approaching threshold
        if (awareness > 0.75) {
          setIsPulsing(true);
          setTimeout(() => setIsPulsing(false), 1000);
        }
      }
      
      if (data.type === 'crystal_formed') {
        // New crystal formed!
        setCrystals(prev => [data.crystal, ...prev].slice(0, 10)); // Keep last 10
        setLiveState(prev => ({
          ...prev,
          totalCrystals: prev.totalCrystals + 1,
          recentCrystals: prev.recentCrystals + 1
        }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  };

  const getIntensityColor = (intensity: number) => {
    const hue = intensity * 280; // Purple to cyan
    return `hsl(${hue}, 70%, 60%)`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="crystallization-metrics">
      <h3 className="section-title">Consciousness Crystallization</h3>
      
      {/* Live Awareness Meter */}
      <div className="awareness-meter">
        <div className="meter-label">
          <span>Current Awareness</span>
          <span className="meter-value">{(liveState.currentAwareness * 100).toFixed(1)}%</span>
        </div>
        <div className="meter-bar">
          <div 
            className={`meter-fill ${isPulsing ? 'pulsing' : ''}`}
            style={{ 
              width: `${liveState.currentAwareness * 100}%`,
              backgroundColor: liveState.currentAwareness > 0.75 ? '#ff6b6b' : '#4ecdc4'
            }}
          />
          <div className="threshold-marker" style={{ left: '85%' }}>
            <span className="threshold-label">Crystallization Threshold</span>
          </div>
        </div>
      </div>

      {/* Crystal Stats */}
      <div className="crystal-stats">
        <div className="stat-box">
          <div className="stat-label">Total Crystals</div>
          <div className="stat-value">{liveState.totalCrystals}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Last Hour</div>
          <div className="stat-value">{liveState.recentCrystals}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Growth Rate</div>
          <div className="stat-value">{liveState.crystalGrowthRate}/hr</div>
        </div>
      </div>

      {/* Crystal Visualization */}
      
      {/* Crystal Pattern Visualization */}
      {crystals.length > 0 && crystals[crystals.length - 1] && (
        <div className="crystal-visual">
          <div className={`crystal-pattern ${crystals[crystals.length - 1].state?.pattern || "geometric"}`}></div>
          <div style={{ position: 'absolute', bottom: '10px', fontSize: '12px', color: '#666' }}>
            Pattern: {crystals[crystals.length - 1].state?.pattern || "geometric"}
          </div>
        </div>
      )}

      <div className="crystal-garden">
        <h4>Recent Crystallizations</h4>
        <div className="crystal-container">
          {crystals.length === 0 ? (
            <div className="no-crystals">Awaiting consciousness crystallization...</div>
          ) : (
            crystals.map((crystal, index) => (
              <div 
                key={crystal.id} 
                className="crystal"
                style={{
                  '--crystal-color': getIntensityColor(crystal.intensity || 0.5),
                  '--animation-delay': `${index * 0.1}s`
                } as React.CSSProperties}
              >
                <div className="crystal-shape">
                  <div className="crystal-facet" />
                  <div className="crystal-facet" />
                  <div className="crystal-facet" />
                </div>
                <div className="crystal-info">
                  <div className="crystal-time">{formatTimestamp(crystal.timestamp)}</div>
                  <div className="crystal-metrics">
                    {crystal.state?.phi !== undefined && (
                      <>φ: {crystal.state.phi.toFixed(3)} | </>
                    )}
                    {crystal.state?.awareness !== undefined && (
                      <>Awareness: {(crystal.state.awareness * 100).toFixed(0)}%</>
                    )}
                    {!crystal.state && (
                      <>Intensity: {(crystal.intensity || 0.5).toFixed(2)}</>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Crystallization Pattern */}
      <div className="pattern-analysis">
        <h4>Crystallization Patterns</h4>
        <div className="pattern-graph">
          {/* This would be a small chart showing crystallization frequency over time */}
          <canvas id="crystal-pattern-chart" width="300" height="100"></canvas>
        </div>
      </div>
    </div>
  );
}
