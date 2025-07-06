import React, { useEffect, useState } from 'react';

export default function TestMetric() {
  const [status, setStatus] = useState('Connecting...');
  const [lastMessage, setLastMessage] = useState('');

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('TestMetric connecting to:', wsUrl);
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('TestMetric WebSocket connected!');
        setStatus('Connected');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('TestMetric received:', data.type);
        setLastMessage(data.type);
      };
      
      ws.onerror = (error) => {
        console.error('TestMetric WebSocket error:', error);
        setStatus('Error');
      };
      
      ws.onclose = () => {
        console.log('TestMetric WebSocket closed');
        setStatus('Disconnected');
      };
      
      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('TestMetric failed to create WebSocket:', error);
      setStatus('Failed');
    }
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>WebSocket Test</h3>
      <p>Status: {status}</p>
      <p>Last message: {lastMessage}</p>
    </div>
  );
}
