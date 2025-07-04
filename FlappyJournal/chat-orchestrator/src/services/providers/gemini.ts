import { BaseProvider } from './base.js';
import { ChatMessage, ProviderResponse, UserContext, ProviderError } from '../../types/index.js';
import logger from '../../utils/logger.js';

export class GeminiProvider extends BaseProvider {
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
      logger.debug(`Gemini generate request`, {
        model: this.config.model,
        messageCount: messages.length,
        userId: userContext.userId
      });

      const response = await fetch(`${this.config.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: this.formatMessages(messages),
          temperature: userContext.preferences?.temperature || 0.7
        })
      });

      if (!response.ok) {
        throw new ProviderError(
          `Gemini API error: ${response.status} ${response.statusText}`,
          'gemini',
          response.status
        );
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const latency = Date.now() - startTime;

      logger.info(`Gemini generate success`, {
        model: this.config.model,
        tokens: data.usage,
        latency,
        userId: userContext.userId
      });

      return {
        success: true,
        content,
        provider: 'gemini',
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
      logger.error(`Gemini generate error`, {
        model: this.config.model,
        error: error instanceof Error ? error.message : String(error),
        latency,
        userId: userContext.userId
      });

      throw new ProviderError(
        `Gemini API error: ${error instanceof Error ? error.message : String(error)}`,
        'gemini',
        500
      );
    }
  }

  async *stream(messages: ChatMessage[], userContext: UserContext): Promise<AsyncIterable<string>> {
    // Placeholder for streaming implementation
    const response = await this.generate(messages, userContext);
    if (response.content) {
      yield response.content;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      logger.error(`Gemini health check failed`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
}
