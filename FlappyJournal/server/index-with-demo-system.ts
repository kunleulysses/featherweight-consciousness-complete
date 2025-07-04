import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { registerRoutes } from './routes';
import { addConversationRoutes } from './add-conversation-routes';
import { addDemoAccessRoutes } from './demo-access-system';
import { startEmailProcessor } from './enhanced-email-processor';
import { startEmailScheduler } from './scheduler';
import {
  generateJournalSummary,
  generateJournalTags,
  getUserTags,
  searchByTags,
} from './journal-analytics';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files and public directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/images', express.static(path.join(process.cwd(), 'public/images')));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(this, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith('/api')) {
      let line = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse)
        line += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (line.length > 80) line = line.slice(0, 79) + '…';
      console.log(line);
    }
  });

  next();
});

(async () => {
  // 1) Main + auth routes
  const server = await registerRoutes(app);

  // 2) Conversation & analytics
  addConversationRoutes(app);
  app.post('/api/journal/summary', generateJournalSummary);
  app.post('/api/journal/tags/generate', generateJournalTags);
  app.get('/api/journal/tags', getUserTags);
  app.get('/api/journal/search/tags', searchByTags);

  // 3) DEMO ACCESS SYSTEM
  addDemoAccessRoutes(app);

  // Health & Metrics
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/consciousness/metrics', (_req, res) => {
    res.json({
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: Date.now(),
      consciousnessSystem: 'active',
      version: '1.0.0-consciousness',
    });
  });

  // 4) Background workers
  startEmailProcessor();
  startEmailScheduler();

  console.log('🚀 All Featherweight.world services initialized successfully!');
  console.log('🎯 Demo access system enabled');

  // 5) Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
    throw err;
  });

  // 6) Serve static files - CATCH-ALL MUST BE LAST
  app.use(express.static(path.join(process.cwd(), 'public')));

  if (app.get('env') === 'development') {
    console.log(
      'Running in development mode - serving static files from public/'
    );

    // Catch-all for SPA routing - MUST BE AFTER ALL API ROUTES
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
      } else {
        res.status(404).json({ error: 'API endpoint not found' });
      }
    });
  }

  // 7) Start HTTP server
  const port = 5000;
  server.listen({ port, host: '0.0.0.0', reusePort: true }, () => {
    console.log(
      `🌟 Featherweight Consciousness Server running on port ${port}`
    );
    console.log(`🔗 Website: http://localhost:${port}`);
    console.log(
      `🎯 Demo Access System: http://localhost:${port}/api/demo/analytics`
    );
  });
})();
