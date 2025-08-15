import type { AIProviderPlugin, ProviderType } from '../../domain/ai/types/ProviderTypes';
import { ProviderInitializationError } from '../../domain/ai/types/ProviderTypes';
import type { AIConfig, ProviderConfig } from '../../configuration/types';
import { providerRegistry } from './ProviderRegistry';

/**
 * Factory for creating and managing AI provider instances
 */
export class ProviderFactory {
  private static activeProviders: Map<string, AIProviderPlugin> = new Map();

  static async create(providerType: ProviderType, config: AIConfig): Promise<AIProviderPlugin> {
    // Check if provider is already active
    const existingProvider = this.activeProviders.get(providerType);
    if (existingProvider) {
      return existingProvider;
    }

    // Get provider class from registry
    const providerClass = providerRegistry.get(providerType);
    if (!providerClass) {
      throw new ProviderInitializationError(
        providerType,
        `Provider ${providerType} is not registered. Available providers: ${providerRegistry.getProviderNames().join(', ')}`
      );
    }

    try {
      // Extract provider-specific config
      const providerConfig = this.extractProviderConfig(providerType, config);
      
      // Validate configuration
      if (!providerClass.validateConfig(providerConfig)) {
        throw new ProviderInitializationError(
          providerType,
          'Invalid configuration provided'
        );
      }

      // Initialize provider
      await providerClass.initialize(providerConfig);
      
      // Cache active provider
      this.activeProviders.set(providerType, providerClass);
      
      console.log(`✅ AI Provider ${providerType} initialized successfully`);
      return providerClass;

    } catch (error) {
      console.error(`❌ Failed to initialize AI provider ${providerType}:`, error);
      throw new ProviderInitializationError(
        providerType,
        error instanceof Error ? error.message : 'Unknown error',
        error instanceof Error ? error : undefined
      );
    }
  }

  static async createFromString(providerName: string, config: AIConfig): Promise<AIProviderPlugin> {
    const providerType = this.validateProviderType(providerName);
    return this.create(providerType, config);
  }

  static getActiveProvider(providerType: ProviderType): AIProviderPlugin | undefined {
    return this.activeProviders.get(providerType);
  }

  static async shutdownProvider(providerType: ProviderType): Promise<void> {
    const provider = this.activeProviders.get(providerType);
    if (provider && provider.shutdown) {
      await provider.shutdown();
    }
    this.activeProviders.delete(providerType);
    console.log(`🔄 Provider ${providerType} shutdown`);
  }

  static async shutdownAll(): Promise<void> {
    const shutdownPromises = Array.from(this.activeProviders.entries()).map(
      ([type, provider]) => this.shutdownProvider(type as ProviderType)
    );
    await Promise.allSettled(shutdownPromises);
    this.activeProviders.clear();
    console.log('🔄 All providers shutdown');
  }

  static getActiveProviders(): Array<{ type: ProviderType; provider: AIProviderPlugin }> {
    return Array.from(this.activeProviders.entries()).map(([type, provider]) => ({
      type: type as ProviderType,
      provider
    }));
  }

  private static extractProviderConfig(providerType: ProviderType, config: AIConfig): ProviderConfig {
    switch (providerType) {
      case 'toolhouse':
        if (!config.toolhouse) {
          throw new Error('Toolhouse configuration is missing');
        }
        return config.toolhouse;

      case 'openrouter':
        if (!config.openrouter) {
          throw new Error('OpenRouter configuration is missing');
        }
        return config.openrouter;

      case 'openai':
        if (!config.openai) {
          throw new Error('OpenAI configuration is missing');
        }
        return config.openai;

      case 'anthropic':
        if (!config.anthropic) {
          throw new Error('Anthropic configuration is missing');
        }
        return config.anthropic;

      case 'gemini':
        if (!config.gemini) {
          throw new Error('Gemini configuration is missing');
        }
        return config.gemini;

      case 'custom':
        if (!config.custom) {
          throw new Error('Custom configuration is missing');
        }
        return config.custom;

      default:
        throw new Error(`Unknown provider type: ${providerType}`);
    }
  }

  private static validateProviderType(providerName: string): ProviderType {
    const validTypes: ProviderType[] = ['toolhouse', 'openrouter', 'openai', 'anthropic', 'gemini', 'custom'];
    
    if (!validTypes.includes(providerName as ProviderType)) {
      throw new Error(
        `Invalid provider type: ${providerName}. Valid types: ${validTypes.join(', ')}`
      );
    }

    return providerName as ProviderType;
  }

  static getSupportedProviders(): ProviderType[] {
    return ['toolhouse', 'openrouter', 'openai', 'anthropic', 'gemini', 'custom'];
  }

  static isProviderSupported(providerType: string): boolean {
    return this.getSupportedProviders().includes(providerType as ProviderType);
  }
}