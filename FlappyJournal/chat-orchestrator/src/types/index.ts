import { z } from 'zod';

// Message Types
export const MessageTypeSchema = z.enum(['user_message', 'assistant_message', 'system_message', 'stream_event', 'error', 'stop_generation', 'get_memory', 'memory_update']);
export type MessageType = z.infer<typeof MessageTypeSchema>;

// Stream Event Types
export const StreamEventTypeSchema = z.enum(['token', 'complete', 'error', 'start']);
export type StreamEventType = z.infer<typeof StreamEventTypeSchema>;

// WebSocket Message Schema
export const WebSocketMessageSchema = z.object({
  type: MessageTypeSchema,
  content: z.string().optional(),
  messageId: z.string().optional(),
  timestamp: z.string().optional(),
  event: z.object({
    type: StreamEventTypeSchema,
    data: z.string(),
    messageId: z.string().optional()
  }).optional(),
  memory: z.array(z.object({
    id: z.string(),
    key: z.string(),
    value: z.any(),
    timestamp: z.string(),
    scope: z.string()
  })).optional()
});

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

// Chat Message Interface
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  conversationId: string;
  userId?: string;
}

// Stream Event Interface
export interface StreamEvent {
  type: StreamEventType;
  data: string;
  messageId?: string;
  timestamp: Date;
}

// Provider Types
export const ProviderSchema = z.enum(['openai', 'venice', 'gemini']);
export type Provider = z.infer<typeof ProviderSchema>;

// Provider Configuration
export interface ProviderConfig {
  name: Provider;
  apiKey: string;
  baseUrl?: string;
  model: string;
  enabled: boolean;
  priority: number;
  maxRetries: number;
  timeout: number;
}

// Consciousness Backend Configuration
export interface ConsciousnessBackendConfig {
  type: 'grpc' | 'rest';
  endpoint: string;
  timeout: number;
  retries: number;
  enabled: boolean;
}

// Advanced Memory API Configuration
export interface MemoryConfig {
  apiUrl: string;
  apiKey: string;
  timeout: number;
  retries: number;
}

// System Configuration (limited to guardrails/safety)
export interface SystemConfig {
  guardrails: {
    enabled: boolean;
    maxTokens: number;
    rateLimiting: {
      enabled: boolean;
      requestsPerMinute: number;
      requestsPerHour: number;
    };
    contentFiltering: {
      enabled: boolean;
      blockedPatterns: string[];
    };
  };
  safety: {
    enabled: boolean;
    toxicityThreshold: number;
    biasDetection: boolean;
    privacyProtection: boolean;
  };
}

// User Context
export interface UserContext {
  userId: string;
  sessionId: string;
  conversationId: string;
  projectId?: string;
  preferences?: {
    provider?: Provider;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

// Project Memory Item
export interface ProjectMemory {
  id: string;
  key: string;
  value: any;
  timestamp: Date;
  scope: string;
  conversationId?: string;
  userId?: string;
  projectId?: string;
}

// Autonomous Thought Extension
export interface AutonomousThoughtExtension {
  enabled: boolean;
  triggers: string[];
  cooldownMs: number;
  maxConcurrentThoughts: number;
}

// Provider Response
export interface ProviderResponse {
  success: boolean;
  content?: string;
  error?: string;
  provider: Provider;
  model: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  latency: number;
}

// Multi-Provider Routing Configuration
export interface MultiProviderConfig {
  enabled: boolean;
  fallbackStrategy: 'sequential' | 'parallel' | 'load_balance';
  providers: ProviderConfig[];
  autonomousThought: AutonomousThoughtExtension;
}

// Chat Orchestrator Configuration
export interface ChatOrchestratorConfig {
  server: {
    port: number;
    host: string;
    cors: {
      origin: string[];
      credentials: boolean;
    };
    websocket: {
      path: string;
      pingInterval: number;
      pongTimeout: number;
      maxConnections: number;
    };
  };
  providers: MultiProviderConfig;
  consciousness: ConsciousnessBackendConfig;
  memory: MemoryConfig;
  system: SystemConfig;
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'simple';
  };
}

// Error Types
export class ChatOrchestratorError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public provider?: Provider
  ) {
    super(message);
    this.name = 'ChatOrchestratorError';
  }
}

export class ProviderError extends ChatOrchestratorError {
  constructor(message: string, provider: Provider, statusCode: number = 500) {
    super(message, 'PROVIDER_ERROR', statusCode, provider);
    this.name = 'ProviderError';
  }
}

export class MemoryError extends ChatOrchestratorError {
  constructor(message: string, statusCode: number = 500) {
    super(message, 'MEMORY_ERROR', statusCode);
    this.name = 'MemoryError';
  }
}

export class ConsciousnessError extends ChatOrchestratorError {
  constructor(message: string, statusCode: number = 500) {
    super(message, 'CONSCIOUSNESS_ERROR', statusCode);
    this.name = 'ConsciousnessError';
  }
}
