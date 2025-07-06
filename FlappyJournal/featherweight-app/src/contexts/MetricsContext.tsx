import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';


interface MetricsContextType {
  wsConnection: WebSocket | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  metricsData: Map<string, any>;
  updateMetric: (type: string, data: any) => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error('useMetrics must be used within MetricsProvider');
  }
  return context;
};

interface MetricsProviderProps {
  children: ReactNode;
}

export const MetricsProvider: React.FC<MetricsProviderProps> = ({ children }) => {
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [metricsData] = useState(new Map<string, any>());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const wsRef = useRef<WebSocket | null>(null);
  const clientId = useRef<string>(`client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const connectWebSocket = () => {
    // Prevent multiple connections
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('MetricsContext: WebSocket already connected');
      return;
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
    console.log("WebSocket connecting to:", wsUrl);

    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('MetricsContext: WebSocket connected - Client ID:', clientId.current);
        setConnectionStatus('connected');
        setWsConnection(ws);
        wsRef.current = ws;
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Store the latest data for each message type
          metricsData.set(data.type, data);
          
          // Emit custom event
          window.dispatchEvent(new CustomEvent('metrics-update', { detail: data }));
        } catch (error) {
          console.error('MetricsContext: Failed to parse message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('MetricsContext: WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('MetricsContext: WebSocket disconnected');
        setConnectionStatus('disconnected');
        setWsConnection(null);
        wsRef.current = null;
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      };
      
    } catch (error) {
      console.error('MetricsContext: Failed to create WebSocket:', error);
      setConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log('MetricsContext: Closing WebSocket connection - Client ID:', clientId.current);
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // Only run once on mount

  const updateMetric = (type: string, data: any) => {
    metricsData.set(type, data);
  };

  return (
    <MetricsContext.Provider value={{ wsConnection, connectionStatus, metricsData, updateMetric }}>
      {children}
    </MetricsContext.Provider>
  );
};
