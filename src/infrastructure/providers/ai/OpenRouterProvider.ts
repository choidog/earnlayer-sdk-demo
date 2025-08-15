import { BaseAIProvider, ProviderInitializationError, ProviderRequestError } from '../../../domain/ai/types/ProviderTypes';
import type { ProviderCapabilities, AIMessage, AIResponse } from '../../../domain/ai/types/AITypes';
import { AIResponseEntity } from '../../../domain/ai/types/AITypes';
import type { OpenRouterConfig } from '../../../configuration/types';

/**
 * OpenRouter AI Provider implementation
 * Provides access to multiple AI models through OpenRouter's unified API
 */
export class OpenRouterProvider extends BaseAIProvider {
  readonly name = 'openrouter';
  readonly version = '1.0.0';
  readonly capabilities: ProviderCapabilities = {
    streaming: false, // Can be enabled in future versions
    multimodal: true, // Depends on selected model
    functionCalling: false, // Not implemented yet
    contextRetention: true,
    maxTokens: 100000, // Varies by model
    supportedModalities: ['text', 'image'] // Depends on model
  };

  private openRouterConfig?: OpenRouterConfig;
  private conversationHistory: AIMessage[] = [];

  async initialize(config: OpenRouterConfig): Promise<void> {
    try {
      console.log('🔄 Initializing OpenRouter provider...');
      
      if (!this.validateConfig(config)) {
        throw new ProviderInitializationError(
          this.name,
          'Invalid OpenRouter configuration'
        );
      }

      this.openRouterConfig = config;
      this.config = config;

      // Test connection with a simple request
      await this.testConnection();

      console.log(`✅ OpenRouter provider initialized successfully with model: ${config.model}`);
    } catch (error) {
      throw new ProviderInitializationError(
        this.name,
        error instanceof Error ? error.message : 'Unknown initialization error',
        error instanceof Error ? error : undefined
      );
    }
  }

  validateConfig(config: any): boolean {
    if (!config || typeof config !== 'object') {
      return false;
    }

    const openRouterConfig = config as OpenRouterConfig;
    
    if (!openRouterConfig.apiKey || typeof openRouterConfig.apiKey !== 'string') {
      console.error('OpenRouter API key is required');
      return false;
    }

    if (!openRouterConfig.model || typeof openRouterConfig.model !== 'string') {
      console.error('OpenRouter model is required');
      return false;
    }

    if (!openRouterConfig.baseUrl || typeof openRouterConfig.baseUrl !== 'string') {
      console.error('OpenRouter baseUrl is required');
      return false;
    }

    // Validate temperature if provided
    if (openRouterConfig.temperature !== undefined) {
      if (typeof openRouterConfig.temperature !== 'number' || 
          openRouterConfig.temperature < 0 || 
          openRouterConfig.temperature > 2) {
        console.error('OpenRouter temperature must be a number between 0 and 2');
        return false;
      }
    }

    // Validate maxTokens if provided
    if (openRouterConfig.maxTokens !== undefined) {
      if (typeof openRouterConfig.maxTokens !== 'number' || openRouterConfig.maxTokens < 1) {
        console.error('OpenRouter maxTokens must be a positive number');
        return false;
      }
    }

    return true;
  }

  async sendMessage(message: AIMessage): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      this.validateMessage(message);
      
      if (!this.openRouterConfig) {
        throw new ProviderRequestError(this.name, 'Provider not initialized');
      }

      console.log(`🤖 Sending message to OpenRouter (${this.openRouterConfig.model}): ${message.content.substring(0, 100)}...`);

      // Add message to conversation history
      this.conversationHistory.push(message);
      
      // Keep conversation history manageable (last 20 messages)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      const response = await this.callOpenRouterAPI(message);
      const responseTime = Date.now() - startTime;

      this.updateMetrics(responseTime);

