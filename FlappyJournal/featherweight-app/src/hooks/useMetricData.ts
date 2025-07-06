import { useState, useEffect } from 'react';
import { useMetrics } from '../contexts/MetricsContext';

export function useMetricData(messageType: string) {
  const { metricsData } = useMetrics();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Get initial data if available
    const initialData = metricsData.get(messageType);
    if (initialData) {
      setData(initialData);
    }

    // Listen for updates
    const handleUpdate = (event: CustomEvent) => {
      if (event.detail.type === messageType) {
        setData(event.detail.data);
      }
    };

    window.addEventListener('metrics-update' as any, handleUpdate);
    
    return () => {
      window.removeEventListener('metrics-update' as any, handleUpdate);
    };
  }, [messageType, metricsData]);

  return data;
}
