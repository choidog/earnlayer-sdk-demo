import type { AppConfig, AIConfig, AdvertisingConfig, ConversationConfig, ApiConfig, AIProviderType } from './types';
import { ConfigValidator } from './ConfigValidator';
import { EarnLayerAdType } from '@earnlayer/chat-ads';

export class ConfigFactory {
  static createFromEnvironment(): AppConfig {
    const config = {
      environment: this.getEnvironment(),
      ai: this.createAIConfig(),
      advertising: this.createAdvertisingConfig(),
      conversation: this.createConversationConfig(),
      api: this.createApiConfig()
    };

    // Validate the configuration
    ConfigValidator.validate(config);
    
    return config;
  }

  private static getEnvironment() {
    const env = import.meta.env.VITE_ENV || import.meta.env.MODE || 'development';
    return env as 'development' | 'production';
  }

  private static createAIConfig(): AIConfig {
    const provider = (import.meta.env.VITE_AI_PROVIDER || 'toolhouse') as AIProviderType;
    
    const baseConfig: AIConfig = { provider };

    switch (provider) {
      case 'toolhouse':
        baseConfig.toolhouse = {
          baseUrl: import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:8001',
          agentId: import.meta.env.VITE_TOOLHOUSE_AGENT_ID,
          apiKey: import.meta.env.VITE_TOOLHOUSE_API_KEY,
          agentUrl: import.meta.env.VITE_TOOLHOUSE_AGENT_URL || 'https://agents.toolhouse.ai/default'
        };
        break;

      case 'openrouter':
        baseConfig.openrouter = {
          apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
          model: import.meta.env.VITE_OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
          baseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
          temperature: parseFloat(import.meta.env.VITE_OPENROUTER_TEMPERATURE || '0.7'),
          maxTokens: parseInt(import.meta.env.VITE_OPENROUTER_MAX_TOKENS || '1000')
        };
        break;

      case 'openai':
        baseConfig.openai = {
          apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
          model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4',
          baseUrl: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
          temperature: parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE || '0.7'),
          maxTokens: parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS || '1000')
        };
        break;

      case 'anthropic':
        baseConfig.anthropic = {
          apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
          model: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3.5-sonnet-20241022',
          baseUrl: import.meta.env.VITE_ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
          temperature: parseFloat(import.meta.env.VITE_ANTHROPIC_TEMPERATURE || '0.7'),
          maxTokens: parseInt(import.meta.env.VITE_ANTHROPIC_MAX_TOKENS || '1000')
        };
        break;

      case 'gemini':
        baseConfig.gemini = {
          apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
          model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-pro',
          temperature: parseFloat(import.meta.env.VITE_GEMINI_TEMPERATURE || '0.7'),
          maxTokens: parseInt(import.meta.env.VITE_GEMINI_MAX_TOKENS || '1000')
        };
        break;

