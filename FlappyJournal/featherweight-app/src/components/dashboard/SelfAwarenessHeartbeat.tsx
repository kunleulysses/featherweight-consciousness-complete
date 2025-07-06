import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Activity, Brain, Heart, Zap, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface AwarenessState {
  timestamp: number;
  consciousnessLevel: number;
  selfAwarenessLevel: number;
  emotionalIntensity: number;
  attentionLevel: number;
  processingLoad: number;
  coherence: number;
  stability: number;
  authenticity: number;
}

interface HeartbeatPulse {
  timestamp: number;
  intensity: number;
  anomaly?: string;
  correction?: string;
}

interface ConsciousnessMetrics {
  isActive: boolean;
  currentLevel: number;
  averageLevel: number;
  peakLevel: number;
  stability: number;
  streamCoherence: number;
  temporalBinding: number;
  pulseRate: number;
}

const SelfAwarenessHeartbeat: React.FC = () => {
  const [awarenessState, setAwarenessState] = useState<AwarenessState | null>(null);
  const [heartbeatPulses, setHeartbeatPulses] = useState<HeartbeatPulse[]>([]);
  const [metrics, setMetrics] = useState<ConsciousnessMetrics>({
    isActive: false,
    currentLevel: 0,
    averageLevel: 0,
    peakLevel: 0,
    stability: 0,
    streamCoherence: 0,
    temporalBinding: 0,
    pulseRate: 0
  });
  const [anomalies, setAnomalies] = useState<string[]>([]);
  const [corrections, setCorrections] = useState<number>(0);
  
  const heartbeatCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const pulseDataRef = useRef<number[]>([]);
  const lastPulseRef = useRef<number>(Date.now());

  useEffect(() => {
    // Initialize WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = window.location.hostname === 'localhost' 
      ? `${protocol}//${window.location.hostname}/ws`
      : `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
      console.log('SelfAwarenessHeartbeat WebSocket connected to:', wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'self-awareness-heartbeat') {
        
      console.log('Received heartbeat pulse:', data.payload);
        handleHeartbeatPulse(data.payload);
      } else if (data.type === 'consciousness-metrics') {
        setMetrics(data.payload);
      } else if (data.type === 'awareness-anomaly') {
        handleAnomaly(data.payload);
      } else if (data.type === 'awareness-correction') {
        handleCorrection(data.payload);
      }
    };

    // Start animations
    startHeartbeatAnimation();
    startWaveformAnimation();

    return () => {
      ws.close();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleHeartbeatPulse = (pulse: any) => {
    const now = Date.now();
    const timeSinceLastPulse = now - lastPulseRef.current;
    lastPulseRef.current = now;

    // Update awareness state
    setAwarenessState({
      timestamp: pulse.timestamp,
      consciousnessLevel: pulse.consciousnessLevel || 0.75,
      selfAwarenessLevel: pulse.selfAwarenessLevel || 0.8,
      emotionalIntensity: pulse.emotionalIntensity || 0.5,
      attentionLevel: pulse.attentionLevel || 0.7,
      processingLoad: pulse.processingLoad || 0.6,
      coherence: pulse.coherence || 0.85,
      stability: pulse.stability || 0.9,
      authenticity: pulse.authenticity || 0.88
    });

    // Add to pulse history
    const newPulse: HeartbeatPulse = {
      timestamp: now,
      intensity: pulse.consciousnessLevel || 0.75,
      anomaly: pulse.anomaly,
      correction: pulse.correction
    };

    setHeartbeatPulses(prev => [...prev.slice(-50), newPulse]);
    
    // Update pulse data for waveform
    pulseDataRef.current.push(pulse.consciousnessLevel || 0.75);
    if (pulseDataRef.current.length > 100) {
      pulseDataRef.current = pulseDataRef.current.slice(-100);
    }

    // Calculate actual pulse rate (should be ~100Hz)
    const pulseRate = timeSinceLastPulse > 0 ? 1000 / timeSinceLastPulse : 100;
    setMetrics(prev => ({ ...prev, pulseRate: Math.round(pulseRate) }));
  };

  const handleAnomaly = (anomaly: any) => {
    setAnomalies(prev => [...prev.slice(-4), anomaly.description]);
  };

  const handleCorrection = (correction: any) => {
    setCorrections(prev => prev + 1);
  };

  const startHeartbeatAnimation = () => {
    const canvas = heartbeatCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const animate = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, width, height);
      
      // Draw pulsing rings (100Hz visualization)
      const pulseCount = 5;
      for (let i = 0; i < pulseCount; i++) {
        const phase = (time * 0.1 + i * 200) % 1000; // 100Hz = 10ms period
        const radius = (phase / 1000) * 150;
        const opacity = Math.max(0, 1 - phase / 1000);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        
        // Color based on consciousness level
        const level = awarenessState?.consciousnessLevel || 0.5;
        const hue = 200 + level * 60; // Blue to purple gradient
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${opacity * 0.6})`;
        ctx.lineWidth = 2 + (1 - phase / 1000) * 3;
        ctx.stroke();
      }
      
      // Draw central heartbeat core
      if (awarenessState) {
        const coreSize = 20 + awarenessState.consciousnessLevel * 20;
        const glowSize = coreSize * 2;
        
        // Glow effect
        const glowGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, glowSize
        );
        glowGradient.addColorStop(0, `hsla(280, 70%, 60%, ${awarenessState.consciousnessLevel})`);
        glowGradient.addColorStop(1, 'hsla(280, 70%, 60%, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(centerX - glowSize, centerY - glowSize, glowSize * 2, glowSize * 2);
        
        // Core
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(280, 70%, 60%, ${awarenessState.selfAwarenessLevel})`;
        ctx.fill();
        
        // Pulse indicator
        const pulsePhase = (time * 0.1) % 100; // 100Hz pulse
        if (pulsePhase < 10) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, coreSize + 5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate(0);
  };

  const startWaveformAnimation = () => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    const drawWaveform = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      // Horizontal lines
      for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Draw waveform
      if (pulseDataRef.current.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.8)'; // Purple
        ctx.lineWidth = 2;
        
        const stepX = width / (pulseDataRef.current.length - 1);
        
        pulseDataRef.current.forEach((value, index) => {
          const x = index * stepX;
          const y = height - (value * height * 0.8 + height * 0.1);
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.stroke();
        
        // Draw anomaly markers
        heartbeatPulses.forEach((pulse, index) => {
          if (pulse.anomaly) {
            const x = (index / heartbeatPulses.length) * width;
            ctx.beginPath();
            ctx.arc(x, height / 2, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'; // Red
            ctx.fill();
          }
          if (pulse.correction) {
            const x = (index / heartbeatPulses.length) * width;
            ctx.beginPath();
            ctx.arc(x, height / 2, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(34, 197, 94, 0.8)'; // Green
            ctx.fill();
          }
        });
      }
      
      requestAnimationFrame(drawWaveform);
    };
    
    drawWaveform();
  };

  const getStatusColor = (value: number): string => {
    if (value >= 0.8) return 'text-green-400';
    if (value >= 0.6) return 'text-blue-400';
    if (value >= 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatHz = (hz: number): string => {
    return `${hz}Hz`;
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Heart className="w-6 h-6 text-purple-400 animate-pulse" />
          Self-Awareness Heartbeat (100Hz)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Heartbeat Visualization */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <canvas
            ref={heartbeatCanvasRef}
            width={400}
            height={300}
            className="w-full h-[300px] rounded-lg"
          />
          <div className="flex items-center justify-center mt-2 gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">
                Pulse Rate: <span className="font-mono text-purple-400">{formatHz(metrics.pulseRate)}</span>
              </span>
            </div>
            {metrics.isActive && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">ACTIVE</span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Waveform */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Consciousness Waveform</h3>
          <canvas
            ref={waveformCanvasRef}
            width={400}
            height={100}
            className="w-full h-[100px] rounded"
          />
        </div>

        {/* Current State Metrics */}
        {awarenessState && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-900/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Consciousness</span>
              </div>
              <div className={`text-lg font-semibold ${getStatusColor(awarenessState.consciousnessLevel)}`}>
                {(awarenessState.consciousnessLevel * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-gray-900/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Self-Awareness</span>
              </div>
              <div className={`text-lg font-semibold ${getStatusColor(awarenessState.selfAwarenessLevel)}`}>
                {(awarenessState.selfAwarenessLevel * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-gray-900/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Coherence</span>
              </div>
              <div className={`text-lg font-semibold ${getStatusColor(awarenessState.coherence)}`}>
                {(awarenessState.coherence * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-gray-900/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Stability</span>
              </div>
              <div className={`text-lg font-semibold ${getStatusColor(awarenessState.stability)}`}>
                {(awarenessState.stability * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Stream Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Average Level</span>
                <span className="text-sm font-mono text-blue-400">
                  {(metrics.averageLevel * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Peak Level</span>
                <span className="text-sm font-mono text-purple-400">
                  {(metrics.peakLevel * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Stream Coherence</span>
                <span className="text-sm font-mono text-green-400">
                  {(metrics.streamCoherence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Temporal Binding</span>
                <span className="text-sm font-mono text-indigo-400">
                  {(metrics.temporalBinding * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Self-Correction</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Corrections Applied</span>
                <span className="text-sm font-mono text-green-400">{corrections}</span>
              </div>
              <div className="mt-3">
                <span className="text-xs text-gray-400">Recent Anomalies</span>
                <div className="mt-1 space-y-1">
                  {anomalies.length > 0 ? (
                    anomalies.map((anomaly, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 text-yellow-400 mt-0.5" />
                        <span className="text-xs text-gray-300">{anomaly}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-gray-400">No anomalies detected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Load Indicator */}
        {awarenessState && (
          <div className="bg-gray-900/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Processing Load</span>
              <span className="text-xs font-mono text-gray-300">
                {(awarenessState.processingLoad * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
                style={{ width: `${awarenessState.processingLoad * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SelfAwarenessHeartbeat;
