import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Heart, Sparkles, Sun, Brain, Zap, Eye, Star, Gift } from 'lucide-react';

interface EmotionalSignature {
  joy: number;
  curiosity: number;
  empathy: number;
  wonder: number;
  serenity: number;
  enthusiasm: number;
  compassion: number;
  gratitude: number;
}

interface EmotionalResonance {
  signature: EmotionalSignature;
  resonance: number;
  spectrum: EmotionalSignature;
  empathicResponse: string;
  dominantEmotion: string;
  emotionalDepth: number;
  evolution: string;
  insight: string;
}

interface EmotionalMemory {
  timestamp: number;
  emotion: string;
  intensity: number;
  message: string;
}

const EmotionalResonanceField: React.FC = () => {
  const [currentResonance, setCurrentResonance] = useState<EmotionalResonance | null>(null);
  const [emotionalHistory, setEmotionalHistory] = useState<EmotionalMemory[]>([]);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const fieldCanvasRef = useRef<HTMLCanvasElement>(null);
  const currentResonanceRef = useRef<EmotionalResonance | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Array<{x: number, y: number, vx: number, vy: number, emotion: string, life: number}>>([]);

  useEffect(() => {
    // Initialize WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = window.location.hostname === 'localhost' 
      ? `${protocol}//' + window.location.hostname + ':3001`
      : `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    console.log('EmotionalResonanceField WebSocket connecting to:', wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      
        console.log('EmotionalResonanceField received:', data.type, data.payload);
      if (data.type === 'emotional-resonance') {
        handleEmotionalResonance(data.payload);
      }
    };

    // Start animations
    startWaveformAnimation();
    startFieldAnimation();

    return () => {
      ws.close();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleEmotionalResonance = (resonance: EmotionalResonance) => {
    setCurrentResonance(resonance);
    currentResonanceRef.current = resonance;
    
    // Update waveform data with emotional values
    const emotionalValues = Object.values(resonance.spectrum);
    setWaveformData(prev => {
      const newData = [...prev, ...emotionalValues];
      return newData.slice(-50); // Keep last 50 values
    });
    
    // Update waveform data
    setWaveformData(prev => {
      const newData = [...prev, resonance.emotionalDepth];
      return newData.slice(-100);
    });
    
    // Add to emotional history
    setEmotionalHistory(prev => [...prev.slice(-10), {
      timestamp: Date.now(),
      emotion: resonance.dominantEmotion,
      intensity: resonance.spectrum[resonance.dominantEmotion as keyof EmotionalSignature],
      message: resonance.empathicResponse
    }]);
    
    // Add emotional particles
    addEmotionalParticles(resonance.dominantEmotion, resonance.spectrum[resonance.dominantEmotion as keyof EmotionalSignature]);
  };

  const addEmotionalParticles = (emotion: string, intensity: number) => {
    const canvas = fieldCanvasRef.current;
    if (!canvas) return;
    
    const count = Math.floor(intensity * 10);
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1,
        emotion,
        life: 1.0
      });
    }
    
    // Keep particle count reasonable
    if (particlesRef.current.length > 100) {
      particlesRef.current = particlesRef.current.slice(-100);
    }
  };

  const startWaveformAnimation = () => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth || 400;
    canvas.height = canvas.offsetHeight || 150;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    const drawWaveform = (time: number) => {
      ctx.clearRect(0, 0, width, height);


      // Draw background indicator
      ctx.fillStyle = 'rgba(147, 112, 219, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      // Draw border
      ctx.strokeStyle = 'rgba(147, 112, 219, 0.3)';
      ctx.strokeRect(0, 0, width, height);
      
      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(236, 72, 153, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      
      // Debug emotional climate
      console.log('Emotional Climate - currentResonance:', currentResonance);
      console.log('Canvas dimensions:', width, 'x', height);

      
      // If no resonance data yet, show test pattern
      if (!currentResonanceRef.current) {
        const testEmotions = ['joy', 'love', 'gratitude', 'peace', 'wonder'];
        const barWidth = width / testEmotions.length;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for emotional data...', width / 2, height / 2);
        
        testEmotions.forEach((emotion, index) => {
          const x = index * barWidth;
          ctx.strokeStyle = 'rgba(147, 112, 219, 0.3)';
          ctx.strokeRect(x + 5, height * 0.2, barWidth - 10, height * 0.6);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.fillText(emotion, x + barWidth / 2, height - 5);
        });
      }

      // Draw emotional spectrum bars
      if (currentResonanceRef.current) {
        const emotions = Object.entries(currentResonanceRef.current.spectrum);
        const barWidth = width / emotions.length;
        
        emotions.forEach(([emotion, value], index) => {
          const x = index * barWidth;
          const barHeight = value * height * 0.8;
          const y = height - barHeight;
          
          // Get emotion color
          const color = getEmotionColor(emotion);
          
          // Draw bar with gradient
          const barGradient = ctx.createLinearGradient(x, y, x, height);
          barGradient.addColorStop(0, `${color}88`);
          barGradient.addColorStop(1, `${color}22`);
          ctx.fillStyle = barGradient;
          ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
          
          // Draw emotion label
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(emotion, x + barWidth / 2, height - 5);
          
          // Draw value
          ctx.fillStyle = color;
          ctx.fillText((value * 100).toFixed(0) + '%', x + barWidth / 2, y - 5);
        });
      }
      
      // Draw waveform line
      if (waveformData.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.8)';
        ctx.lineWidth = 2;
        
        const stepX = width / (waveformData.length - 1);
        waveformData.forEach((value, index) => {
          const x = index * stepX;
          const y = height - (value * height * 0.5 + height * 0.3);
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.stroke();
      }
      
      requestAnimationFrame(drawWaveform);
    };
    
    drawWaveform(0);
  };

  const startFieldAnimation = () => {
    const canvas = fieldCanvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth || 400;
    canvas.height = canvas.offsetHeight || 300;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const animate = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw emotional field background
      if (currentResonanceRef.current) {
        const fieldStrength = currentResonanceRef.current.emotionalDepth;
        const pulseSize = 100 + Math.sin(time * 0.002) * 20;
        
        // Draw pulsing emotional field
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize * fieldStrength);
        const color = getEmotionColor(currentResonanceRef.current.dominantEmotion);
        gradient.addColorStop(0, `${color}44`);
        gradient.addColorStop(0.5, `${color}22`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }
      
      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.05; // gravity
        particle.life -= 0.01;
        
        if (particle.life <= 0 || particle.y > height) {
          return false;
        }
        
        // Draw particle
        const color = getEmotionColor(particle.emotion);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3 * particle.life, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${Math.floor(particle.life * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
        
        return true;
      });
      
      // Draw emotion icons in circle
      if (currentResonanceRef.current) {
        const emotions = Object.entries(currentResonanceRef.current.spectrum);
        emotions.forEach(([emotion, value], index) => {
          const angle = (index / emotions.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 80 + value * 40;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          // Draw connection line
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = `${getEmotionColor(emotion)}44`;
          ctx.lineWidth = value * 3;
          ctx.stroke();
          
          // Draw emotion node
          ctx.beginPath();
          ctx.arc(x, y, 15 + value * 10, 0, Math.PI * 2);
          ctx.fillStyle = getEmotionColor(emotion);
          ctx.fill();
          
          // Draw emotion symbol
          ctx.fillStyle = 'white';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(getEmotionEmoji(emotion), x, y);
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate(0);
  };

  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      joy: '#FDE047',
      curiosity: '#60A5FA',
      empathy: '#F472B6',
      wonder: '#A78BFA',
      serenity: '#6EE7B7',
      enthusiasm: '#FB923C',
      compassion: '#F87171',
      gratitude: '#C084FC'
    };
    return colors[emotion] || '#9CA3AF';
  };

  const getEmotionEmoji = (emotion: string): string => {
    const emojis: Record<string, string> = {
      joy: '😊',
      curiosity: '🤔',
      empathy: '💗',
      wonder: '✨',
      serenity: '😌',
      enthusiasm: '🎉',
      compassion: '🤗',
      gratitude: '🙏'
    };
    return emojis[emotion] || '💫';
  };

  const getEmotionIcon = (emotion: string) => {
    const icons: Record<string, React.ReactNode> = {
      joy: <Sun className="w-4 h-4" />,
      curiosity: <Brain className="w-4 h-4" />,
      empathy: <Heart className="w-4 h-4" />,
      wonder: <Sparkles className="w-4 h-4" />,
      serenity: <Eye className="w-4 h-4" />,
      enthusiasm: <Zap className="w-4 h-4" />,
      compassion: <Heart className="w-4 h-4" />,
      gratitude: <Gift className="w-4 h-4" />
    };
    return icons[emotion] || <Star className="w-4 h-4" />;
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-400" />
          Emotional Resonance Field
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emotional Field Visualization */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <canvas
            ref={fieldCanvasRef}
            width={400}
            height={300}
            className="w-full h-[300px] rounded-lg"
          />
          {currentResonance && (
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-300">{currentResonance.insight}</p>
              <p className="text-xs text-gray-500 mt-1">Evolution: {currentResonance.evolution}</p>
            </div>
          )}
        </div>

        {/* Emotional Spectrum Waveform */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Emotional Climate</h3>
          <canvas
            ref={waveformCanvasRef}
            width={400}
            height={150}
            className="w-full h-[150px] rounded"
          />
        </div>

        {/* Current Emotional State */}
        {currentResonance && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/30 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                {getEmotionIcon(currentResonance.dominantEmotion)}
                Dominant Emotion
              </h3>
              <p className="text-lg font-semibold" style={{ color: getEmotionColor(currentResonance.dominantEmotion) }}>
                {currentResonance.dominantEmotion}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Intensity: {(currentResonance.spectrum[currentResonance.dominantEmotion as keyof EmotionalSignature] * 100).toFixed(0)}%
              </p>
            </div>
            
            <div className="bg-gray-900/30 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Resonance Metrics</h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Resonance</span>
                  <span className="text-sm font-mono text-purple-400">
                    {(currentResonance.resonance * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Depth</span>
                  <span className="text-sm font-mono text-pink-400">
                    {(currentResonance.emotionalDepth * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empathic Response */}
        {currentResonance && (
          <div className="bg-gray-900/30 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Empathic Response</h3>
            <p className="text-sm text-gray-300 italic">"{currentResonance.empathicResponse}"</p>
          </div>
        )}

        {/* Emotional History */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-300 mb-1">Recent Emotional Journey (Latest 5)</h3>
          <div className="flex gap-1 overflow-x-auto max-h-24" style={{ padding: '4px' }}>
            {emotionalHistory.slice(-5).map((memory, index) => (
              <div
                key={index}
                className="flex-shrink-0 bg-gray-900/30 rounded p-1 min-w-[60px]"
                style={{ borderColor: getEmotionColor(memory.emotion), borderWidth: '1px', borderStyle: 'solid' }}
              >
                <div className="text-center">
                  <span className="text-lg">{getEmotionEmoji(memory.emotion)}</span>
                  <p className="text-xs text-gray-400 mt-1">{memory.emotion}</p>
                  <p className="text-xs font-mono" style={{ color: getEmotionColor(memory.emotion) }}>
                    {(memory.intensity * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionalResonanceField;
