/**
 * Core configuration types for the EarnLayer SDK Demo
 */

export type Environment = 'development' | 'production';

export type AIProviderType = 
  | 'toolhouse' 
  | 'openrouter' 
  | 'openai' 
  | 'anthropic' 
  | 'gemini'
  | 'custom';

export interface ToolhouseConfig {
  baseUrl: string;
  agentId?: string;
  apiKey?: string;
  agentUrl?: string;
}

export interface OpenRouterConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  temperature?: number;
  maxTokens?: number;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AnthropicConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface CustomConfig {
  endpoint: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

export interface AIConfig {
  provider: AIProviderType;
  toolhouse?: ToolhouseConfig;
  openrouter?: OpenRouterConfig;
  openai?: OpenAIConfig;
  anthropic?: AnthropicConfig;
  gemini?: GeminiConfig;
  custom?: CustomConfig;
}

export interface AdvertisingConfig {
  mcpUrl: string;
  baseUrl: string;
  apiKey: string;
  creatorId: string;
  defaultAdTypes: string[];
  autoRequestDisplayAds: boolean;
}

export interface ConversationConfig {
  autoInitialize: boolean;
  creatorId: string;
  baseUrl: string;
  initialConfig: {
    ad_preferences: {
      ad_types: string[];
      frequency: string;
      revenue_vs_relevance: number;
    };
  };
}

export interface ApiConfig {
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface AppConfig {
  environment: Environment;
  ai: AIConfig;
  advertising: AdvertisingConfig;
  conversation: ConversationConfig;
  api: ApiConfig;
}

export interface ProviderConfig {
  [key: string]: any;
}