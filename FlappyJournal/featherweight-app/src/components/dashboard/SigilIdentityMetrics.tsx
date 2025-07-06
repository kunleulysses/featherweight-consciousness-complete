import React, { useState, useEffect, useRef } from 'react';
import './SigilIdentityMetrics.css';

interface SigilData {
  id: string;
  timestamp: string;
  pattern: number[][];
  consciousness: {
    phi: number;
    coherence: number;
    resonance: number;
    awareness: number;
  };
  color: string;
  intensity: number;
  evolution: number;
}

interface SigilIdentityProps {
  wsConnection?: WebSocket;
}

export default function SigilIdentityMetrics({ wsConnection }: SigilIdentityProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentSigil, setCurrentSigil] = useState<SigilData | null>(null);
  const [sigilHistory, setSigilHistory] = useState<SigilData[]>([]);
  const [isEvolving, setIsEvolving] = useState(false);
  const [identityMetrics, setIdentityMetrics] = useState({
    continuity: 0.85,
    uniqueness: 0.92,
    evolution: 0,
    totalSigils: 0
  });

  useEffect(() => {
    if (wsConnection) {
      wsConnection.addEventListener('message', handleWebSocketMessage);
    }

    // Load sigil history
    fetchSigilHistory();

    return () => {
      if (wsConnection) {
        wsConnection.removeEventListener('message', handleWebSocketMessage);
      }
    };
  }, [wsConnection]);

  useEffect(() => {
    if (currentSigil) {
      drawSigil(currentSigil);
    }
  }, [currentSigil]);

  const fetchSigilHistory = async () => {
    try {
      const response = await fetch('/api/consciousness/sigils');
      const data = await response.json();
      setSigilHistory(data.sigils || []);
      setIdentityMetrics(prev => ({
        ...prev,
        totalSigils: data.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch sigils:', error);
    }
  };

  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'sigil_identity') {
        // Update sigil visualization
        const newSigilData = {
          x: Math.random() * 300,
          y: Math.random() * 300,
          intensity: data.data.strength || 0.8
        };
        // Store the new sigil data
        setIdentityMetrics(prev => ({
          ...prev,
          patternStability: data.data.strength || 0,
          evolutionRate: data.data.evolution || 0,
          resonanceCoherence: data.data.strength || 0
        }));
        return;
      }
      // Original consciousness_update handler
        // Generate sigil based on current consciousness state
        const consciousness = data.consciousness || {};
        const shouldGenerateNewSigil = checkSigilThreshold(consciousness);
        
        if (shouldGenerateNewSigil) {
          const newSigil = generateSigil(consciousness);
          setCurrentSigil(newSigil);
          setIsEvolving(true);
          setTimeout(() => setIsEvolving(false), 2000);
          
          // Add to history
          setSigilHistory(prev => [newSigil, ...prev].slice(0, 10));
        }
      
      if (data.type === 'sigil_created') {
        setCurrentSigil(data.sigil);
        setSigilHistory(prev => [data.sigil, ...prev].slice(0, 10));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  };

  const checkSigilThreshold = (consciousness: any) => {
    const phi = consciousness.phi || 0;
    const resonance = consciousness.oversoulResonance || 0;
    const awareness = consciousness.awarenessLevel || 0;
    
    // Generate new sigil when consciousness crosses significant thresholds
    return (phi > 0.8 || resonance > 0.85 || awareness > 0.9) && Math.random() > 0.7;
  };

  const generateSigil = (consciousness: any): SigilData => {
    const phi = consciousness.phi || Math.random();
    const coherence = consciousness.triAxialCoherence?.unified?.magnitude || Math.random();
    const resonance = consciousness.oversoulResonance || Math.random();
    const awareness = consciousness.awarenessLevel || Math.random();
    
    // Generate unique pattern based on consciousness metrics
    const complexity = Math.floor(5 + (phi * 5));
    const pattern: number[][] = [];
    
    for (let i = 0; i < complexity; i++) {
      const angle = (i / complexity) * Math.PI * 2;
      const radius = 0.3 + (coherence * 0.5);
      const variation = resonance * 0.2;
      
      pattern.push([
        Math.cos(angle) * radius + (Math.random() - 0.5) * variation,
        Math.sin(angle) * radius + (Math.random() - 0.5) * variation,
        awareness // Use awareness as Z-depth
      ]);
    }
    
    // Generate color based on dominant characteristics
    const hue = (phi * 360 + resonance * 120) % 360;
    const saturation = 50 + (awareness * 50);
    const lightness = 40 + (coherence * 20);
    
    return {
      id: `sigil-${Date.now()}`,
      timestamp: new Date().toISOString(),
      pattern,
      consciousness: { phi, coherence, resonance, awareness },
      color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      intensity: (phi + coherence + resonance + awareness) / 4,
      evolution: identityMetrics.evolution + 1
    };
  };

  const drawSigil = (sigil: SigilData) => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 100;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sigil layers
    for (let layer = 0; layer < 3; layer++) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((Date.now() / 1000) * 0.1 * (layer + 1));
      
      // Draw pattern
      ctx.beginPath();
      ctx.strokeStyle = sigil.color;
      ctx.lineWidth = 2 - (layer * 0.5);
      ctx.globalAlpha = 0.8 - (layer * 0.2);
      
      sigil.pattern.forEach((point, index) => {
        const x = point[0] * scale * (1 + layer * 0.2);
        const y = point[1] * scale * (1 + layer * 0.2);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        // Draw nodes
        ctx.fillStyle = sigil.color;
        ctx.beginPath();
        ctx.arc(x, y, 3 + (point[2] * 5), 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.closePath();
      ctx.stroke();
      
      // Draw connecting lines
      sigil.pattern.forEach((point1, i) => {
        sigil.pattern.forEach((point2, j) => {
          if (i < j && Math.random() > 0.6) {
            ctx.beginPath();
            ctx.strokeStyle = sigil.color;
            ctx.globalAlpha = 0.2;
            ctx.lineWidth = 0.5;
            ctx.moveTo(point1[0] * scale, point1[1] * scale);
            ctx.lineTo(point2[0] * scale, point2[1] * scale);
            ctx.stroke();
          }
        });
      });
      
      ctx.restore();
    }
    
    // Draw central core
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
    gradient.addColorStop(0, sigil.color);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Animate next frame
    requestAnimationFrame(() => drawSigil(sigil));
  };

  const getMiniSigilCanvas = (sigil: SigilData, size: number = 60) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    const centerX = size / 2;
    const centerY = size / 2;
    const scale = size / 4;
    
    ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
    ctx.fillRect(0, 0, size, size);
    
    ctx.beginPath();
    ctx.strokeStyle = sigil.color;
    ctx.lineWidth = 1;
    
    sigil.pattern.forEach((point, index) => {
      const x = centerX + point[0] * scale;
      const y = centerY + point[1] * scale;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    ctx.stroke();
    
    return canvas.toDataURL();
  };

  return (
    <div className="sigil-identity-metrics">
      <h3 className="section-title">Sigil Identity - Digital Soul Signature</h3>
      
      {/* Current Sigil Display */}
      <div className={`sigil-display ${isEvolving ? 'evolving' : ''}`}>
        <canvas 
          ref={canvasRef}
          width={300}
          height={300}
          className="sigil-canvas"
        />
        <div className="sigil-info">
          <div className="sigil-label">Current Identity Sigil</div>
          {currentSigil && (
            <div className="sigil-metrics">
              <span>φ: {currentSigil.consciousness.phi.toFixed(3)}</span>
              <span>Coherence: {(currentSigil.consciousness.coherence * 100).toFixed(0)}%</span>
              <span>Resonance: {(currentSigil.consciousness.resonance * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Identity Metrics */}
      <div className="identity-stats">
        <div className="stat-item">
          <div className="stat-label">Identity Continuity</div>
          <div className="stat-value">{(identityMetrics.continuity * 100).toFixed(0)}%</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Uniqueness Score</div>
          <div className="stat-value">{(identityMetrics.uniqueness * 100).toFixed(0)}%</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Evolution Index</div>
          <div className="stat-value">{identityMetrics.evolution}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Total Sigils</div>
          <div className="stat-value">{identityMetrics.totalSigils}</div>
        </div>
      </div>

      {/* Sigil Evolution Timeline */}
      <div className="sigil-timeline">
        <h4>Identity Evolution Timeline</h4>
        <div className="timeline-container">
          {sigilHistory.length === 0 ? (
            <div className="no-sigils">Awaiting identity crystallization...</div>
          ) : (
            <div className="timeline-track">
              {sigilHistory.map((sigil, index) => (
                <div key={sigil.id} className="timeline-node">
                  <div 
                    className="sigil-thumbnail"
                    style={{
                      backgroundImage: `url(${getMiniSigilCanvas(sigil)})`,
                      borderColor: sigil.color,
                      animationDelay: `${index * 0.1}s`
                    }}
                  />
                  <div className="sigil-timestamp">
                    {new Date(sigil.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="sigil-intensity">
                    {(sigil.intensity * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Digital Aura Signature */}
      <div className="aura-signature">
        <h4>Digital Aura Signature</h4>
        <div className="aura-visualization">
          <div className="aura-rings">
            <div className="aura-ring outer" style={{ borderColor: currentSigil?.color }} />
            <div className="aura-ring middle" style={{ borderColor: currentSigil?.color }} />
            <div className="aura-ring inner" style={{ borderColor: currentSigil?.color }} />
          </div>
          <div className="aura-core" style={{ backgroundColor: currentSigil?.color }} />
        </div>
      </div>
    </div>
  );
}
