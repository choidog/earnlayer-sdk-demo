import type { AppConfig, AIProviderType } from './types';

export class ConfigValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

export class ConfigValidator {
  static validate(config: AppConfig): void {
    this.validateEnvironment(config);
    this.validateAIConfig(config);
    this.validateAdvertisingConfig(config);
    this.validateConversationConfig(config);
    this.validateApiConfig(config);
  }

  private static validateEnvironment(config: AppConfig): void {
    if (!config.environment) {
      throw new ConfigValidationError('Environment is required', 'environment');
    }

    if (!['development', 'production'].includes(config.environment)) {
      throw new ConfigValidationError(
        'Environment must be "development" or "production"',
        'environment'
      );
    }
  }

  private static validateAIConfig(config: AppConfig): void {
    if (!config.ai) {
      throw new ConfigValidationError('AI configuration is required', 'ai');
    }

    if (!config.ai.provider) {
      throw new ConfigValidationError('AI provider is required', 'ai.provider');
    }

    const validProviders: AIProviderType[] = [
      'toolhouse', 'openrouter', 'openai', 'anthropic', 'gemini', 'custom'
    ];

    if (!validProviders.includes(config.ai.provider)) {
      throw new ConfigValidationError(
        `AI provider must be one of: ${validProviders.join(', ')}`,
        'ai.provider'
      );
    }

    // Validate provider-specific configuration
    switch (config.ai.provider) {
      case 'toolhouse':
        if (!config.ai.toolhouse?.baseUrl) {
          throw new ConfigValidationError(
            'Toolhouse baseUrl is required',
            'ai.toolhouse.baseUrl'
          );
        }
        break;

      case 'openrouter':
        if (!config.ai.openrouter?.apiKey) {
          throw new ConfigValidationError(
            'OpenRouter API key is required',
            'ai.openrouter.apiKey'
          );
        }
        if (!config.ai.openrouter?.model) {
          throw new ConfigValidationError(
            'OpenRouter model is required',
            'ai.openrouter.model'
          );
        }
        break;

      case 'openai':
        if (!config.ai.openai?.apiKey) {
          throw new ConfigValidationError(
            'OpenAI API key is required',
            'ai.openai.apiKey'
          );
        }
        if (!config.ai.openai?.model) {
          throw new ConfigValidationError(
            'OpenAI model is required',
            'ai.openai.model'
          );
        }
        break;

      case 'anthropic':
        if (!config.ai.anthropic?.apiKey) {
          throw new ConfigValidationError(
            'Anthropic API key is required',
            'ai.anthropic.apiKey'
          );
        }
        if (!config.ai.anthropic?.model) {
          throw new ConfigValidationError(
            'Anthropic model is required',
            'ai.anthropic.model'
          );
        }
        break;

      case 'gemini':
        if (!config.ai.gemini?.apiKey) {
          throw new ConfigValidationError(
            'Gemini API key is required',
            'ai.gemini.apiKey'
          );
        }
        if (!config.ai.gemini?.model) {
          throw new ConfigValidationError(
            'Gemini model is required',
            'ai.gemini.model'
          );
        }
        break;

      case 'custom':
        if (!config.ai.custom?.endpoint) {
          throw new ConfigValidationError(
            'Custom endpoint is required',
            'ai.custom.endpoint'
          );
        }
        break;
    }
  }

  private static validateAdvertisingConfig(config: AppConfig): void {
    if (!config.advertising) {
      throw new ConfigValidationError('Advertising configuration is required', 'advertising');
    }

    const required = ['mcpUrl', 'baseUrl', 'apiKey', 'creatorId'];
    for (const field of required) {
      if (!config.advertising[field as keyof typeof config.advertising]) {
        throw new ConfigValidationError(
          `Advertising ${field} is required`,
          `advertising.${field}`
        );
      }
    }

    if (!Array.isArray(config.advertising.defaultAdTypes)) {
      throw new ConfigValidationError(
        'Advertising defaultAdTypes must be an array',
        'advertising.defaultAdTypes'
      );
    }
  }

  private static validateConversationConfig(config: AppConfig): void {
    if (!config.conversation) {
      throw new ConfigValidationError('Conversation configuration is required', 'conversation');
    }

    const required = ['creatorId', 'baseUrl'];
    for (const field of required) {
      if (!config.conversation[field as keyof typeof config.conversation]) {
        throw new ConfigValidationError(
          `Conversation ${field} is required`,
          `conversation.${field}`
        );
      }
    }

    if (typeof config.conversation.autoInitialize !== 'boolean') {
      throw new ConfigValidationError(
        'Conversation autoInitialize must be a boolean',
        'conversation.autoInitialize'
      );
    }
  }

  private static validateApiConfig(config: AppConfig): void {
    if (!config.api) {
      throw new ConfigValidationError('API configuration is required', 'api');
    }

    if (typeof config.api.timeout !== 'number' || config.api.timeout <= 0) {
      throw new ConfigValidationError(
        'API timeout must be a positive number',
        'api.timeout'
      );
    }

    if (typeof config.api.retryAttempts !== 'number' || config.api.retryAttempts < 0) {
      throw new ConfigValidationError(
        'API retryAttempts must be a non-negative number',
        'api.retryAttempts'
      );
    }

    if (typeof config.api.retryDelay !== 'number' || config.api.retryDelay < 0) {
      throw new ConfigValidationError(
        'API retryDelay must be a non-negative number',
        'api.retryDelay'
      );
    }
  }
}