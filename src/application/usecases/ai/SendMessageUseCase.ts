import type { AIMessage, AIResponse } from '../../../domain/ai/types/AITypes';
import type { AIProviderPlugin } from '../../../domain/ai/types/ProviderTypes';
import { ProviderRequestError } from '../../../domain/ai/types/ProviderTypes';
import { AIMessageEntity, AIResponseEntity } from '../../../domain/ai/types/AITypes';

/**
 * Use case for sending messages to AI providers
 */
export class SendMessageUseCase {
  constructor(private aiProvider: AIProviderPlugin) {}

  async execute(content: string, metadata?: Record<string, any>): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      // Create message entity
      const message = AIMessageEntity.createUserMessage(content, metadata);
      
      // Validate provider is healthy
      const isHealthy = await this.aiProvider.isHealthy();
      if (!isHealthy) {
        throw new ProviderRequestError(
          this.aiProvider.name,
          'Provider is not healthy'
        );
      }

      // Send message to provider
      const response = await this.aiProvider.sendMessage(message.toJSON());
      
      // Add response time to metadata
      const responseTime = Date.now() - startTime;
      response.metadata = {
        ...response.metadata,
        responseTime
      };

      console.log(`✅ Message sent successfully via ${this.aiProvider.name} (${responseTime}ms)`);
      return response;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ Failed to send message via ${this.aiProvider.name} (${responseTime}ms):`, error);
      
      if (error instanceof ProviderRequestError) {
        throw error;
      }

      throw new ProviderRequestError(
        this.aiProvider.name,
        error instanceof Error ? error.message : 'Unknown error',
        error instanceof Error ? error : undefined
      );
    }
  }

  async executeWithHistory(
    content: string, 
    conversationHistory: AIMessage[] = [],
    metadata?: Record<string, any>
  ): Promise<AIResponse> {
    // For now, just send the current message
    // Future enhancement: include conversation history in the request
    return this.execute(content, {
      ...metadata,
      conversationHistory: conversationHistory.slice(-10) // Last 10 messages for context
    });
  }

  getProviderInfo() {
    return {
      name: this.aiProvider.name,
      version: this.aiProvider.version,
      capabilities: this.aiProvider.capabilities
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      return await this.aiProvider.isHealthy();
    } catch {
      return false;
    }
  }
}