      // Add assistant response to history
      const assistantMessage: AIMessage = {
        id: this.generateMessageId(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date(),
        metadata: { provider: this.name, model: this.openRouterConfig.model }
      };
      this.conversationHistory.push(assistantMessage);

      const aiResponse = AIResponseEntity.create(
        response.content,
        this.generateConversationId(),
        'openrouter',
        {
          model: this.openRouterConfig.model,
          usage: response.usage,
          responseTime,
          conversationLength: this.conversationHistory.length
        }
      );

      console.log(`✅ OpenRouter response received (${responseTime}ms)`);
      return aiResponse.toJSON();

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.handleError(
        error instanceof Error ? error : new Error('Unknown error'),
        'sendMessage'
      );
    }
  }

  private async callOpenRouterAPI(message: AIMessage): Promise<any> {
    const endpoint = `${this.openRouterConfig!.baseUrl}/chat/completions`;
    
    // Build messages array for the API
    const messages = this.buildMessagesArray(message);
    
    const requestBody = {
      model: this.openRouterConfig!.model,
      messages,
      temperature: this.openRouterConfig!.temperature || 0.7,
      max_tokens: this.openRouterConfig!.maxTokens || 1000,
      stream: false
    };

    console.log('📤 OpenRouter API request:', {
      model: requestBody.model,
      messageCount: messages.length,
      temperature: requestBody.temperature,
      max_tokens: requestBody.max_tokens
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openRouterConfig!.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        'X-Title': 'EarnLayer SDK Demo'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ProviderRequestError(
        this.name,
        `HTTP ${response.status}: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    console.log('📥 OpenRouter API response received');
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new ProviderRequestError(
        this.name,
        'Invalid response format from OpenRouter API'
      );
    }

    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
  }

  private buildMessagesArray(currentMessage: AIMessage): any[] {
    const messages: any[] = [];
    
    // Add system message if this is the first message or for context
    if (this.conversationHistory.length === 0) {
      messages.push({
        role: 'system',
        content: 'You are a helpful assistant with access to contextual information and resources. When relevant information or resources are provided, you can naturally reference them in your responses to help the user.'
      });
    }

    // Add conversation history (excluding the current message)
    const history = this.conversationHistory.filter(msg => msg.id !== currentMessage.id);
    for (const msg of history) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }

    // Add current message
    messages.push({
      role: currentMessage.role,
      content: currentMessage.content
    });

    return messages;
  }

  private async testConnection(): Promise<void> {
    try {
      const testMessage: AIMessage = {
        id: 'test',
        content: 'Hello',
        role: 'user',
        timestamp: new Date(),
        metadata: { isHealthCheck: true }
      };

      // Make a minimal request to test the connection
      const endpoint = `${this.openRouterConfig!.baseUrl}/chat/completions`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterConfig!.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
          'X-Title': 'EarnLayer SDK Demo - Health Check'
        },
        body: JSON.stringify({
          model: this.openRouterConfig!.model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Connection test failed: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      console.log('✅ OpenRouter connection test passed');
    } catch (error) {
      throw new Error(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConversationId(): string {
    return `openrouter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.openRouterConfig) {
        return false;
      }
      
      // Health check - verify configuration is valid
      return this.validateConfig(this.openRouterConfig);
    } catch {
      return false;
    }
  }

  async shutdown(): Promise<void> {
    this.openRouterConfig = undefined;
    this.conversationHistory = [];
    this.config = undefined;
    console.log('🔄 OpenRouter provider shutdown');
  }

  getConversationHistory(): AIMessage[] {
    return [...this.conversationHistory];
  }

  clearConversationHistory(): void {
    this.conversationHistory = [];
    console.log('🔄 OpenRouter conversation history cleared');
  }

  getModel(): string | null {
    return this.openRouterConfig?.model || null;
  }

  getSupportedModels(): string[] {
    // This could be expanded to fetch from OpenRouter's models endpoint
    return [
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-opus',
      'anthropic/claude-3-haiku',
      'openai/gpt-4',
      'openai/gpt-4-turbo',
      'openai/gpt-3.5-turbo',
      'meta-llama/llama-3.1-70b-instruct',
      'google/gemini-pro'
    ];
  }
}