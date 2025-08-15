import type { AIProviderPlugin, ProviderRegistry as IProviderRegistry } from '../../domain/ai/types/ProviderTypes';

/**
 * Registry for managing AI provider plugins
 */
export class ProviderRegistry implements IProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, AIProviderPlugin> = new Map();

  private constructor() {}

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  register(provider: AIProviderPlugin): void {
    if (this.providers.has(provider.name)) {
      console.warn(`Provider ${provider.name} is already registered. Overwriting...`);
    }
    
    console.log(`Registering AI provider: ${provider.name} v${provider.version}`);
    this.providers.set(provider.name, provider);
  }

  unregister(name: string): void {
    if (this.providers.has(name)) {
      console.log(`Unregistering AI provider: ${name}`);
      this.providers.delete(name);
    }
  }

  get(name: string): AIProviderPlugin | undefined {
    return this.providers.get(name);
  }

  list(): AIProviderPlugin[] {
    return Array.from(this.providers.values());
  }

  isRegistered(name: string): boolean {
    return this.providers.has(name);
  }

  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }

  clear(): void {
    console.log('Clearing all registered providers');
    this.providers.clear();
  }

  getProviderInfo(): Array<{ name: string; version: string; capabilities: any }> {
    return this.list().map(provider => ({
      name: provider.name,
      version: provider.version,
      capabilities: provider.capabilities
    }));
  }
}

// Export singleton instance
export const providerRegistry = ProviderRegistry.getInstance();