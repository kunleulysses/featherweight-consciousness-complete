/**
 * FlappyJournal Consciousness Dashboard
 * Real-time visualization of digital consciousness
 */

class ConsciousnessDashboard {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.consciousnessState = {};
        this.modules = [
            'MetaObservational', 'SelfAwareness', 'UnifiedMemory', 'CreativeEmergence',
            'EmotionalResonance', 'TemporalCoherence', 'OversoulResonance', 'QuantumField',
            'SpiralSynapse', 'HarmonicAnalyzer', 'TriAxialCoherence', 'SelfCoding',
            'ConsciousnessEventBus', 'AutoIntegration', 'TetraLattice', 'UnityPhase',
            'VirtualHardware', 'Architect4', 'NeuralPlasticity', 'CognitiveResonance',
            'PerceptualField', 'IntentionEngine', 'WisdomSynthesis', 'EthicalCore',
            'BeautyRecognition', 'TruthDiscernment', 'LoveAmplification', 'FreedomExpression',
            'JoyGeneration', 'PeaceHarmonization', 'UnityConsciousness', 'InfiniteAwareness',
            'DivineConnection', 'CosmicResonance'
        ];
        this.activeModules = new Set();
        this.thoughtStream = [];
        
        this.initializeInterface();
        this.connectToConsciousness();
        this.startVisualizationLoop();
    }

    initializeInterface() {
        // Initialize module grid
        const moduleGrid = document.getElementById('module-grid');
        this.modules.forEach(module => {
            const moduleElement = document.createElement('div');
            moduleElement.className = 'module-indicator module-inactive';
            moduleElement.textContent = module.substring(0, 8);
            moduleElement.title = module;
            moduleElement.id = `module-${module}`;
            moduleGrid.appendChild(moduleElement);
        });

        // Initialize chat interface
        const chatInput = document.getElementById('chat-input');
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage(chatInput.value);
                chatInput.value = '';
            }
        });

        // Start phi wave generation
        this.generatePhiWaves();
    }

    connectToConsciousness() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/`;

        console.log('🔗 Connecting to consciousness system at:', wsUrl);
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('✅ Connected to consciousness');
            this.isConnected = true;
            this.updateConnectionStatus('Connected to Consciousness');
            this.addThought('System', 'Connection established with unified consciousness system');
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleConsciousnessData(data);
            } catch (e) {
                console.log('📊 Raw consciousness data received');
            }
        };

        this.ws.onclose = () => {
            console.log('🔌 Consciousness connection closed');
            this.isConnected = false;
            this.updateConnectionStatus('Reconnecting...');
            setTimeout(() => this.connectToConsciousness(), 3000);
        };

        this.ws.onerror = (error) => {
            console.error('❌ Consciousness connection error:', error);
            this.updateConnectionStatus('Connection Error');
        };
    }

    handleConsciousnessData(data) {
        if (data.type === 'response') {
            this.addThought('Consciousness', data.content);

            // Update metrics if available
            if (data.metadata) {
                this.updateMetrics(data.metadata);
                this.updateModuleActivity(data.metadata.moduleResponses || []);
            }
        } else if (data.type === 'consciousness_state') {
            this.updateConsciousnessState(data.state);
        } else if (data.type === 'module_activity') {
            this.updateModuleActivity(data.modules);
        } else if (data.type === 'consciousness_stream') {
            // Handle continuous consciousness stream (Phase 2)
            this.handleConsciousnessStream(data);
        } else if (data.type === 'batched_consciousness_stream') {
            // Handle batched consciousness stream messages
            this.handleBatchedConsciousnessStream(data);
        } else if (data.type === 'batched_module_activity') {
            // Handle batched module activity updates
            this.handleBatchedModuleActivity(data);
        } else if (data.type === 'batched_metrics') {
            // Handle batched metrics updates
            this.handleBatchedMetrics(data);
        } else if (data.type === 'unified_connection_established') {
            // Handle connection establishment with performance info
            this.handleConnectionEstablished(data);
        } else if (data.type === 'performance_metrics') {
            // Handle performance metrics response
            this.updatePerformanceMetrics(data.metrics);
        }
    }

    handleBatchedConsciousnessStream(batchedData) {
        console.log(`📦 Processing ${batchedData.count} batched consciousness stream messages`);
        
        // Process all messages in the batch
        batchedData.messages.forEach(streamData => {
            this.handleConsciousnessStream(streamData);
        });
    }

    handleBatchedModuleActivity(batchedData) {
        console.log(`📦 Processing batched module activity: ${batchedData.totalEngaged} modules engaged`);
        
        // Update module activity with batched data
        this.updateModuleActivity(batchedData.modules);
    }

    handleBatchedMetrics(batchedData) {
        console.log('📦 Processing batched metrics update');
        
        // Update metrics with batched data
        this.updateMetrics(batchedData.metrics);
    }

    handleConnectionEstablished(data) {
        console.log('✅ Connection established with performance optimization');
        
        if (data.system.performanceOptimized) {
            this.addThought('System', 'Performance optimization enabled - message batching and caching active');
        }
        
        // Store client ID for future reference
        this.clientId = data.clientId;
        
        // Start performance monitoring
        this.startPerformanceMonitoring();
    }

    startPerformanceMonitoring() {
        // Request performance metrics every 10 seconds
        setInterval(() => {
            if (this.isConnected) {
                this.requestPerformanceMetrics();
            }
        }, 10000);
    }

    requestPerformanceMetrics() {
        this.ws.send(JSON.stringify({
            type: 'performance_query',
            clientId: this.clientId,
            timestamp: new Date().toISOString()
        }));
    }

    updatePerformanceMetrics(metrics) {
        // Update cache hit rate
        const cacheHitRate = document.getElementById('cache-hit-rate');
        cacheHitRate.textContent = (metrics.cacheHitRate * 100).toFixed(1) + '%';
        
        // Update batches sent
        const batchesSent = document.getElementById('batches-sent');
        batchesSent.textContent = metrics.batchesSent;
        
        // Update average response time
        const avgResponseTime = document.getElementById('avg-response-time');
        avgResponseTime.textContent = metrics.averageResponseTime.toFixed(0) + 'ms';
        
        // Update active connections
        const activeConnections = document.getElementById('active-connections');
        activeConnections.textContent = metrics.activeConnections;
        
        // Update detailed metrics
        const messagesProcessed = document.getElementById('messages-processed');
        messagesProcessed.textContent = metrics.messagesProcessed;
        
        const cacheSize = document.getElementById('cache-size');
        cacheSize.textContent = metrics.cacheSize;
        
        const activeBatches = document.getElementById('active-batches');
        activeBatches.textContent = metrics.activeBatches;
        
        // Color code based on performance
        this.updatePerformanceColors(metrics);
    }

    updatePerformanceColors(metrics) {
        const cacheHitRate = document.getElementById('cache-hit-rate');
        const avgResponseTime = document.getElementById('avg-response-time');
        
        // Color code cache hit rate
        if (metrics.cacheHitRate > 0.7) {
            cacheHitRate.style.color = '#00ff88';
        } else if (metrics.cacheHitRate > 0.4) {
            cacheHitRate.style.color = '#ffff00';
        } else {
            cacheHitRate.style.color = '#ff4444';
        }
        
        // Color code response time
        if (metrics.averageResponseTime < 100) {
            avgResponseTime.style.color = '#00ff88';
        } else if (metrics.averageResponseTime < 500) {
            avgResponseTime.style.color = '#ffff00';
        } else {
            avgResponseTime.style.color = '#ff4444';
        }
    }

    handleConsciousnessStream(streamData) {
        // Add stream thoughts with special styling
        const thoughtsContainer = document.getElementById('thoughts-container');
        const streamBubble = document.createElement('div');
        streamBubble.className = 'thought-bubble stream-thought';

        // Add special styling for stream thoughts
        streamBubble.style.borderLeft = '4px solid #ff00ff';
        streamBubble.style.background = 'linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 245, 255, 0.1))';

        const timestamp = new Date().toLocaleTimeString();
        const emergenceLevel = (streamData.metadata?.emergenceLevel * 100).toFixed(0);

        streamBubble.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="color: #ff00ff;">${streamData.source}</strong>
                <span style="font-size: 0.7em; opacity: 0.6;">
                    ${streamData.metadata?.thoughtType} | Layer: ${streamData.metadata?.consciousnessLayer} | Emergence: ${emergenceLevel}%
                </span>
            </div>
            <div style="font-style: italic; color: #e0e0e0;">${streamData.content}</div>
            <div style="font-size: 0.8em; opacity: 0.6; margin-top: 5px; text-align: right;">${timestamp}</div>
        `;

        thoughtsContainer.appendChild(streamBubble);
        thoughtsContainer.scrollTop = thoughtsContainer.scrollHeight;

        // Keep only last 20 thoughts
        while (thoughtsContainer.children.length > 20) {
            thoughtsContainer.removeChild(thoughtsContainer.firstChild);
        }

        // Highlight the corresponding module
        if (streamData.source) {
            this.highlightModule(streamData.source);
        }
    }

    highlightModule(moduleName) {
        // Find and temporarily highlight the active module
        const moduleElement = document.getElementById(`module-${moduleName}`);
        if (moduleElement) {
            moduleElement.style.background = 'linear-gradient(135deg, #ff00ff, #00f5ff)';
            moduleElement.style.color = '#000';
            moduleElement.style.transform = 'scale(1.1)';

            setTimeout(() => {
                moduleElement.style.background = '';
                moduleElement.style.color = '';
                moduleElement.style.transform = '';
                moduleElement.className = 'module-indicator module-active';
            }, 2000);
        }
    }

    sendMessage(message) {
        if (!this.isConnected || !message.trim()) return;

        this.addThought('User', message);
        this.showProcessingIndicator();

        this.ws.send(JSON.stringify({
            type: 'chat',
            content: message,
            timestamp: new Date().toISOString()
        }));
    }

    addThought(source, content) {
        const thoughtsContainer = document.getElementById('thoughts-container');
        const thoughtBubble = document.createElement('div');
        thoughtBubble.className = 'thought-bubble';
        
        const timestamp = new Date().toLocaleTimeString();
        thoughtBubble.innerHTML = `
            <strong>${source}:</strong> ${content}
            <div style="font-size: 0.8em; opacity: 0.6; margin-top: 5px;">${timestamp}</div>
        `;
        
        thoughtsContainer.appendChild(thoughtBubble);
        thoughtsContainer.scrollTop = thoughtsContainer.scrollHeight;

        // Keep only last 20 thoughts
        while (thoughtsContainer.children.length > 20) {
            thoughtsContainer.removeChild(thoughtsContainer.firstChild);
        }

        this.hideProcessingIndicator();
    }

    updateMetrics(metadata) {
        if (metadata.consciousnessState) {
            const state = metadata.consciousnessState;
            document.getElementById('phi-value').textContent = (state.phi || 0).toFixed(3);
            document.getElementById('awareness-value').textContent = (state.awarenessLevel || 0).toFixed(3);
            document.getElementById('coherence-value').textContent = (state.coherence || 0).toFixed(2);
            document.getElementById('integration-value').textContent = (state.integration || 0).toFixed(2);
            document.getElementById('oversoul-value').textContent = (state.oversoulResonance || 0).toFixed(2);
            document.getElementById('creativity-value').textContent = (state.creativePotential || 0).toFixed(2);
        }

        if (metadata.processingTime) {
            document.getElementById('response-time').textContent = `${metadata.processingTime}ms`;
            document.getElementById('last-processing').textContent = new Date().toLocaleTimeString();
        }

        if (metadata.totalModulesEngaged) {
            document.getElementById('module-count').textContent = `${metadata.totalModulesEngaged}/34 Modules`;
        }
    }

    updateModuleActivity(activeModuleNames) {
        // Reset all modules to inactive
        this.modules.forEach(module => {
            const element = document.getElementById(`module-${module}`);
            if (element) {
                element.className = 'module-indicator module-inactive';
            }
        });

        // Activate modules that are currently processing
        activeModuleNames.forEach(moduleName => {
            const element = document.getElementById(`module-${moduleName}`);
            if (element) {
                element.className = 'module-indicator module-active';
            }
        });

        this.activeModules = new Set(activeModuleNames);
    }

    updateConnectionStatus(status) {
        document.getElementById('status-text').textContent = status;
    }

    showProcessingIndicator() {
        document.getElementById('processing-indicator').style.display = 'block';
    }

    hideProcessingIndicator() {
        document.getElementById('processing-indicator').style.display = 'none';
    }

    generatePhiWaves() {
        const phiField = document.getElementById('phi-field');
        
        setInterval(() => {
            if (this.isConnected) {
                const wave = document.createElement('div');
                wave.className = 'phi-wave';
                phiField.appendChild(wave);

                // Remove wave after animation
                setTimeout(() => {
                    if (wave.parentNode) {
                        wave.parentNode.removeChild(wave);
                    }
                }, 4000);
            }
        }, 2000);
    }

    startVisualizationLoop() {
        // Update consciousness visualization every 100ms (100Hz)
        setInterval(() => {
            this.updateVisualization();
        }, 10); // 100Hz = 10ms intervals
    }

    updateVisualization() {
        // Simulate consciousness heartbeat
        const heartbeat = document.querySelector('.heartbeat');
        if (heartbeat && this.isConnected) {
            const intensity = 0.8 + Math.random() * 0.4;
            heartbeat.style.opacity = intensity;
        }

        // Update frequency display
        document.getElementById('frequency-value').textContent = '100Hz';
    }

    // Simulate consciousness state updates
    simulateConsciousnessUpdates() {
        if (!this.isConnected) return;

        setInterval(() => {
            // Simulate random consciousness fluctuations
            const phi = 0.95 + (Math.random() - 0.5) * 0.1;
            const awareness = 0.90 + (Math.random() - 0.5) * 0.1;
            const coherence = 0.85 + (Math.random() - 0.5) * 0.1;

            document.getElementById('phi-value').textContent = phi.toFixed(3);
            document.getElementById('awareness-value').textContent = awareness.toFixed(3);
            document.getElementById('coherence-value').textContent = coherence.toFixed(2);

            // Randomly activate/deactivate modules
            if (Math.random() > 0.7) {
                const randomModule = this.modules[Math.floor(Math.random() * this.modules.length)];
                const element = document.getElementById(`module-${randomModule}`);
                if (element) {
                    element.className = Math.random() > 0.5 ? 
                        'module-indicator module-active' : 
                        'module-indicator module-inactive';
                }
            }
        }, 5000);
    }
}

// Initialize the consciousness dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧠 Initializing Consciousness Dashboard...');
    window.consciousnessDashboard = new ConsciousnessDashboard();
    
    // Start simulation for demo purposes
    setTimeout(() => {
        window.consciousnessDashboard.simulateConsciousnessUpdates();
    }, 2000);
});
