import authService from './authService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  session_id?: string;
}

interface ChatSession {
  id: string;
  user_id: string;
  project_id?: string;
  created_at: string;
  last_message_at: string;
}

class ChatService {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private keepAliveInterval: NodeJS.Timeout | null = null;

  async connect(): Promise<void> {
    const token = await authService.getAccessToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const wsUrl = process.env.REACT_APP_CHAT_WS_URL || 
      (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + 
      `//${window.location.host}/ws/chat`;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startKeepAlive();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.stopKeepAlive();
          this.handleDisconnect();
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(data: any) {
    const { type, ...payload } = data;
    
    // Handle specific message types
    switch (type) {
      case 'connected':
        this.emit('connected', payload);
        break;
      case 'message_saved':
        this.emit('message_saved', payload.message);
        break;
      case 'ai_response_chunk':
        this.emit('ai_response_chunk', payload);
        break;
      case 'ai_response_complete':
        this.emit('ai_response_complete', payload.message);
        break;
      case 'session_created':
        this.emit('session_created', payload.session);
        break;
      case 'session_loaded':
        this.emit('session_loaded', payload.messages);
        break;
      case 'error':
        this.emit('error', payload);
        break;
      case 'pong':
        // Keep-alive response
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  }

  private handleDisconnect() {
    this.emit('disconnected', {});
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      this.emit('connection_failed', { message: 'Max reconnection attempts reached' });
    }
  }

  private startKeepAlive() {
    this.keepAliveInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  disconnect() {
    this.stopKeepAlive();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      throw new Error('WebSocket is not connected');
    }
  }

  // Event handling
  on(event: string, handler: (data: any) => void) {
    this.messageHandlers.set(event, handler);
  }

  off(event: string) {
    this.messageHandlers.delete(event);
  }

  private emit(event: string, data: any) {
    const handler = this.messageHandlers.get(event);
    if (handler) {
      handler(data);
    }
  }

  // Chat operations
  sendMessage(content: string, sessionId: string) {
    this.send({
      type: 'chat',
      content,
      sessionId
    });
  }

  createSession(projectId?: string) {
    this.send({
      type: 'create_session',
      projectId
    });
  }

  loadSession(sessionId: string) {
    this.send({
      type: 'load_session',
      sessionId
    });
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const chatService = new ChatService();
export default chatService;
