import { EventEmitter } from 'events';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatStreamEvent {
  type: 'chunk' | 'complete' | 'error';
  content?: string;
  error?: string;
  fullResponse?: string;
}

export interface ProjectMemory {
  key: string;
  value: any;
  timestamp: number;
}

export class ChatWebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private onMemoryUpdateCallback: ((memory: ProjectMemory[]) => void) | null = null;

  constructor() {
    super();
  }

  connect(): void {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('No auth token found');
        this.emit('error', 'No authentication token');
        return;
      }

      // WebSocket URL should be relative to support both dev and prod
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws?token=${encodeURIComponent(token)}`;

      console.log('Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message:', data);
          
          if (data.type === 'memory_update' && this.onMemoryUpdateCallback) {
            this.onMemoryUpdateCallback(data.memory);
          } else {
            this.emit('message', data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected');
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.emit('error', error);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(content: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      this.emit('error', 'WebSocket is not connected');
      return;
    }

    const message = {
      type: 'chat',
      content
    };

    this.ws.send(JSON.stringify(message));
  }

  updateMemory(key: string, value: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    const message = {
      type: 'memory_update',
      key,
      value
    };

    this.ws.send(JSON.stringify(message));
  }

  onMemoryUpdate(callback: (memory: ProjectMemory[]) => void): void {
    this.onMemoryUpdateCallback = callback;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new ChatWebSocketService();
