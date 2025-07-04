import fetch from 'node-fetch';
import { BaseProvider } from './base.js';
import { ChatMessage, ProviderResponse, UserContext, ProviderError } from '../../types/index.js';
import logger from '../../utils/logger.js';

export class VeniceProvider extends BaseProvider {
  constructor(config: any) {
    super(config);
    this.validateConfig();
  }

  protected formatMessages(messages: ChatMessage[]): any[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  async generate(messages: ChatMessage[], userContext: UserContext): Promise<ProviderResponse> {
    const startTime = Date.now();

    try {
      logger.debug(`Venice generate request`, {
        model: this.config.model,
        messageCount: messages.length,
        userId: userContext.userId
      });

      const response = await fetch(`${this.config.baseUrl || 'https://api.venice.ai'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'chat-orchestrator/1.0.0'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: this.formatMessages(messages),
          temperature: userContext.preferences?.temperature || 0.7,
          max_tokens: userContext.preferences?.maxTokens || 1000,
          stream: false
        }),
        timeout: this.config.timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ProviderError(
          `Venice API error: ${response.status} ${response.statusText} - ${errorText}`,
          'venice',
          response.status
        );
      }

      const data = await response.json() as any;
      const content = data.choices?.[0]?.message?.content || '';
      const latency = Date.now() - startTime;

      logger.info(`Venice generate success`, {
        model: this.config.model,
        tokens: data.usage,
        latency,
        userId: userContext.userId
      });

      return {
        success: true,
        content,
        provider: 'venice',
        model: this.config.model,
        tokens: data.usage ? {
          prompt: data.usage.prompt_tokens,
          completion: data.usage.completion_tokens,
          total: data.usage.total_tokens
        } : undefined,
        latency
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      logger.error(`Venice generate error`, {
        model: this.config.model,
        error: error instanceof Error ? error.message : String(error),
        latency,
        userId: userContext.userId
      });

      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError(
        `Venice API error: ${error instanceof Error ? error.message : String(error)}`,
        'venice',
        500
      );
    }
  }

  async *stream(messages: ChatMessage[], userContext: UserContext): Promise<AsyncIterable<string>> {
    try {
      logger.debug(`Venice stream request`, {
        model: this.config.model,
        messageCount: messages.length,
        userId: userContext.userId
      });

      const response = await fetch(`${this.config.baseUrl || 'https://api.venice.ai'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'chat-orchestrator/1.0.0'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: this.formatMessages(messages),
          temperature: userContext.preferences?.temperature || 0.7,
          max_tokens: userContext.preferences?.maxTokens || 1000,
          stream: true
        }),
        timeout: this.config.timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ProviderError(
          `Venice streaming error: ${response.status} ${response.statusText} - ${errorText}`,
          'venice',
          response.status
        );
      }

      if (!response.body) {
        throw new ProviderError('No response body received from Venice API', 'venice', 500);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  yield content;
                }
              } catch (parseError) {
                logger.warn('Failed to parse Venice stream chunk', { chunk: data });
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      logger.info(`Venice stream completed`, {
        model: this.config.model,
        userId: userContext.userId
      });
    } catch (error) {
      logger.error(`Venice stream error`, {
        model: this.config.model,
        error: error instanceof Error ? error.message : String(error),
        userId: userContext.userId
      });

      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError(
        `Venice streaming error: ${error instanceof Error ? error.message : String(error)}`,
        'venice',
        500
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl || 'https://api.venice.ai'}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': 'chat-orchestrator/1.0.0'
        },
        timeout: this.config.timeout
      });

      return response.ok;
    } catch (error) {
      logger.error(`Venice health check failed`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
}
