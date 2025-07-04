import fetch from 'node-fetch';
import { ProjectMemory, MemoryConfig, MemoryError, UserContext } from '../types/index.js';
import logger from '../utils/logger.js';

export class MemoryService {
  private config: MemoryConfig;

  constructor(config: MemoryConfig) {
    this.config = config;
  }

  /**
   * Fetch conversation context from Advanced Memory API
   */
  async getConversationContext(userContext: UserContext): Promise<ProjectMemory[]> {
    const startTime = Date.now();
    
    try {
      logger.debug('Fetching conversation context', {
        userId: userContext.userId,
        conversationId: userContext.conversationId,
        projectId: userContext.projectId
      });

      const params = new URLSearchParams({
        userId: userContext.userId,
        conversationId: userContext.conversationId,
        ...(userContext.projectId && { projectId: userContext.projectId }),
        scope: 'conversation,project,user',
        limit: '100'
      });

      const response = await fetch(`${this.config.apiUrl}/memory/context?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'chat-orchestrator/1.0.0'
        },
        timeout: this.config.timeout
      });

      if (!response.ok) {
        throw new MemoryError(
          `Memory API error: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json() as { memories: any[] };
      const memories = data.memories.map(item => ({
        id: item.id,
        key: item.key,
        value: item.value,
        timestamp: new Date(item.timestamp),
        scope: item.scope,
        conversationId: item.conversationId,
        userId: item.userId,
        projectId: item.projectId
      }));

      const latency = Date.now() - startTime;
      logger.info('Successfully fetched conversation context', {
        userId: userContext.userId,
        conversationId: userContext.conversationId,
        memoryCount: memories.length,
        latency
      });

      return memories;
    } catch (error) {
      const latency = Date.now() - startTime;
      logger.error('Failed to fetch conversation context', {
        userId: userContext.userId,
        conversationId: userContext.conversationId,
        error: error instanceof Error ? error.message : String(error),
        latency
      });

      if (error instanceof MemoryError) {
        throw error;
      }

      throw new MemoryError(
        `Failed to fetch conversation context: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  /**
   * Store new memory item
   */
  async storeMemory(memory: Omit<ProjectMemory, 'id' | 'timestamp'>): Promise<ProjectMemory> {
    const startTime = Date.now();
    
    try {
      logger.debug('Storing memory', {
        key: memory.key,
        scope: memory.scope,
        userId: memory.userId,
        conversationId: memory.conversationId
      });

      const response = await fetch(`${this.config.apiUrl}/memory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'chat-orchestrator/1.0.0'
        },
        body: JSON.stringify({
          key: memory.key,
          value: memory.value,
          scope: memory.scope,
          conversationId: memory.conversationId,
          userId: memory.userId,
          projectId: memory.projectId
        }),
        timeout: this.config.timeout
      });

      if (!response.ok) {
        throw new MemoryError(
          `Memory API error: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json() as any;
      const storedMemory: ProjectMemory = {
        id: data.id,
        key: data.key,
        value: data.value,
        timestamp: new Date(data.timestamp),
        scope: data.scope,
        conversationId: data.conversationId,
        userId: data.userId,
        projectId: data.projectId
      };

      const latency = Date.now() - startTime;
      logger.info('Successfully stored memory', {
        memoryId: storedMemory.id,
        key: memory.key,
        scope: memory.scope,
        latency
      });

      return storedMemory;
    } catch (error) {
      const latency = Date.now() - startTime;
      logger.error('Failed to store memory', {
        key: memory.key,
        scope: memory.scope,
        error: error instanceof Error ? error.message : String(error),
        latency
      });

      if (error instanceof MemoryError) {
        throw error;
      }

      throw new MemoryError(
        `Failed to store memory: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  /**
   * Update existing memory item
   */
  async updateMemory(memoryId: string, updates: Partial<Pick<ProjectMemory, 'key' | 'value' | 'scope'>>): Promise<ProjectMemory> {
    const startTime = Date.now();
    
    try {
      logger.debug('Updating memory', { memoryId, updates });

      const response = await fetch(`${this.config.apiUrl}/memory/${memoryId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'chat-orchestrator/1.0.0'
        },
        body: JSON.stringify(updates),
        timeout: this.config.timeout
      });

      if (!response.ok) {
        throw new MemoryError(
          `Memory API error: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json() as any;
      const updatedMemory: ProjectMemory = {
        id: data.id,
        key: data.key,
        value: data.value,
        timestamp: new Date(data.timestamp),
        scope: data.scope,
        conversationId: data.conversationId,
        userId: data.userId,
        projectId: data.projectId
      };

      const latency = Date.now() - startTime;
      logger.info('Successfully updated memory', {
        memoryId,
        latency
      });

      return updatedMemory;
    } catch (error) {
      const latency = Date.now() - startTime;
      logger.error('Failed to update memory', {
        memoryId,
        error: error instanceof Error ? error.message : String(error),
        latency
      });

      if (error instanceof MemoryError) {
        throw error;
      }

      throw new MemoryError(
        `Failed to update memory: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  /**
   * Get recent memories for a user/project scope
   */
  async getRecentMemories(userContext: UserContext, limit: number = 50): Promise<ProjectMemory[]> {
    const startTime = Date.now();
    
    try {
      logger.debug('Fetching recent memories', {
        userId: userContext.userId,
        projectId: userContext.projectId,
        limit
      });

      const params = new URLSearchParams({
        userId: userContext.userId,
        ...(userContext.projectId && { projectId: userContext.projectId }),
        orderBy: 'timestamp',
        order: 'desc',
        limit: String(limit)
      });

      const response = await fetch(`${this.config.apiUrl}/memory/recent?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'chat-orchestrator/1.0.0'
        },
        timeout: this.config.timeout
      });

      if (!response.ok) {
        throw new MemoryError(
          `Memory API error: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json() as { memories: any[] };
      const memories = data.memories.map(item => ({
        id: item.id,
        key: item.key,
        value: item.value,
        timestamp: new Date(item.timestamp),
        scope: item.scope,
        conversationId: item.conversationId,
        userId: item.userId,
        projectId: item.projectId
      }));

      const latency = Date.now() - startTime;
      logger.info('Successfully fetched recent memories', {
        userId: userContext.userId,
        projectId: userContext.projectId,
        memoryCount: memories.length,
        latency
      });

      return memories;
    } catch (error) {
      const latency = Date.now() - startTime;
      logger.error('Failed to fetch recent memories', {
        userId: userContext.userId,
        projectId: userContext.projectId,
        error: error instanceof Error ? error.message : String(error),
        latency
      });

      if (error instanceof MemoryError) {
        throw error;
      }

      throw new MemoryError(
        `Failed to fetch recent memories: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  /**
   * Format memories into a context string for AI prompts
   */
  formatMemoriesForPrompt(memories: ProjectMemory[]): string {
    if (memories.length === 0) {
      return '';
    }

    const contextSections = {
      conversation: [] as ProjectMemory[],
      project: [] as ProjectMemory[],
      user: [] as ProjectMemory[]
    };

    // Group memories by scope
    memories.forEach(memory => {
      if (contextSections[memory.scope as keyof typeof contextSections]) {
        contextSections[memory.scope as keyof typeof contextSections].push(memory);
      }
    });

    let context = '\n\n--- CONVERSATION CONTEXT ---\n';

    if (contextSections.conversation.length > 0) {
      context += '\nCONVERSATION MEMORY:\n';
      contextSections.conversation.forEach(memory => {
        context += `- ${memory.key}: ${JSON.stringify(memory.value)}\n`;
      });
    }

    if (contextSections.project.length > 0) {
      context += '\nPROJECT MEMORY:\n';
      contextSections.project.forEach(memory => {
        context += `- ${memory.key}: ${JSON.stringify(memory.value)}\n`;
      });
    }

    if (contextSections.user.length > 0) {
      context += '\nUSER PREFERENCES:\n';
      contextSections.user.forEach(memory => {
        context += `- ${memory.key}: ${JSON.stringify(memory.value)}\n`;
      });
    }

    context += '--- END CONTEXT ---\n\n';
    
    return context;
  }
}
