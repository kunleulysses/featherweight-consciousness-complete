import OpenAI from 'openai';
import { BaseProvider } from './base.js';
import { ChatMessage, ProviderResponse, UserContext, ProviderError } from '../../types/index.js';
import logger from '../../utils/logger.js';

export class OpenAIProvider extends BaseProvider {
  private client: OpenAI;

  constructor(config: any) {
    super(config);
    this.validateConfig();
    
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout || 30000,
      maxRetries: this.config.maxRetries || 3,
    });
  }

  protected formatMessages(messages: ChatMessage[]): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    }));
  }

  async generate(messages: ChatMessage[], userContext: UserContext): Promise<ProviderResponse> {
    const startTime = Date.now();
    
    try {
      logger.debug(`OpenAI generate request`, {
        model: this.config.model,
        messageCount: messages.length,
        userId: userContext.userId
      });

      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: this.formatMessages(messages),
        temperature: userContext.preferences?.temperature || 0.7,
        max_tokens: userContext.preferences?.maxTokens || 1000,
        stream: false
      });

      const content = completion.choices[0]?.message?.content || '';
      const latency = Date.now() - startTime;

      logger.info(`OpenAI generate success`, {
        model: this.config.model,
        tokens: completion.usage,
        latency,
        userId: userContext.userId
      });

      return {
        success: true,
        content,
        provider: 'openai',
        model: this.config.model,
        tokens: completion.usage ? {
          prompt: completion.usage.prompt_tokens,
          completion: completion.usage.completion_tokens,
          total: completion.usage.total_tokens
        } : undefined,
        latency
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      logger.error(`OpenAI generate error`, {
        model: this.config.model,
        error: error instanceof Error ? error.message : String(error),
        latency,
        userId: userContext.userId
      });

      throw new ProviderError(
        `OpenAI API error: ${error instanceof Error ? error.message : String(error)}`,
        'openai',
        error instanceof OpenAI.APIError ? error.status || 500 : 500
      );
    }
  }

  async *stream(messages: ChatMessage[], userContext: UserContext): Promise<AsyncIterable<string>> {
    try {
      logger.debug(`OpenAI stream request`, {
        model: this.config.model,
        messageCount: messages.length,
        userId: userContext.userId
      });

      const stream = await this.client.chat.completions.create({
        model: this.config.model,
        messages: this.formatMessages(messages),
        temperature: userContext.preferences?.temperature || 0.7,
        max_tokens: userContext.preferences?.maxTokens || 1000,
        stream: true
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }

      logger.info(`OpenAI stream completed`, {
        model: this.config.model,
        userId: userContext.userId
      });
    } catch (error) {
      logger.error(`OpenAI stream error`, {
        model: this.config.model,
        error: error instanceof Error ? error.message : String(error),
        userId: userContext.userId
      });

      throw new ProviderError(
        `OpenAI streaming error: ${error instanceof Error ? error.message : String(error)}`,
        'openai',
        error instanceof OpenAI.APIError ? error.status || 500 : 500
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.models.list();
      return !!response.data;
    } catch (error) {
      logger.error(`OpenAI health check failed`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
}
