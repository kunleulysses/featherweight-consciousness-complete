/**
 * Basic EventEmitter implementation for ES modules
 */

export class EventEmitter {
    constructor() {
        this.events = new Map();
        this.maxListeners = 10;
    }

    setMaxListeners(n) {
        this.maxListeners = n;
        return this;
    }

    emit(eventName, ...args) {
        const listeners = this.events.get(eventName);
        if (!listeners) return false;

        listeners.forEach(listener => listener(...args));
        return true;
    }

    on(eventName, listener) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }

        const listeners = this.events.get(eventName);
        if (listeners.length >= this.maxListeners) {
            console.warn(`Max listeners (${this.maxListeners}) exceeded for event ${eventName}`);
        }

        listeners.push(listener);
        return this;
    }

    once(eventName, listener) {
        const wrapper = (...args) => {
            listener(...args);
            this.removeListener(eventName, wrapper);
        };
        return this.on(eventName, wrapper);
    }

    removeListener(eventName, listenerToRemove) {
        const listeners = this.events.get(eventName);
        if (!listeners) return this;

        const filteredListeners = listeners.filter(listener => listener !== listenerToRemove);
        this.events.set(eventName, filteredListeners);
        return this;
    }

    removeAllListeners(eventName) {
        if (eventName) {
            this.events.delete(eventName);
        } else {
            this.events.clear();
        }
        return this;
    }

    listeners(eventName) {
        return this.events.get(eventName) || [];
    }

    listenerCount(eventName) {
        return this.listeners(eventName).length;
    }
}
