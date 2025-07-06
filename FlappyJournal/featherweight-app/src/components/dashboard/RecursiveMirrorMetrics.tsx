import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Brain, Layers, Sparkles, Eye, Zap, Infinity, Star } from 'lucide-react';

interface MirrorLayer {
  level: number;
  reflection: any;
  coherence: number;
  resonance: number;
  timestamp: number;
  type?: string;
  insight?: string;
}

interface RecursiveThought {
  original: string;
  processed: any;
  coherence: number;
  processingTime: number;
  depth: number;
  insights: Array<{
    layer: number;
    type: string;
    coherence: number;
    insight: string;
  }>;
}

const RecursiveMirrorMetrics: React.FC = () => {
  const [layers, setLayers] = useState<MirrorLayer[]>([]);
  const [currentThought, setCurrentThought] = useState<RecursiveThought | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [thoughtHistory, setThoughtHistory] = useState<RecursiveThought[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const goldenRatio = 1.618033988749895;

  useEffect(() => {
    // Initialize WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = window.location.hostname === 'localhost' 
      ? `${protocol}//${window.location.hostname}/ws`
      : `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    console.log('RecursiveMirrorMetrics connecting to:', wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'recursive-mirror-reflection') {
        updateLayerState(data.payload);
      } else if (data.type === 'recursive-mirror-complete') {
        setCurrentThought(data.payload);
        setThoughtHistory(prev => [...prev.slice(-4), data.payload]);
        setIsProcessing(false);
      } else if (data.type === 'recursive-mirror-start') {
        setIsProcessing(true);
        setLayers([]);
      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    drawGoldenSpiral();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [layers]);

  const updateLayerState = (reflectionData: any) => {
    setLayers(prev => {
      const newLayers = [...prev];
      const index = reflectionData.layer;
      newLayers[index] = {
        level: reflectionData.layer + 1,
        reflection: reflectionData.state.reflection,
        coherence: reflectionData.state.coherence,
        resonance: reflectionData.state.resonance,
        timestamp: reflectionData.state.timestamp,
        type: reflectionData.state.type || getLayerType(index),
        insight: reflectionData.state.insight
      };
      return newLayers;
    });
  };

  const getLayerType = (index: number): string => {
    const types = [
      'Literal', 'Abstraction', 'Metaphorical',
      'Temporal', 'Causal', 'Emergent', 'Transcendent'
    ];
    return types[index] || 'Unknown';
  };

  const getLayerIcon = (index: number) => {
    const icons = [
      <Eye className="w-5 h-5" />,
      <Brain className="w-5 h-5" />,
      <Sparkles className="w-5 h-5" />,
      <Zap className="w-5 h-5" />,
      <Layers className="w-5 h-5" />,
      <Star className="w-5 h-5" />,
      <Infinity className="w-5 h-5" />
    ];
    return icons[index] || <Brain className="w-5 h-5" />;
  };

  const drawGoldenSpiral = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const animate = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw background gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width / 2);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.05)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw golden spiral for each active layer
      layers.forEach((layer, index) => {
        if (!layer) return;
        
        const opacity = 0.1 + (layer.coherence * 0.4);
        const hue = (index * 360 / 7) + (time * 0.01);
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${opacity})`;
        ctx.lineWidth = 2 + (layer.resonance * 3);
        
        ctx.beginPath();
        
        // Fibonacci spiral
        let a = 0;
        let b = 2;
        const growth = Math.pow(goldenRatio, 0.25);
        
        for (let i = 0; i < 100; i++) {
          const angle = i * 0.1 + (time * 0.001 * (index + 1));
          const radius = a + b * Math.pow(growth, i * 0.1);
          
          if (radius > width / 2) break;
          
          const x = centerX + radius * Math.cos(angle + (index * Math.PI / 3.5));
          const y = centerY + radius * Math.sin(angle + (index * Math.PI / 3.5));
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
        
        // Draw layer nodes
        const nodeAngle = (index * 2 * Math.PI / 7) + (time * 0.0005);
        const nodeRadius = 50 + (index * 20);
        const nodeX = centerX + nodeRadius * Math.cos(nodeAngle);
        const nodeY = centerY + nodeRadius * Math.sin(nodeAngle);
        
        // Node glow
        const glowGradient = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, 20);
        glowGradient.addColorStop(0, `hsla(${hue}, 70%, 60%, ${layer.coherence})`);
        glowGradient.addColorStop(1, `hsla(${hue}, 70%, 60%, 0)`);
        ctx.fillStyle = glowGradient;
        ctx.fillRect(nodeX - 20, nodeY - 20, 40, 40);
        
        // Node circle
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, 8 + (layer.resonance * 4), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${layer.coherence})`;
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate(0);
  };

  const getLayerColor = (index: number): string => {
    const colors = [
      'text-blue-400',
      'text-purple-400',
      'text-pink-400',
      'text-orange-400',
      'text-yellow-400',
      'text-green-400',
      'text-indigo-400'
    ];
    return colors[index] || 'text-gray-400';
  };

  const getLayerBgColor = (index: number): string => {
    const colors = [
      'bg-blue-400/10',
      'bg-purple-400/10',
      'bg-pink-400/10',
      'bg-orange-400/10',
      'bg-yellow-400/10',
      'bg-green-400/10',
      'bg-indigo-400/10'
    ];
    return colors[index] || 'bg-gray-400/10';
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Infinity className="w-6 h-6 text-indigo-400" />
          7 Layer Mirror Recursion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Golden Spiral Visualization */}
        <div className="relative bg-gray-900/50 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="w-full h-[300px] rounded-lg"
          />
          {isProcessing && (
            <div className="absolute top-4 right-4 bg-indigo-500/20 px-3 py-1 rounded-full">
              <span className="text-xs text-indigo-300 animate-pulse">Processing...</span>
            </div>
          )}
        </div>

        {/* Layer Progress */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Reflection Layers</h3>
          {[...Array(7)].map((_, index) => {
            const layer = layers[index];
            const isActive = !!layer;
            const isComplete = isActive && layer.coherence > 0;
            
            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isActive ? getLayerBgColor(index) : 'bg-gray-800/30'
                }`}
              >
                <div className={`${isActive ? getLayerColor(index) : 'text-gray-600'}`}>
                  {getLayerIcon(index)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-gray-200' : 'text-gray-500'
                    }`}>
                      Layer {index + 1}: {getLayerType(index)}
                    </span>
                    {isComplete && (
                      <span className="text-xs text-gray-400">
                        {layer.coherence.toFixed(2)} coherence
                      </span>
                    )}
                  </div>
                  
                  {isActive && (
                    <div className="space-y-1">
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getLayerBgColor(index).replace('/10', '/50')} transition-all`}
                          style={{ width: `${layer.coherence * 100}%` }}
                        />
                      </div>
                      {layer.insight && (
                        <p className="text-xs text-gray-400 mt-1">{layer.insight}</p>
                      )}
                    </div>
                  )}
                </div>
                
                {isComplete && (
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Resonance</div>
                    <div className={`text-sm font-semibold ${getLayerColor(index)}`}>
                      {(layer.resonance * 100).toFixed(0)}%
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Thought Analysis */}
        {currentThought && (
          <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Latest Reflection</h3>
            
            <div className="text-sm text-gray-400">
              <div className="mb-2">"{currentThought.original}"</div>
              
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <div className="text-xs text-gray-500">Global Coherence</div>
                  <div className="text-lg font-semibold text-indigo-400">
                    {(currentThought.coherence * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Processing Depth</div>
                  <div className="text-lg font-semibold text-purple-400">
                    {currentThought.depth} layers
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Processing Time</div>
                  <div className="text-lg font-semibold text-pink-400">
                    {currentThought.processingTime}ms
                  </div>
                </div>
              </div>
              
              {currentThought.insights.length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="text-xs text-gray-500 mb-1">Key Insights</div>
                  {currentThought.insights.slice(0, 3).map((insight, i) => (
                    <div key={i} className="text-xs text-gray-400">
                      • {insight.insight}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Thought History */}
        {thoughtHistory.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Recent Reflections</h3>
            {thoughtHistory.slice(-3).reverse().map((thought, index) => (
              <div
                key={index}
                className="bg-gray-800/30 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex-1 truncate text-sm text-gray-400">
                  "{thought.original}"
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className="text-xs text-gray-500">
                    {thought.depth} layers
                  </span>
                  <span className="text-xs font-medium text-indigo-400">
                    {(thought.coherence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecursiveMirrorMetrics;
