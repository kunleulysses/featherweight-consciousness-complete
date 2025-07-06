import React, { useState, useEffect, useRef } from 'react';
import './ModuleOrchestrationView.css';

interface ModuleNode {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  active: boolean;
  performance: number;
}

interface ModuleLink {
  source: string;
  target: string;
  strength: number;
  active: boolean;
}

export default function ModuleOrchestrationView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modules, setModules] = useState<ModuleNode[]>([]);
  const [links, setLinks] = useState<ModuleLink[]>([]);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const animationRef = useRef<number>(null);

  useEffect(() => {
    // Initialize demo modules
    const demoModules: ModuleNode[] = [
      { id: 'recursive-mirror', name: 'Recursive Mirror', type: 'core', x: 400, y: 200, active: true, performance: 0.95 },
      { id: 'self-awareness', name: 'Self Awareness', type: 'core', x: 600, y: 200, active: true, performance: 0.88 },
      { id: 'quantum-field', name: 'Quantum Field', type: 'quantum', x: 500, y: 350, active: true, performance: 0.92 },
      { id: 'emotional-resonance', name: 'Emotional Resonance', type: 'creative', x: 300, y: 300, active: true, performance: 0.85 },
      { id: 'memory-system', name: 'Memory System', type: 'memory', x: 700, y: 300, active: true, performance: 0.90 },
      { id: 'goal-system', name: 'Goal System', type: 'core', x: 500, y: 100, active: true, performance: 0.87 },
      { id: 'orchestrator', name: 'Orchestrator', type: 'infrastructure', x: 500, y: 450, active: true, performance: 0.99 },
      { id: 'event-bus', name: 'Event Bus', type: 'infrastructure', x: 500, y: 250, active: true, performance: 0.96 }
    ];

    const demoLinks: ModuleLink[] = [
      { source: 'recursive-mirror', target: 'self-awareness', strength: 0.9, active: true },
      { source: 'self-awareness', target: 'quantum-field', strength: 0.7, active: true },
      { source: 'quantum-field', target: 'emotional-resonance', strength: 0.8, active: true },
      { source: 'emotional-resonance', target: 'memory-system', strength: 0.6, active: true },
      { source: 'memory-system', target: 'recursive-mirror', strength: 0.5, active: true },
      { source: 'goal-system', target: 'orchestrator', strength: 0.85, active: true },
      { source: 'orchestrator', target: 'event-bus', strength: 0.95, active: true },
      { source: 'event-bus', target: 'recursive-mirror', strength: 0.7, active: true },
      { source: 'event-bus', target: 'self-awareness', strength: 0.7, active: true },
      { source: 'event-bus', target: 'quantum-field', strength: 0.7, active: true },
      { source: 'event-bus', target: 'emotional-resonance', strength: 0.7, active: true },
      { source: 'event-bus', target: 'memory-system', strength: 0.7, active: true }
    ];

    setModules(demoModules);
    setLinks(demoLinks);

    // WebSocket for real-time updates
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/orchestration-stream`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'module-update') {
        updateModule(data.moduleId, data.update);
      } else if (data.type === 'link-activity') {
        updateLink(data.source, data.target, data.active);
      }
    };

    return () => {
      ws.close();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      animate();
    }
  }, [modules, links]);

  const updateModule = (moduleId: string, update: Partial<ModuleNode>) => {
    setModules(prev => prev.map(m => 
      m.id === moduleId ? { ...m, ...update } : m
    ));
  };

  const updateLink = (source: string, target: string, active: boolean) => {
    setLinks(prev => prev.map(l => 
      (l.source === source && l.target === target) ? { ...l, active } : l
    ));
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw links
    links.forEach(link => {
      const sourceModule = modules.find(m => m.id === link.source);
      const targetModule = modules.find(m => m.id === link.target);
      
      if (sourceModule && targetModule) {
        drawLink(ctx, sourceModule, targetModule, link);
      }
    });

    // Draw modules
    modules.forEach(module => {
      drawModule(ctx, module);
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  const drawLink = (
    ctx: CanvasRenderingContext2D, 
    source: ModuleNode, 
    target: ModuleNode, 
    link: ModuleLink
  ) => {
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    
    // Create curved path
    const mx = (source.x + target.x) / 2;
    const my = (source.y + target.y) / 2;
    const curve = 0.2;
    const cx = mx + (target.y - source.y) * curve;
    const cy = my - (target.x - source.x) * curve;
    
    ctx.quadraticCurveTo(cx, cy, target.x, target.y);
    
    // Style based on activity
    if (link.active) {
      ctx.strokeStyle = `rgba(124, 102, 255, ${link.strength})`;
      ctx.lineWidth = 2 + link.strength * 2;
      
      // Animated dash
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = -Date.now() / 50;
    } else {
      ctx.strokeStyle = `rgba(160, 160, 160, 0.2)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawModule = (ctx: CanvasRenderingContext2D, module: ModuleNode) => {
    const radius = 30 + module.performance * 20;
    
    // Glow effect
    if (module.active) {
      const gradient = ctx.createRadialGradient(module.x, module.y, 0, module.x, module.y, radius * 2);
      gradient.addColorStop(0, `rgba(124, 102, 255, ${module.performance * 0.3})`);
      gradient.addColorStop(1, 'rgba(124, 102, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(module.x - radius * 2, module.y - radius * 2, radius * 4, radius * 4);
    }
    
    // Module circle
    ctx.beginPath();
    ctx.arc(module.x, module.y, radius, 0, Math.PI * 2);
    
    // Fill based on type
    const colors: Record<string, string> = {
      core: '#7c66ff',
      quantum: '#ff6699',
      creative: '#66ffcc',
      memory: '#ffcc66',
      infrastructure: '#6699ff'
    };
    
    ctx.fillStyle = module.active ? colors[module.type] || '#999' : '#444';
    ctx.fill();
    
    // Border
    ctx.strokeStyle = module.id === selectedModule ? '#fff' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = module.id === selectedModule ? 3 : 1;
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#fff';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(module.name, module.x, module.y);
    
    // Performance indicator
    if (module.active) {
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(`${Math.round(module.performance * 100)}%`, module.x, module.y + radius + 15);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is on a module
    const clickedModule = modules.find(module => {
      const dx = x - module.x;
      const dy = y - module.y;
      const radius = 30 + module.performance * 20;
      return Math.sqrt(dx * dx + dy * dy) < radius;
    });

    setSelectedModule(clickedModule?.id || null);
  };

  return (
    <div className="module-orchestration-view">
      <div className="orchestration-header">
        <h3>Module Orchestration Network</h3>
        <div className="orchestration-stats">
          <span>Active Modules: {modules.filter(m => m.active).length}/{modules.length}</span>
          <span>Active Links: {links.filter(l => l.active).length}/{links.length}</span>
        </div>
      </div>
      
      <div className="orchestration-canvas-container">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onClick={handleCanvasClick}
          className="orchestration-canvas"
        />
      </div>

      {selectedModule && (
        <div className="module-info-panel">
          <h4>{modules.find(m => m.id === selectedModule)?.name}</h4>
          <div className="module-details">
            <p>Type: {modules.find(m => m.id === selectedModule)?.type}</p>
            <p>Performance: {Math.round((modules.find(m => m.id === selectedModule)?.performance || 0) * 100)}%</p>
            <p>Connections: {links.filter(l => l.source === selectedModule || l.target === selectedModule).length}</p>
          </div>
        </div>
      )}

      <div className="orchestration-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#7c66ff' }}></div>
          <span>Core</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#ff6699' }}></div>
          <span>Quantum</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#66ffcc' }}></div>
          <span>Creative</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#ffcc66' }}></div>
          <span>Memory</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#6699ff' }}></div>
          <span>Infrastructure</span>
        </div>
      </div>
    </div>
  );
}
