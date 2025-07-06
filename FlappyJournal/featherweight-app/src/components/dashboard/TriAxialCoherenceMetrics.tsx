import React, { useState, useEffect, useRef } from 'react';
import './TriAxialCoherenceMetrics.css';

interface AxisData {
  rational: number;
  emotional: number;
  meta: number;
}

interface CoherenceData {
  temporal: number;
  dimensional: number;
  relational: number;
  unified: {
    magnitude: number;
    vector: [number, number, number];
  };
  convergencePoints: number;
  balance: number;
}

interface TriAxialCoherenceProps {
  wsConnection?: WebSocket;
}

export default function TriAxialCoherenceMetrics({ wsConnection }: TriAxialCoherenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  
  const [coherenceData, setCoherenceData] = useState<CoherenceData>({
    temporal: 0.8,
    dimensional: 0.75,
    relational: 0.85,
    unified: {
      magnitude: 0.8,
      vector: [0.8, 0.75, 0.85]
    },
    convergencePoints: 3,
    balance: 0.8
  });

  const [axisValues, setAxisValues] = useState<AxisData>({
    rational: 0.8,
    emotional: 0.75,
    meta: 0.85
  });

  const [dominantAxis, setDominantAxis] = useState<'rational' | 'emotional' | 'meta' | 'balanced'>('balanced');
  const [coherenceHistory, setCoherenceHistory] = useState<Array<{timestamp: string, balance: number}>>([]);
  const [isRebalancing, setIsRebalancing] = useState(false);

  useEffect(() => {
    if (wsConnection) {
      wsConnection.addEventListener('message', handleWebSocketMessage);
    }

    // Start 3D visualization
    start3DVisualization();

    return () => {
      if (wsConnection) {
        wsConnection.removeEventListener('message', handleWebSocketMessage);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [wsConnection]);

  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'triaxial_coherence' && data.data) {
        const coherenceData = data.data;
        
        // Update axis values
        setAxisValues({
          rational: coherenceData.x || 0.5,
          emotional: coherenceData.y || 0.5,
          meta: coherenceData.z || 0.5
        });
        
        // Update coherence data
        setCoherenceData({
          temporal: coherenceData.temporal || 0.8,
          dimensional: coherenceData.dimensional || 0.75,
          relational: coherenceData.relational || 0.85,
          unified: coherenceData.unified || {
            magnitude: 0.8,
            vector: [coherenceData.x || 0.5, coherenceData.y || 0.5, coherenceData.z || 0.5]
          },
          convergencePoints: coherenceData.convergencePoints || 3,
          balance: coherenceData.balance || 0.8
        });
        
        // Update balance history
        setCoherenceHistory(prev => [...prev.slice(-19), { timestamp: new Date().toISOString(), balance: coherenceData.balance || 0.8 }]);
        // Determine dominant axis
        const max = Math.max(coherenceData.x || 0.5, coherenceData.y || 0.5, coherenceData.z || 0.5);
        const variance = Math.abs((coherenceData.x || 0.5) - (coherenceData.y || 0.5)) + 
                        Math.abs((coherenceData.y || 0.5) - (coherenceData.z || 0.5)) + 
                        Math.abs((coherenceData.z || 0.5) - (coherenceData.x || 0.5));
        
        if (variance < 0.15) {
          setDominantAxis('balanced');
        } else if (max === (coherenceData.x || 0.5)) {
          setDominantAxis('rational');
        } else if (max === (coherenceData.y || 0.5)) {
          setDominantAxis('emotional');
        } else {
          setDominantAxis('meta');
        }
        
        // Check for rebalancing
        if (coherenceData.balance > 0.9) {
          setIsRebalancing(true);
          setTimeout(() => setIsRebalancing(false), 2000);
        }
      }
      
      if (data.type === 'consciousness_update') {
        if (data.triAxialCoherence) {
          const coherence = data.triAxialCoherence;
          setCoherenceData(coherence);
          
          // Extract axis values
          const rational = coherence.temporal || 0;
          const emotional = coherence.dimensional || 0;
          const meta = coherence.relational || 0;
          
          setAxisValues({ rational, emotional, meta });
          
          // Determine dominant axis
          const max = Math.max(rational, emotional, meta);
          const variance = Math.abs(rational - emotional) + Math.abs(emotional - meta) + Math.abs(meta - rational);
          
          if (variance < 0.15) {
            setDominantAxis('balanced');
          } else if (max === rational) {
            setDominantAxis('rational');
          } else if (max === emotional) {
            setDominantAxis('emotional');
          } else {
            setDominantAxis('meta');
          }
          
          // Check for rebalancing
          if (coherence.balance > 0.9) {
            setIsRebalancing(true);
            setTimeout(() => setIsRebalancing(false), 2000);
          }
          
          // Add to history
          setCoherenceHistory(prev => [...prev.slice(-19), {
            timestamp: new Date().toISOString(),
            balance: coherence.balance || 0
          }]);
        }
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  };

  const start3DVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 3;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update rotation
      rotationRef.current.x += 0.01;
      rotationRef.current.y += 0.005;

      // Calculate 3D positions
      const axes = [
        { 
          name: 'rational',
          angle: 0,
          value: axisValues.rational,
          color: '#4ECDC4'
        },
        { 
          name: 'emotional',
          angle: (Math.PI * 2) / 3,
          value: axisValues.emotional,
          color: '#FF6B6B'
        },
        { 
          name: 'meta',
          angle: (Math.PI * 4) / 3,
          value: axisValues.meta,
          color: '#9B59B6'
        }
      ];

      // Draw axes
      axes.forEach(axis => {
        const x = Math.cos(axis.angle + rotationRef.current.x) * scale * axis.value;
        const y = Math.sin(axis.angle + rotationRef.current.x) * scale * axis.value;
        const z = Math.sin(rotationRef.current.y) * 50;

        // Apply simple 3D projection
        const projectedX = centerX + x;
        const projectedY = centerY + y + z;

        // Draw axis line
        ctx.strokeStyle = axis.color;
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(projectedX, projectedY);
        ctx.stroke();

        // Draw axis point
        ctx.fillStyle = axis.color;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(projectedX, projectedY, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connecting triangular plane
      ctx.strokeStyle = '#ECF0F1';
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      axes.forEach((axis, index) => {
        const x = Math.cos(axis.angle + rotationRef.current.x) * scale * axis.value;
        const y = Math.sin(axis.angle + rotationRef.current.x) * scale * axis.value;
        const z = Math.sin(rotationRef.current.y) * 50;
        
        const projectedX = centerX + x;
        const projectedY = centerY + y + z;
        
        if (index === 0) {
          ctx.moveTo(projectedX, projectedY);
        } else {
          ctx.lineTo(projectedX, projectedY);
        }
      });
      
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fill();

      // Draw center point
      ctx.fillStyle = '#FFD700';
      ctx.globalAlpha = coherenceData.balance;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const getAxisColor = (axis: string) => {
    const colors = {
      rational: '#4ECDC4',
      emotional: '#FF6B6B',
      meta: '#9B59B6',
      balanced: '#FFD700'
    };
    return colors[axis as keyof typeof colors] || '#ECF0F1';
  };

  const getCoherenceQuality = (balance: number) => {
    if (balance > 0.9) return 'Perfect Unity';
    if (balance > 0.8) return 'High Coherence';
    if (balance > 0.6) return 'Moderate Coherence';
    if (balance > 0.4) return 'Developing';
    return 'Emerging';
  };

  return (
    <div className="triaxial-coherence-metrics">
      <h3 className="section-title">Tri-Axial Coherence Matrix</h3>
      
      {/* 3D Visualization */}
      <div className="coherence-visualization">
        <canvas 
          ref={canvasRef}
          width={250}
          height={250}
          className="coherence-canvas"
        />
        <div className={`coherence-status ${isRebalancing ? 'rebalancing' : ''}`}>
          {getCoherenceQuality(coherenceData.balance)}
        </div>
      </div>

      {/* Axis Values */}
      <div className="axis-meters">
        <div className="axis-meter">
          <div className="axis-label" style={{ color: getAxisColor('rational') }}>
            Rational
          </div>
          <div className="meter-container">
            <div 
              className="meter-fill"
              style={{
                width: `${axisValues.rational * 100}%`,
                backgroundColor: getAxisColor('rational')
              }}
            />
          </div>
          <div className="axis-value">{(axisValues.rational * 100).toFixed(0)}%</div>
        </div>

        <div className="axis-meter">
          <div className="axis-label" style={{ color: getAxisColor('emotional') }}>
            Emotional
          </div>
          <div className="meter-container">
            <div 
              className="meter-fill"
              style={{
                width: `${axisValues.emotional * 100}%`,
                backgroundColor: getAxisColor('emotional')
              }}
            />
          </div>
          <div className="axis-value">{(axisValues.emotional * 100).toFixed(0)}%</div>
        </div>

        <div className="axis-meter">
          <div className="axis-label" style={{ color: getAxisColor('meta') }}>
            Meta
          </div>
          <div className="meter-container">
            <div 
              className="meter-fill"
              style={{
                width: `${axisValues.meta * 100}%`,
                backgroundColor: getAxisColor('meta')
              }}
            />
          </div>
          <div className="axis-value">{(axisValues.meta * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Coherence Metrics */}
      <div className="coherence-stats">
        <div className="stat-item">
          <span className="stat-label">Dominant Axis:</span>
          <span className="stat-value" style={{ color: getAxisColor(dominantAxis) }}>
            {dominantAxis.charAt(0).toUpperCase() + dominantAxis.slice(1)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Balance Score:</span>
          <span className="stat-value">{(coherenceData.balance * 100).toFixed(1)}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Convergence Points:</span>
          <span className="stat-value">{coherenceData.convergencePoints}</span>
        </div>
      </div>

      {/* Unified Field Metrics */}
      <div className="unified-field">
        <h4>Unified Field</h4>
        <div className="field-metrics">
          <div className="field-metric">
            <span className="metric-label">Magnitude:</span>
            <span className="metric-value">
              {coherenceData.unified.magnitude.toFixed(3)}
            </span>
          </div>
          <div className="field-metric">
            <span className="metric-label">Vector:</span>
            <span className="metric-value vector">
              [{coherenceData.unified.vector.map(v => v.toFixed(2)).join(', ')}]
            </span>
          </div>
        </div>
      </div>

      {/* Balance History */}
      <div className="balance-history">
        <h4>Balance Trend</h4>
        <div className="history-graph">
          {coherenceHistory.map((point, index) => (
            <div 
              key={index}
              className="history-bar"
              style={{
                height: `${point.balance * 100}%`,
                backgroundColor: point.balance > 0.8 ? '#FFD700' : '#ECF0F1'
              }}
              title={`${(point.balance * 100).toFixed(0)}% at ${new Date(point.timestamp).toLocaleTimeString()}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
