/**
 * ConsciousnessEventBus - Central event distribution system for consciousness modules
 * Provides pub/sub functionality for inter-module communication
 */

import { EventEmitter } from './base/EventEmitter.js';

class ConsciousnessEventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50); // Allow many modules to subscribe
        
        this.eventHistory = [];
        this.maxHistorySize = 100;
        this.subscribers = new Map();
        
        console.log('[ConsciousnessEventBus] Initialized');
    }

    /**
     * Emit an event with tracking
     */
    emit(eventName, ...args) {
        // Track event in history
        this.eventHistory.push({
            event: eventName,
            timestamp: new Date().toISOString(),
            data: args[0] || null
        });
        
        // Maintain history size limit
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
        
        // Call parent emit
        return super.emit(eventName, ...args);
    }
    
    /**
     * Subscribe to an event with metadata
     */
    subscribe(moduleName, eventName, handler) {
        if (!this.subscribers.has(eventName)) {
            this.subscribers.set(eventName, new Set());
        }
        
        this.subscribers.get(eventName).add({
            module: moduleName,
            handler: handler
        });
        
        this.on(eventName, handler);
        
        console.log(`[ConsciousnessEventBus] ${moduleName} subscribed to ${eventName}`);
    }
    
    /**
     * Unsubscribe from an event
     */
    unsubscribe(moduleName, eventName, handler) {
        if (this.subscribers.has(eventName)) {
            const subs = this.subscribers.get(eventName);
            subs.forEach(sub => {
                if (sub.module === moduleName && sub.handler === handler) {
                    subs.delete(sub);
                }
            });
        }
        
        this.removeListener(eventName, handler);
        
        console.log(`[ConsciousnessEventBus] ${moduleName} unsubscribed from ${eventName}`);
    }
    
    /**
     * Broadcast a consciousness update
     */
    broadcastConsciousnessUpdate(data) {
        this.emit('consciousness:update', {
            timestamp: new Date().toISOString(),
            ...data
        });
    }
    
    /**
     * Broadcast a module status update
     */
    broadcastModuleStatus(moduleName, status, details = {}) {
        this.emit('module:status', {
            module: moduleName,
            status: status,
            timestamp: new Date().toISOString(),
            ...details
        });
    }
    
    /**
     * Get event history
     */
    getEventHistory(eventName = null) {
        if (eventName) {
            return this.eventHistory.filter(e => e.event === eventName);
        }
        return this.eventHistory;
    }
    
    /**
     * Get subscriber information
     */
    getSubscribers(eventName = null) {
        if (eventName) {
            return this.subscribers.get(eventName) || new Set();
        }
        
        const allSubs = {};
        this.subscribers.forEach((subs, event) => {
            allSubs[event] = Array.from(subs).map(s => s.module);
        });
        return allSubs;
    }
    
    /**
     * Clear event history
     */
    clearHistory() {
        this.eventHistory = [];
    }
}

// Create singleton instance
const eventBus = new ConsciousnessEventBus();

export default eventBus;