      case 'custom':
        baseConfig.custom = {
          endpoint: import.meta.env.VITE_CUSTOM_AI_ENDPOINT || '',
          apiKey: import.meta.env.VITE_CUSTOM_AI_API_KEY,
          headers: this.parseHeaders(import.meta.env.VITE_CUSTOM_AI_HEADERS)
        };
        break;
    }

    return baseConfig;
  }

  private static createAdvertisingConfig(): AdvertisingConfig {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    
    return {
      mcpUrl: `${baseUrl}/api/mcp/query`,
      baseUrl,
      apiKey: import.meta.env.VITE_API_KEY || 'demo-api-key',
      creatorId: import.meta.env.VITE_CREATOR_ID || 'd64a4899-20e4-4ecd-a53e-057aceed54cf',
      defaultAdTypes: this.parseAdTypes(import.meta.env.VITE_DEFAULT_AD_TYPES),
      autoRequestDisplayAds: this.parseBoolean(import.meta.env.VITE_AUTO_REQUEST_DISPLAY_ADS, true)
    };
  }

  private static createConversationConfig(): ConversationConfig {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    const creatorId = import.meta.env.VITE_CREATOR_ID || 'd64a4899-20e4-4ecd-a53e-057aceed54cf';
    
    return {
      autoInitialize: this.parseBoolean(import.meta.env.VITE_AUTO_INITIALIZE_CONVERSATION, true),
      creatorId,
      baseUrl,
      initialConfig: {
        ad_preferences: {
          ad_types: this.parseAdTypes(import.meta.env.VITE_CONVERSATION_AD_TYPES) || [
            EarnLayerAdType.HYPERLINK, 
            EarnLayerAdType.POPUP, 
            EarnLayerAdType.BANNER
          ],
          frequency: import.meta.env.VITE_AD_FREQUENCY || 'normal',
          revenue_vs_relevance: parseFloat(import.meta.env.VITE_REVENUE_VS_RELEVANCE || '0.5')
        }
      }
    };
  }

  private static createApiConfig(): ApiConfig {
    return {
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
      retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000')
    };
  }

  private static parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  private static parseAdTypes(value: string | undefined): string[] {
    if (!value) {
      return [
        EarnLayerAdType.HYPERLINK,
        EarnLayerAdType.POPUP,
        EarnLayerAdType.BANNER,
        EarnLayerAdType.VIDEO,
        EarnLayerAdType.THINKING
      ];
    }
    
    try {
      return JSON.parse(value);
    } catch {
      return value.split(',').map(type => type.trim());
    }
  }

  private static parseHeaders(value: string | undefined): Record<string, string> | undefined {
    if (!value) return undefined;
    
    try {
      return JSON.parse(value);
    } catch {
      console.warn('Failed to parse custom AI headers, ignoring');
      return undefined;
    }
  }

  static createDevelopmentConfig(): AppConfig {
    return {
      environment: 'development',
      ai: {
        provider: 'toolhouse',
        toolhouse: {
          baseUrl: 'http://localhost:8001',
          agentId: 'test-agent-id'
        }
      },
      advertising: {
        mcpUrl: 'http://localhost:8000/api/mcp/query',
        baseUrl: 'http://localhost:8000',
        apiKey: 'demo-api-key',
        creatorId: 'd64a4899-20e4-4ecd-a53e-057aceed54cf',
        defaultAdTypes: [EarnLayerAdType.HYPERLINK, EarnLayerAdType.POPUP],
        autoRequestDisplayAds: true
      },
      conversation: {
        autoInitialize: true,
        creatorId: 'd64a4899-20e4-4ecd-a53e-057aceed54cf',
        baseUrl: 'http://localhost:8000',
        initialConfig: {
          ad_preferences: {
            ad_types: [EarnLayerAdType.HYPERLINK, EarnLayerAdType.POPUP],
            frequency: 'normal',
            revenue_vs_relevance: 0.5
          }
        }
      },
      api: {
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    };
  }

  static createProductionConfig(): AppConfig {
    return {
      environment: 'production',
      ai: {
        provider: 'toolhouse',
        toolhouse: {
          baseUrl: 'https://backend-production-1774.up.railway.app',
        }
      },
      advertising: {
        mcpUrl: 'https://backend-production-1774.up.railway.app/api/mcp/query',
        baseUrl: 'https://backend-production-1774.up.railway.app',
        apiKey: 'production-api-key',
        creatorId: 'd64a4899-20e4-4ecd-a53e-057aceed54cf',
        defaultAdTypes: [
          EarnLayerAdType.HYPERLINK,
          EarnLayerAdType.POPUP,
          EarnLayerAdType.BANNER,
          EarnLayerAdType.VIDEO
        ],
        autoRequestDisplayAds: true
      },
      conversation: {
        autoInitialize: true,
        creatorId: 'd64a4899-20e4-4ecd-a53e-057aceed54cf',
        baseUrl: 'https://backend-production-1774.up.railway.app',
        initialConfig: {
          ad_preferences: {
            ad_types: [
              EarnLayerAdType.HYPERLINK,
              EarnLayerAdType.POPUP,
              EarnLayerAdType.BANNER,
              EarnLayerAdType.VIDEO
            ],
            frequency: 'normal',
            revenue_vs_relevance: 0.5
          }
        }
      },
      api: {
        timeout: 60000,
        retryAttempts: 5,
        retryDelay: 2000
      }
    };
  }
}