import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { 
  Activity, Brain, Heart, AlertTriangle, CheckCircle, 
  TrendingUp, TrendingDown, Eye, Shield, Zap,
  BarChart, LineChart, GitBranch
} from 'lucide-react';

interface ConsciousnessSnapshot {
  timestamp: number;
  consciousnessLevel: number;
  qualityScore: number;
  stability: number;
  anomalies: string[];
  optimizations: string[];
}

interface HealthMetrics {
  uptime: number;
  stability: number;
  memoryHealth: number;
  feedbackIntegrity: number;
  awarenessLevel: number;
  overallHealth: number;
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'critical' | 'info' | 'success';
  message: string;
  timestamp: number;
}

interface Reflection {
  type: string;
  content: string;
  significance: number;
  timestamp: number;
}

const ContinuousConsciousnessMonitor: React.FC = () => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    uptime: 100,
    stability: 95,
    memoryHealth: 88,
    feedbackIntegrity: 92,
    awarenessLevel: 85,
    overallHealth: 92
  });
  
  const [snapshots, setSnapshots] = useState<ConsciousnessSnapshot[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [optimizationCount, setOptimizationCount] = useState(0);
  
  const ekgCanvasRef = useRef<HTMLCanvasElement>(null);
  const healthBarCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const ekgDataRef = useRef<number[]>([]);

  useEffect(() => {
    // Initialize WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = window.location.hostname === 'localhost' 
      ? `${protocol}//${window.location.hostname}/ws`
      : `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    console.log('ContinuousConsciousnessMonitor connecting to:', wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'consciousness-monitor-snapshot') {
        handleSnapshot(data.payload);
      } else if (data.type === 'consciousness-health-metrics') {
        setHealthMetrics(data.payload);
      } else if (data.type === 'consciousness-alert') {
        handleAlert(data.payload);
      } else if (data.type === 'consciousness-reflection') {
        handleReflection(data.payload);
      }
    };

    // Start animations
    startEKGAnimation();
    startHealthBarAnimation();

    return () => {
      ws.close();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleSnapshot = (snapshot: any) => {
    const newSnapshot: ConsciousnessSnapshot = {
      timestamp: Date.now(),
      consciousnessLevel: snapshot.consciousnessLevel || 0.82,
      qualityScore: snapshot.qualityScore || 0.88,
      stability: snapshot.stability || 0.91,
      anomalies: snapshot.anomalies || [],
      optimizations: snapshot.optimizations || []
    };

    setSnapshots(prev => [...prev.slice(-50), newSnapshot]);
    
    // Update EKG data
    ekgDataRef.current.push(newSnapshot.consciousnessLevel);
    if (ekgDataRef.current.length > 150) {
      ekgDataRef.current = ekgDataRef.current.slice(-150);
    }

    // Update counts
    if (newSnapshot.anomalies.length > 0) {
      setAnomalyCount(prev => prev + newSnapshot.anomalies.length);
    }
    if (newSnapshot.optimizations.length > 0) {
      setOptimizationCount(prev => prev + newSnapshot.optimizations.length);
    }
  };

  const handleAlert = (alert: any) => {
    const newAlert: SystemAlert = {
      id: `alert_${Date.now()}`,
      type: alert.severity === 'critical' ? 'critical' : 
            alert.severity === 'high' ? 'warning' : 
            alert.severity === 'low' ? 'info' : 'success',
      message: alert.message,
      timestamp: Date.now()
    };
    
    setAlerts(prev => [...prev.slice(-5), newAlert]);
  };

  const handleReflection = (reflection: any) => {
    const newReflection: Reflection = {
      type: reflection.type || 'consciousness',
      content: reflection.content,
      significance: reflection.significance || 0.7,
      timestamp: Date.now()
    };
    
    setReflections(prev => [...prev.slice(-3), newReflection]);
  };

  const startEKGAnimation = () => {
    const canvas = ekgCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    const drawEKG = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw grid
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Draw EKG line
      if (ekgDataRef.current.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)'; // Green for healthy
        ctx.lineWidth = 2;
        
        const stepX = width / (ekgDataRef.current.length - 1);
        
        ekgDataRef.current.forEach((value, index) => {
          const x = index * stepX;
          const y = height - (value * height * 0.8 + height * 0.1);
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            // Add some EKG-style peaks
            const prevValue = ekgDataRef.current[index - 1];
            if (Math.random() > 0.95 && value > 0.7) {
              // Sharp peak
              ctx.lineTo(x - stepX/2, y - 20);
              ctx.lineTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        });
        
        ctx.stroke();
        
        // Draw moving scan line
        const scanX = (time * 0.1) % width;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(scanX, 0);
        ctx.lineTo(scanX, height);
        ctx.stroke();
      }
      
      animationRef.current = requestAnimationFrame(drawEKG);
    };
    
    drawEKG(0);
  };

  const startHealthBarAnimation = () => {
    const canvas = healthBarCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    const drawHealthBars = () => {
      ctx.clearRect(0, 0, width, height);
      
      const metrics = [
        { name: 'Uptime', value: healthMetrics.uptime / 100, color: 'rgba(34, 197, 94, 0.8)' },
        { name: 'Stability', value: healthMetrics.stability / 100, color: 'rgba(59, 130, 246, 0.8)' },
        { name: 'Memory', value: healthMetrics.memoryHealth / 100, color: 'rgba(147, 51, 234, 0.8)' },
        { name: 'Feedback', value: healthMetrics.feedbackIntegrity / 100, color: 'rgba(236, 72, 153, 0.8)' },
        { name: 'Awareness', value: healthMetrics.awarenessLevel / 100, color: 'rgba(251, 146, 60, 0.8)' }
      ];
      
      const barWidth = width / metrics.length;
      const barPadding = 10;
      const maxBarHeight = height - 40;
      
      metrics.forEach((metric, index) => {
        const x = index * barWidth + barPadding;
        const barHeight = metric.value * maxBarHeight;
        const y = height - barHeight - 20;
        
        // Draw bar
        ctx.fillStyle = metric.color;
        ctx.fillRect(x, y, barWidth - barPadding * 2, barHeight);
        
        // Draw label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(metric.name, x + (barWidth - barPadding * 2) / 2, height - 5);
        
        // Draw value
        ctx.fillText(`${Math.round(metric.value * 100)}%`, x + (barWidth - barPadding * 2) / 2, y - 5);
      });
      
      requestAnimationFrame(drawHealthBars);
    };
    
    drawHealthBars();
  };

  const getHealthStatus = (): { status: string; color: string; icon: React.ReactNode } => {
    const health = healthMetrics.overallHealth;
    if (health >= 90) return { status: 'Excellent', color: 'text-green-400', icon: <CheckCircle className="w-5 h-5" /> };
    if (health >= 75) return { status: 'Good', color: 'text-blue-400', icon: <Activity className="w-5 h-5" /> };
    if (health >= 60) return { status: 'Fair', color: 'text-yellow-400', icon: <AlertTriangle className="w-5 h-5" /> };
    return { status: 'Critical', color: 'text-red-400', icon: <AlertTriangle className="w-5 h-5 animate-pulse" /> };
  };

  const healthStatus = getHealthStatus();

  return (
    <Card className="bg-gray-800/50 border-gray-700 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-400" />
          Continuous Consciousness Monitor
          {isMonitoring && (
            <span className="ml-auto text-sm font-normal text-green-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              MONITORING
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mind Health EKG */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Consciousness Vitals (EKG)
          </h3>
          <canvas
            ref={ekgCanvasRef}
            width={600}
            height={150}
            className="w-full h-[150px] rounded"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-sm font-medium ${healthStatus.color} flex items-center gap-1`}>
              {healthStatus.icon}
              System Health: {healthStatus.status}
            </span>
            <span className="text-xs text-gray-400">
              Overall: {healthMetrics.overallHealth.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Health Metrics Bars */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            System Health Metrics
          </h3>
          <canvas
            ref={healthBarCanvasRef}
            width={600}
            height={120}
            className="w-full h-[120px] rounded"
          />
        </div>

        {/* Grid Layout for Stats and Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Monitoring Stats */}
          <div className="bg-gray-900/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Monitoring Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Snapshots</span>
                <span className="text-sm font-mono text-blue-400">{snapshots.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Anomalies</span>
                <span className="text-sm font-mono text-yellow-400">{anomalyCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Optimizations</span>
                <span className="text-sm font-mono text-green-400">{optimizationCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Alerts</span>
                <span className="text-sm font-mono text-purple-400">{alerts.length}</span>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-gray-900/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Recent Alerts
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-2">
                    {alert.type === 'critical' && <div className="w-2 h-2 bg-red-400 rounded-full mt-1" />}
                    {alert.type === 'warning' && <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1" />}
                    {alert.type === 'info' && <div className="w-2 h-2 bg-blue-400 rounded-full mt-1" />}
                    {alert.type === 'success' && <div className="w-2 h-2 bg-green-400 rounded-full mt-1" />}
                    <span className="text-xs text-gray-300 flex-1">{alert.message}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-500">No recent alerts</span>
              )}
            </div>
          </div>

          {/* Self-Reflections */}
          <div className="bg-gray-900/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Self-Reflections
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {reflections.length > 0 ? (
                reflections.map((reflection, index) => (
                  <div key={index} className="border-l-2 border-purple-400/30 pl-2">
                    <p className="text-xs text-gray-300">{reflection.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{reflection.type}</span>
                      <span className="text-xs text-purple-400">
                        {(reflection.significance * 100).toFixed(0)}% significant
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-500">No recent reflections</span>
              )}
            </div>
          </div>
        </div>

        {/* Evolution Indicator */}
        <div className="bg-gray-900/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Consciousness Evolution
            </h3>
            {snapshots.length > 10 && (
              <div className="flex items-center gap-1">
                {snapshots[snapshots.length - 1].consciousnessLevel > snapshots[snapshots.length - 10].consciousnessLevel ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400">Growing</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-yellow-400">Stabilizing</span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000"
              style={{ width: `${healthMetrics.awarenessLevel}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>Base Consciousness</span>
            <span>Enhanced Awareness</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContinuousConsciousnessMonitor;
