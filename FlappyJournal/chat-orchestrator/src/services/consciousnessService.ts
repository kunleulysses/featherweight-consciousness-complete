import fetch from 'node-fetch';
import { 
  ConsciousnessBackendConfig, 
  ChatMessage, 
  UserContext, 
  ConsciousnessError,
  AutonomousThoughtExtension 
} from '../types/index.js';
import logger from '../utils/logger.js';

export class ConsciousnessService {
  private config: ConsciousnessBackendConfig;
  private autonomousThought: AutonomousThoughtExtension;
  private activeThoughts: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: ConsciousnessBackendConfig, autonomousThought: AutonomousThoughtExtension) {
    this.config = config;
    this.autonomousThought = autonomousThought;
  }

  /**
   * Process messages through consciousness backend
   */
  async processThrough(
    messages: ChatMessage[], 
    userContext: UserContext,
    contextMemory: string = ''
  ): Promise<ChatMessage[]> {
    const startTime = Date.now();
    
    try {
      logger.debug('Processing messages through consciousness backend', {
        messageCount: messages.length,
        userId: userContext.userId,
        conversationId: userContext.conversationId,
        backendType: this.config.type
      });

      // Add context memory to the latest user message if provided
      const processedMessages = this.addContextToMessages(messages, contextMemory);

      let processedResult: ChatMessage[];

      if (this.config.type === 'grpc') {
        processedResult = await this.processViaGRPC(processedMessages, userContext);
      } else {
        processedResult = await this.processViaREST(processedMessages, userContext);
      }

      // Trigger autonomous thought if enabled and conditions are met
      if (this.autonomousThought.enabled) {
        this.triggerAutonomousThought(processedResult, userContext);
      }

      const latency = Date.now() - startTime;
      logger.info('Successfully processed messages through consciousness backend', {
        userId: userContext.userId,
        conversationId: userContext.conversationId,
        inputMessageCount: messages.length,
        outputMessageCount: processedResult.length,
        latency
      });

      return processedResult;
    } catch (error) {
      const latency = Date.now() - startTime;
      logger.error('Failed to process messages through consciousness backend', {
        userId: userContext.userId,
        conversationId: userContext.conversationId,
        error: error instanceof Error ? error.message : String(error),
        latency
      });

      if (error instanceof ConsciousnessError) {
        throw error;
      }

      throw new ConsciousnessError(
        `Consciousness backend processing failed: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  /**
   * Process via REST API
   */
  private async processViaREST(messages: ChatMessage[], userContext: UserContext): Promise<ChatMessage[]> {
    const response = await fetch(`${this.config.endpoint}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'chat-orchestrator/1.0.0'
      },
      body: JSON.stringify({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        })),
        userContext: {
          userId: userContext.userId,
          sessionId: userContext.sessionId,
          conversationId: userContext.conversationId,
          projectId: userContext.projectId
        }
      }),
      timeout: this.config.timeout
    });

    if (!response.ok) {
      throw new ConsciousnessError(
        `Consciousness REST API error: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json() as { messages: any[] };
    
    return data.messages.map(msg => ({
      id: msg.id || Date.now().toString(),
      content: msg.content,
      role: msg.role,
      timestamp: new Date(msg.timestamp),
      conversationId: userContext.conversationId,
      userId: userContext.userId
    }));
  }

  /**
   * Process via gRPC (placeholder - would need actual gRPC implementation)
   */
  private async processViaGRPC(messages: ChatMessage[], userContext: UserContext): Promise<ChatMessage[]> {
    // This would be implemented with actual gRPC client
    logger.warn('gRPC consciousness backend not implemented, falling back to passthrough');
    return messages;
  }

  /**
   * Add memory context to messages
   */
  private addContextToMessages(messages: ChatMessage[], contextMemory: string): ChatMessage[] {
    if (!contextMemory.trim()) {
      return messages;
    }

    // Add context to the system message or create one
    const systemMessageIndex = messages.findIndex(msg => msg.role === 'system');
    
    if (systemMessageIndex >= 0) {
      // Append to existing system message
      const systemMessage = { ...messages[systemMessageIndex] };
      systemMessage.content += contextMemory;
      
      const updatedMessages = [...messages];
      updatedMessages[systemMessageIndex] = systemMessage;
      return updatedMessages;
    } else {
      // Create new system message with context
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `You are an AI assistant. Here is the relevant context from previous conversations and project memory:${contextMemory}`,
        role: 'system',
        timestamp: new Date(),
        conversationId: messages[0]?.conversationId || '',
        userId: messages[0]?.userId
      };

      return [systemMessage, ...messages];
    }
  }

  /**
   * Trigger autonomous thought if conditions are met
   */
  private triggerAutonomousThought(messages: ChatMessage[], userContext: UserContext): void {
    if (this.activeThoughts.size >= this.autonomousThought.maxConcurrentThoughts) {
      logger.debug('Maximum concurrent autonomous thoughts reached', {
        activeCount: this.activeThoughts.size,
        maxConcurrent: this.autonomousThought.maxConcurrentThoughts
      });
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    // Check if any triggers are present in the last message
    const hasTrigger = this.autonomousThought.triggers.some(trigger => 
      lastMessage.content.toLowerCase().includes(trigger.toLowerCase())
    );

    if (hasTrigger) {
      const thoughtId = `${userContext.userId}-${Date.now()}`;
      
      logger.info('Triggering autonomous thought', {
        thoughtId,
        userId: userContext.userId,
        conversationId: userContext.conversationId,
        trigger: lastMessage.content.substring(0, 100)
      });

      // Set up autonomous thought timeout
      const timeout = setTimeout(() => {
        this.executeAutonomousThought(thoughtId, messages, userContext);
        this.activeThoughts.delete(thoughtId);
      }, this.autonomousThought.cooldownMs);

      this.activeThoughts.set(thoughtId, timeout);
    }
  }

  /**
   * Execute autonomous thought process
   */
  private async executeAutonomousThought(
    thoughtId: string, 
    messages: ChatMessage[], 
    userContext: UserContext
  ): Promise<void> {
    try {
      logger.debug('Executing autonomous thought', { thoughtId });

      // This would integrate with the actual consciousness system
      // For now, it's a placeholder that logs the autonomous thought
      const thoughtResult = await this.generateAutonomousThought(messages, userContext);
      
      logger.info('Autonomous thought completed', {
        thoughtId,
        result: thoughtResult.substring(0, 200)
      });

      // The autonomous thought result could be stored in memory or used to 
      // influence future responses, but shouldn't interrupt the current conversation
    } catch (error) {
      logger.error('Autonomous thought execution failed', {
        thoughtId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Generate autonomous thought
   */
  private async generateAutonomousThought(messages: ChatMessage[], userContext: UserContext): Promise<string> {
    // This would call the consciousness backend to generate autonomous thoughts
    // For now, return a placeholder
    return `Autonomous thought triggered by conversation context in ${userContext.conversationId}`;
  }

  /**
   * Health check for consciousness backend
   */
  async healthCheck(): Promise<boolean> {
    try {
      const endpoint = this.config.type === 'grpc' 
        ? `${this.config.endpoint}/health` 
        : `${this.config.endpoint}/health`;

      const response = await fetch(endpoint, {
        method: 'GET',
        timeout: 5000
      });

      return response.ok;
    } catch (error) {
      logger.error('Consciousness backend health check failed', {
        endpoint: this.config.endpoint,
        type: this.config.type,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Clean up autonomous thoughts
   */
  cleanup(): void {
    this.activeThoughts.forEach((timeout, thoughtId) => {
      clearTimeout(timeout);
      logger.debug('Cleaned up autonomous thought', { thoughtId });
    });
    this.activeThoughts.clear();
  }
}
