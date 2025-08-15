import type { AIMessage, AIResponse, AIStreamEvent } from './AITypes';
import type { ProviderConfig } from '../../../configuration/types';

/**
 * AI Provider plugin interface and types
 */

export interface AIProviderPlugin {
  readonly name: string;
  readonly version: string;
  readonly capabilities: ProviderCapabilities;

  initialize(config: ProviderConfig): Promise<void>;
  sendMessage(message: AIMessage): Promise<AIResponse>;
  streamMessage?(message: AIMessage): AsyncGenerator<AIStreamEvent>;
  shutdown?(): Promise<void>;
  
  // Health check
  isHealthy(): Promise<boolean>;
  
  // Configuration validation
  validateConfig(config: ProviderConfig): boolean;
}

export interface ProviderCapabilities {
  streaming: boolean;
  multimodal: boolean;
  functionCalling: boolean;
  contextRetention: boolean;
  maxTokens?: number;
  supportedModalities?: ('text' | 'image' | 'audio' | 'video')[];
}

export interface ProviderMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastRequestTime?: Date;
  lastErrorTime?: Date;
}

export interface ProviderStatus {
  isHealthy: boolean;
  isInitialized: boolean;
  lastHealthCheck: Date;
  error?: string;
  metrics: ProviderMetrics;
}

export abstract class BaseAIProvider implements AIProviderPlugin {
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly capabilities: ProviderCapabilities;

  protected config?: ProviderConfig;
  protected metrics: ProviderMetrics = {
    requestCount: 0,
    errorCount: 0,
    averageResponseTime: 0
  };

  abstract initialize(config: ProviderConfig): Promise<void>;
  abstract sendMessage(message: AIMessage): Promise<AIResponse>;
  
  async isHealthy(): Promise<boolean> {
    try {
      // Default health check - can be overridden
      return this.config !== undefined;
    } catch {
      return false;
    }
  }

  validateConfig(config: ProviderConfig): boolean {
    // Default validation - should be overridden by providers
    return config !== null && config !== undefined;
  }

  async shutdown(): Promise<void> {
    // Default shutdown - can be overridden
    this.config = undefined;
  }

  getStatus(): ProviderStatus {
    return {
      isHealthy: this.config !== undefined,
      isInitialized: this.config !== undefined,
      lastHealthCheck: new Date(),
      metrics: { ...this.metrics }
    };
  }

  protected updateMetrics(responseTime: number, isError: boolean = false): void {
    this.metrics.requestCount++;
    this.metrics.lastRequestTime = new Date();
    
    if (isError) {
      this.metrics.errorCount++;
      this.metrics.lastErrorTime = new Date();
    } else {
      // Update average response time
      const totalTime = this.metrics.averageResponseTime * (this.metrics.requestCount - 1);
      this.metrics.averageResponseTime = (totalTime + responseTime) / this.metrics.requestCount;
    }
  }

  protected handleError(error: Error, context?: string): never {
    this.updateMetrics(0, true);
    console.error(`[${this.name}] Error${context ? ` in ${context}` : ''}:`, error);
    throw error;
  }

  protected validateMessage(message: AIMessage): void {
    if (!message) {
      throw new Error('Message is required');
    }
    if (!message.content || message.content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }
    if (!['user', 'assistant', 'system'].includes(message.role)) {
      throw new Error('Message role must be user, assistant, or system');
    }
  }
}

export type ProviderType = 'toolhouse' | 'openrouter' | 'openai' | 'anthropic' | 'gemini' | 'custom';

export interface ProviderRegistry {
  register(provider: AIProviderPlugin): void;
  unregister(name: string): void;
  get(name: string): AIProviderPlugin | undefined;
  list(): AIProviderPlugin[];
  isRegistered(name: string): boolean;
}

export class ProviderError extends Error {
  public readonly provider: string;
  public readonly code?: string;
  public readonly cause?: Error;

  constructor(
    message: string,
    provider: string,
    code?: string,
    cause?: Error
  ) {
    super(message);
    this.name = 'ProviderError';
    this.provider = provider;
    this.code = code;
    this.cause = cause;
  }
}

export class ProviderInitializationError extends ProviderError {
  constructor(provider: string, message: string, cause?: Error) {
    super(`Failed to initialize provider ${provider}: ${message}`, provider, 'INIT_ERROR', cause);
    this.name = 'ProviderInitializationError';
  }
}

export class ProviderRequestError extends ProviderError {
  constructor(provider: string, message: string, cause?: Error) {
    super(`Provider ${provider} request failed: ${message}`, provider, 'REQUEST_ERROR', cause);
    this.name = 'ProviderRequestError';
  }
}

export class ProviderConfigurationError extends ProviderError {
  constructor(provider: string, message: string) {
    super(`Provider ${provider} configuration error: ${message}`, provider, 'CONFIG_ERROR');
    this.name = 'ProviderConfigurationError';
  }
}