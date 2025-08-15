/**
 * AI Provider registration and initialization
 */

import { providerRegistry } from '../ProviderRegistry';
import { ToolhouseProvider } from './ToolhouseProvider';
import { OpenRouterProvider } from './OpenRouterProvider';

/**
 * Register all available AI providers
 */
export function registerAIProviders(): void {
  console.log('🔄 Registering AI providers...');
  
  // Register Toolhouse provider
  const toolhouseProvider = new ToolhouseProvider();
  providerRegistry.register(toolhouseProvider);
  
  // Register OpenRouter provider
  const openRouterProvider = new OpenRouterProvider();
  providerRegistry.register(openRouterProvider);
  
  console.log(`✅ Registered ${providerRegistry.list().length} AI providers`);
  console.log('Available providers:', providerRegistry.getProviderNames());
}

/**
 * Auto-register providers when this module is imported
 */
registerAIProviders();

// Re-export providers for direct use if needed
export { ToolhouseProvider } from './ToolhouseProvider';
export { OpenRouterProvider } from './OpenRouterProvider';
export { providerRegistry } from '../ProviderRegistry';
export { ProviderFactory } from '../ProviderFactory';