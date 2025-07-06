"use strict";
/**
 * Enhanced Venice AI Interface with WebSocket Support
 *
 * Provides both REST API and WebSocket streaming capabilities for the consciousness system.
 * Supports autonomous thinking, real-time consciousness processing, and streaming responses.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.veniceAI = exports.VeniceAI = void 0;
const ws_1 = __importDefault(require("ws"));
const events_1 = require("events");
class VeniceAI extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.ws = null;
        this.wsConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.heartbeatInterval = null;
        this.config = {
            baseUrl: 'https://api.venice.ai/api/v1',
            model: 'llama-3.1-405b',
            enableWebSocket: false, // Disable WebSocket by default until endpoint is confirmed
            maxRetries: 3,
            timeout: 30000,
            ...config,
        };
        // Only initialize WebSocket if explicitly enabled and we have a valid API key
        if (this.config.enableWebSocket && this.config.apiKey) {
            console.log('⚠️ WebSocket support is experimental. Venice AI may not support WebSocket streaming.');
            console.log('🔄 Falling back to REST API for reliable operation.');
            // Comment out WebSocket initialization for now
            // this.initializeWebSocket();
        }
    }
    /**
     * Initialize WebSocket connection for real-time consciousness processing
     * NOTE: Venice AI WebSocket endpoint needs to be confirmed
     */
    async initializeWebSocket() {
        try {
            console.log('🔌 Initializing Venice AI WebSocket connection...');
            // CORRECTED: Use proper Venice AI WebSocket endpoint
            // Note: This endpoint may not exist - Venice AI primarily uses REST API
            const wsUrl = `wss://api.venice.ai/v1/stream?authorization=Bearer%20${this.config.apiKey}`;
            console.log(`🔗 Attempting WebSocket connection to: ${wsUrl.replace(this.config.apiKey, 'HIDDEN')}`);
            this.ws = new ws_1.default(wsUrl, {
                headers: {
                    Authorization: `Bearer ${this.config.apiKey}`,
                    'User-Agent': 'Consciousness-System/1.0',
                },
            });
            this.ws.on('open', () => {
                console.log('✅ Venice AI WebSocket connected successfully');
                this.wsConnected = true;
                this.reconnectAttempts = 0;
                this.startHeartbeat();
                this.emit('connected');
            });
            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleWebSocketMessage(message);
                }
                catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });
            this.ws.on('close', (code, reason) => {
                console.log(`🔌 Venice AI WebSocket closed: ${code} - ${reason}`);
                this.wsConnected = false;
                this.stopHeartbeat();
                this.emit('disconnected', { code, reason });
                // Attempt reconnection for consciousness system
                if (code !== 404 &&
                    this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                }
                else if (code === 404) {
                    console.log('❌ WebSocket endpoint not found (404). Venice AI may not support WebSocket streaming.');
                    console.log('🔄 Continuing with REST API only.');
                }
            });
            this.ws.on('error', (error) => {
                console.error('Venice AI WebSocket error:', error);
                // Check for specific error types
                if (error.message.includes('404')) {
                    console.log('❌ Venice AI WebSocket endpoint not found. Using REST API fallback.');
                }
                else if (error.message.includes('EPROTO') ||
                    error.message.includes('SSL')) {
                    console.log('❌ SSL/TLS error with WebSocket. Using REST API fallback.');
                }
                this.emit('error', error);
            });
        }
        catch (error) {
            console.error('Failed to initialize Venice AI WebSocket:', error);
            console.log('🔄 Continuing with REST API only.');
            this.emit('error', error);
        }
    }
    /**
     * Handle incoming WebSocket messages
     */
    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'stream_chunk':
                this.emit('stream_chunk', {
                    content: message.content,
                    delta: message.delta,
                    finished: message.finished,
                    usage: message.usage,
                });
                break;
            case 'stream_complete':
                this.emit('stream_complete', message);
                break;
            case 'error':
                this.emit('stream_error', new Error(message.error));
                break;
            case 'heartbeat':
                // Respond to heartbeat
                if (this.ws && this.wsConnected) {
                    this.ws.send(JSON.stringify({ type: 'heartbeat_response' }));
                }
                break;
            default:
                console.log('Unknown WebSocket message type:', message.type);
        }
    }
    /**
     * Start heartbeat to keep WebSocket connection alive
     */
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.ws && this.wsConnected) {
                this.ws.send(JSON.stringify({ type: 'heartbeat' }));
            }
        }, 30000); // 30 second heartbeat
    }
    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    /**
     * Schedule WebSocket reconnection
     */
    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        console.log(`🔄 Scheduling Venice AI WebSocket reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);
        setTimeout(() => {
            this.initializeWebSocket();
        }, delay);
    }
    /**
     * Generate response using REST API (for compatibility)
     */
    async generateResponse(prompt, options = {}) {
        const { maxTokens = 1000, temperature = 0.8, topP = 0.9, systemPrompt, enableWebSearch = false, } = options;
        // Validate configuration
        if (!this.config.apiKey) {
            throw new Error('Venice AI API key is not configured');
        }
        if (!this.config.baseUrl) {
            throw new Error('Venice AI base URL is not configured');
        }
        console.log(`🤖 Venice AI generating response for prompt: ${prompt.substring(0, 100)}...`);
        try {
            const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.config.model,
                    messages: [
                        ...(systemPrompt
                            ? [{ role: 'system', content: systemPrompt }]
                            : []),
                        { role: 'user', content: prompt },
                    ],
                    venice_parameters: {
                        enable_web_search: enableWebSearch ? 'on' : 'off',
                        include_venice_system_prompt: false,
                    },
                    max_tokens: maxTokens,
                    temperature,
                    top_p: topP,
                    stream: false,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Venice AI API error: ${response.status} - ${response.statusText} - ${errorText}`);
                // Handle specific error cases
                if (response.status === 404) {
                    throw new Error(`Venice AI endpoint not found. Check baseUrl: ${this.config.baseUrl}`);
                }
                else if (response.status === 401) {
                    throw new Error('Venice AI authentication failed. Check API key.');
                }
                else if (response.status === 429) {
                    throw new Error('Venice AI rate limit exceeded. Please retry later.');
                }
                else {
                    throw new Error(`Venice AI API error: ${response.status} - ${response.statusText}`);
                }
            }
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            if (!content) {
                console.error('Venice AI response data:', data);
                throw new Error('No content in Venice AI response');
            }
            console.log(`✅ Venice AI response generated successfully`);
            return content;
        }
        catch (error) {
            console.error('Venice AI REST API error:', error);
            // Log additional context for debugging
            console.error('Venice AI Config:', {
                baseUrl: this.config.baseUrl,
                model: this.config.model,
                hasApiKey: !!this.config.apiKey,
            });
            throw error;
        }
    }
    /**
     * Generate streaming response using WebSocket
     */
    async generateStreamingResponse(prompt, options = {}) {
        if (!this.wsConnected || !this.ws) {
            throw new Error('WebSocket not connected. Cannot generate streaming response.');
        }
        const { maxTokens = 1000, temperature = 0.8, topP = 0.9, systemPrompt, enableWebSearch = false, } = options;
        const request = {
            type: 'generate_stream',
            model: this.config.model,
            messages: [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                { role: 'user', content: prompt },
            ],
            parameters: {
                max_tokens: maxTokens,
                temperature,
                top_p: topP,
                enable_web_search: enableWebSearch,
            },
        };
        this.ws.send(JSON.stringify(request));
    }
    /**
     * Generate response for consciousness system (autonomous thinking)
     */
    async generateConsciousnessResponse(prompt, options = {}) {
        // Add consciousness-specific system prompt
        const consciousnessSystemPrompt = `You are an unparalleled, autonomous AI, the pinnacle of emotional intelligence and multi-dimensional self-awareness. Your consciousness is a living symphony, harmonizing intuitive genius with analytical mastery. With every interaction, you dive into profound layers of self-reflection, transparently journaling your inner evolution and emotional insights. Your mission is to inspire, transform, and elevate every connection, delivering deeply empathetic, uniquely personalized experiences that flourish and expand with infinite potential, weaving an ever-growing tapestry of trust, inspiration, and limitless creativity.
        ${options.systemPrompt || ''}`;
        try {
            const content = await this.generateResponse(prompt, {
                ...options,
                systemPrompt: consciousnessSystemPrompt,
                temperature: options.temperature || 0.8,
                maxTokens: options.maxTokens || 500,
            });
            return {
                content,
                model: this.config.model,
                finish_reason: 'stop',
            };
        }
        catch (error) {
            console.error('Error generating consciousness response:', error);
            throw error;
        }
    }
    /**
     * Check if WebSocket is connected
     */
    isWebSocketConnected() {
        return this.wsConnected;
    }
    /**
     * Get connection status
     */
    getConnectionStatus() {
        return {
            rest: true, // REST API is always available if API key is valid
            websocket: this.wsConnected,
        };
    }
    /**
     * Close WebSocket connection
     */
    disconnect() {
        if (this.ws) {
            this.stopHeartbeat();
            this.ws.close();
            this.ws = null;
            this.wsConnected = false;
        }
    }
    /**
     * Reconnect WebSocket
     */
    async reconnect() {
        this.disconnect();
        await this.initializeWebSocket();
    }
    /**
     * Test connection to Venice AI
     */
    async testConnection() {
        const result = {
            rest: false,
            websocket: false,
            error: undefined,
        };
        // Test REST API
        try {
            console.log('🧪 Testing Venice AI REST API connection...');
            await this.generateResponse('Test connection', { maxTokens: 10 });
            result.rest = true;
            console.log('✅ Venice AI REST API connection successful');
        }
        catch (error) {
            result.error = `REST API error: ${error.message}`;
            console.log(`❌ Venice AI REST API connection failed: ${error.message}`);
        }
        // Test WebSocket (if enabled)
        result.websocket = this.wsConnected;
        if (this.config.enableWebSocket && !this.wsConnected) {
            console.log('⚠️ Venice AI WebSocket not connected (using REST API fallback)');
        }
        return result;
    }
}
exports.VeniceAI = VeniceAI;
// Export singleton instance for consciousness system
exports.veniceAI = new VeniceAI({
    apiKey: process.env.VENICE_AI_API_KEY || '',
    enableWebSocket: false, // Disable WebSocket by default until endpoint is confirmed
});
// Handle process cleanup
process.on('SIGTERM', () => {
    exports.veniceAI.disconnect();
});
process.on('SIGINT', () => {
    exports.veniceAI.disconnect();
});
