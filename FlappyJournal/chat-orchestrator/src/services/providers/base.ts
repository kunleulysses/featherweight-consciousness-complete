import { ChatMessage, ProviderConfig, ProviderResponse, UserContext } from '../../types/index.js';

export abstract class BaseProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  /**
   * Generate a complete response (non-streaming)
   */
  abstract generate(messages: ChatMessage[], userContext: UserContext): Promise<ProviderResponse>;

  /**
   * Generate a streaming response
   */
  abstract stream(messages: ChatMessage[], userContext: UserContext): Promise<AsyncIterable<string>>;

  /**
   * Check if provider is healthy
   */
  abstract healthCheck(): Promise<boolean>;

  /**
   * Format messages for the specific provider
   */
  protected abstract formatMessages(messages: ChatMessage[]): any[];

  /**
   * Get provider-specific configuration
   */
  getConfig(): ProviderConfig {
    return this.config;
  }

  /**
   * Validate provider configuration
   */
  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error(`API key required for ${this.config.name} provider`);
    }
    if (!this.config.model) {
      throw new Error(`Model required for ${this.config.name} provider`);
    }
  }
}
