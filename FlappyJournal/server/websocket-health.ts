import { Request, Response } from 'express';

/**
 * WebSocket health check endpoint
 * This endpoint is used by the load balancer to check if the WebSocket service is healthy
 */
export const websocketHealthCheck = (req: Request, res: Response) => {
  try {
    // Check if WebSocket server is running and healthy
    // This is a simple health check - you can add more sophisticated checks
    const isHealthy = true; // Replace with actual health check logic
    
    if (isHealthy) {
      res.status(200).json({
        status: 'healthy',
        service: 'websocket',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        service: 'websocket',
        timestamp: new Date().toISOString(),
        error: 'WebSocket service is not responding'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'websocket',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * General API health check endpoint
 * This endpoint is used by the load balancer to check if the main API is healthy
 */
export const apiHealthCheck = (req: Request, res: Response) => {
  try {
    res.status(200).json({
      status: 'healthy',
      service: 'api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'api',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
