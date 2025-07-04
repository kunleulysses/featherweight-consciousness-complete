import { v4 as uuidv4 } from 'uuid';
import { 
  Provider, 
  ProviderConfig, 
  MultiProviderConfig, 
  UserContext, 
  ChatMessage, 
  ProviderError, 
  ProviderResponse 
} from '../types/index.js';
import logger from '../utils/logger.js';
import { OpenAIProvider } from './providers/openai.js';
import { GeminiProvider } from './providers/gemini.js';
import { VeniceProvider } from './providers/venice.js';
import { BaseProvider } from './providers/base.js';

export class ProviderRouter {
  private config: MultiProviderConfig;
  private providers: Map<Provider, BaseProvider> = new Map();
  private sortedProviders: ProviderConfig[];

  constructor(config: MultiProviderConfig) {
    this.config = config;
    
    // Initialize providers based on config
    this.config.providers.forEach(providerConfig => {
      if (providerConfig.enabled) {
        switch (providerConfig.name) {
          case 'openai':
            this.providers.set('openai', new OpenAIProvider(providerConfig));
            break;
          case 'gemini':
            this.providers.set('gemini', new GeminiProvider(providerConfig));
            break;
          case 'venice':
            this.providers.set('venice', new VeniceProvider(providerConfig));
            break;
          default:
            logger.warn(`Unknown provider specified in config: ${providerConfig.name}`);
        }
      }
    });
    
    // Sort providers by priority for sequential fallback
    this.sortedProviders = this.config.providers.filter(p => p.enabled).sort((a, b) => a.priority - b.priority);
    
    if (this.sortedProviders.length === 0) {
      throw new Error('No enabled providers found in configuration.');
    }
  }

  /**
   * Get a specific provider instance
   */
  getProvider(name: Provider): BaseProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get the list of available providers
   */
  getAvailableProviders(): Provider[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Stream response from the appropriate provider
   */
  async stream(
    messages: ChatMessage[],
    userContext: UserContext,
    onStreamEvent: (event: any) => void
  ): Promise<ProviderResponse> {
    const providerName = userContext.preferences?.provider || this.sortedProviders[0].name;
    const provider = this.getProvider(providerName);

    if (!provider) {
      throw new ProviderError(`Provider not found or not enabled: ${providerName}`, providerName, 404);
    }

    const startTime = Date.now();
    try {
      logger.info(`Streaming response from ${providerName}`)
      const stream = await provider.stream(messages, userContext);
      
      let content = '';
      for await (const chunk of stream) {
        content += chunk;
        onStreamEvent({
          type: 'token',
          data: chunk,
          messageId: messages[messages.length - 1].id
        });
      }
      
      const latency = Date.now() - startTime;
      return {
        success: true,
        content,
        provider: providerName,
        model: provider.config.model,
        latency
      };

    } catch (error) {
      const latency = Date.now() - startTime;
      logger.error(`Error streaming from ${providerName}`, {
        error: error instanceof Error ? error.message : String(error),
        latency
      });

      if (error instanceof ProviderError) {
        throw error;
      }
      throw new ProviderError(
        `Failed to stream from ${providerName}: ${error instanceof Error ? error.message : String(error)}`,
        providerName,
        500
      );
    }
  }
  
  /**
   * Route a request to the appropriate provider based on the configured strategy
   */
  async route(
    messages: ChatMessage[],
    userContext: UserContext
  ): Promise<ProviderResponse> {
    const startTime = Date.now();
    let lastError: ProviderError | null = null;
    
    // User specified provider
    if (userContext.preferences?.provider) {
      const provider = this.getProvider(userContext.preferences.provider);
      if (provider) {
        try {
          const response = await provider.generate(messages, userContext);
          return { ...response, latency: Date.now() - startTime };
        } catch (error) {
          logger.warn(`User-preferred provider ${provider.config.name} failed. Attempting fallback.`, {
            error: error instanceof Error ? error.message : String(error),
          });
          lastError = error as ProviderError;
        }
      } else {
        logger.warn(`User-preferred provider ${userContext.preferences.provider} not available. Attempting fallback.`);
      }
    }

    // Fallback strategy
    switch (this.config.fallbackStrategy) {
      case 'sequential':
        for (const providerConfig of this.sortedProviders) {
          const provider = this.getProvider(providerConfig.name);
          if (provider) {
            try {
              const response = await provider.generate(messages, userContext);
              return { ...response, latency: Date.now() - startTime };
            } catch (error) {
              logger.error(`Provider ${provider.config.name} failed in sequential fallback`, {
                error: error instanceof Error ? error.message : String(error)
              });
              lastError = error as ProviderError;
            }
          }
        }
        break;
      case 'parallel':
        // not implemented for non-streaming
        throw new Error('Parallel routing not implemented yet for non-streaming responses.');
      case 'load_balance':
        // not implemented
        throw new Error('Load balancing not implemented yet.');
      default:
        throw new Error(`Unknown fallback strategy: ${this.config.fallbackStrategy}`);
    }

    throw new ProviderError(
      `All providers failed. Last error: ${lastError?.message}`,
      lastError?.provider || this.sortedProviders[0].name,
      lastError?.statusCode || 500
    );
  }
}
