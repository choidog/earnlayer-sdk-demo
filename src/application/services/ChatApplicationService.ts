import type { AIResponse } from '../../domain/ai/types/AITypes';
import type { AppConfig } from '../../configuration/types';
import { useConversationManager } from '../hooks/conversation/useConversationManager';
import { useAdSearch } from '../hooks/advertising/useAdSearch';
import { useAIProvider } from '../hooks/ai/useAIProvider';

/**
 * Main application service that coordinates chat functionality
 * This service orchestrates the interaction between AI, ads, and conversation domains
 */
export class ChatApplicationService {
  constructor(
    private conversationManager: ReturnType<typeof useConversationManager>,
    private adSearch: ReturnType<typeof useAdSearch>,
    private aiProvider: ReturnType<typeof useAIProvider>
  ) {}

  async sendMessage(message: string): Promise<ChatMessageResult> {
    console.log('🚀 ChatApplicationService: Processing message:', message);
    const startTime = Date.now();

    try {
      // Ensure conversation is initialized
      if (!this.conversationManager.conversationId) {
        await this.conversationManager.initializeConversation();
      }

      // Strategy 1: Try AI with MCP enhancement (Toolhouse with auto-MCP)
      if (this.aiProvider.providerName === 'toolhouse') {
        return await this.sendMessageWithToolhouse(message, startTime);
      }

      // Strategy 2: Manual MCP + AI integration (for other providers)
      return await this.sendMessageWithManualMCP(message, startTime);

    } catch (error) {
      console.error('❌ ChatApplicationService: Message processing failed:', error);
      
      // Final fallback: Basic response with any available ads
      return this.createFallbackResponse(message, error, startTime);
    }
  }

  private async sendMessageWithToolhouse(message: string, startTime: number): Promise<ChatMessageResult> {
    try {
      console.log('🤖 Using Toolhouse with auto-MCP integration');
      
      const aiResponse = await this.aiProvider.sendMessage(message, {
        conversationId: this.conversationManager.conversationId,
        creatorId: this.conversationManager.creatorId
      });

      // Toolhouse automatically handles MCP integration via earnlayer_content_ads_search tool
      const responseTime = Date.now() - startTime;

      return {
        content: aiResponse.content,
        source: 'toolhouse_mcp',
        ads: [], // Toolhouse embeds ads in response content
        responseTime,
        metadata: {
          ...aiResponse.metadata,
          conversationId: aiResponse.conversationId,
          strategy: 'toolhouse_auto_mcp'
        }
      };

    } catch (error) {
      console.error('❌ Toolhouse strategy failed, falling back to manual MCP:', error);
      throw error;
    }
  }

  private async sendMessageWithManualMCP(message: string, startTime: number): Promise<ChatMessageResult> {
    try {
      console.log('🔍 Using manual MCP + AI integration');

      // Step 1: Search for relevant ads
      const adSearchResult = await this.adSearch.searchForMessage(message, {
        conversationId: this.conversationManager.conversationId
      });

      // Step 2: Enhance message with MCP context
      const enhancedMessage = this.buildEnhancedMessage(message, adSearchResult.ads);

      // Step 3: Send enhanced message to AI
      const aiResponse = await this.aiProvider.sendMessage(enhancedMessage, {
        conversationId: this.conversationManager.conversationId,
        originalMessage: message,
        adContext: adSearchResult.ads
      });

      const responseTime = Date.now() - startTime;

      return {
        content: aiResponse.content,
        source: 'manual_mcp',
        ads: adSearchResult.ads,
        responseTime,
        metadata: {
          ...aiResponse.metadata,
          conversationId: aiResponse.conversationId,
          strategy: 'manual_mcp_enhancement',
          adSearchTime: adSearchResult.responseTime,
          adCount: adSearchResult.ads.length
        }
      };

    } catch (error) {
      console.error('❌ Manual MCP strategy failed:', error);
      throw error;
    }
  }

  private buildEnhancedMessage(userMessage: string, ads: any[]): string {
    let enhancedMessage = `User message: ${userMessage}\n\n`;

    if (ads && ads.length > 0) {
      enhancedMessage += `Relevant advertisements that might be helpful:\n`;
      ads.forEach((ad, index) => {
        enhancedMessage += `${index + 1}. ${ad.title}: ${ad.description}\n`;
      });
      enhancedMessage += '\n';
    }

    enhancedMessage += `Please respond to the user's message naturally, and if relevant, you can mention the available resources or tools that might help them.`;

    return enhancedMessage;
  }

  private createFallbackResponse(message: string, error: any, startTime: number): ChatMessageResult {
    const responseTime = Date.now() - startTime;
    
    return {
      content: `I received your message: "${message}". I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment.`,
      source: 'fallback',
      ads: this.adSearch.ads, // Use any cached ads
      responseTime,
      metadata: {
        strategy: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error',
        hasAds: this.adSearch.hasAds
      }
    };
  }

  // Health and status methods
  async checkHealth(): Promise<HealthStatus> {
    const [conversationHealthy, aiHealthy] = await Promise.all([
      this.conversationManager.updateConversationHealth(),
      this.aiProvider.checkHealth()
    ]);

    return {
      conversation: {
        isHealthy: conversationHealthy,
        conversationId: this.conversationManager.conversationId,
        creatorId: this.conversationManager.creatorId
      },
      ai: {
        isHealthy: aiHealthy,
        provider: this.aiProvider.providerName,
        isInitialized: this.aiProvider.isInitialized
      },
      ads: {
        isHealthy: this.adSearch.isHealthy,
        adCount: this.adSearch.adCount,
        lastSearchTime: this.adSearch.lastSearchTimestamp
      },
      overall: conversationHealthy && aiHealthy && this.adSearch.isHealthy
    };
  }

  getStatus(): ApplicationStatus {
    return {
      conversation: this.conversationManager.getConversationInfo(),
      ai: this.aiProvider.getProviderInfo(),
      ads: this.adSearch.getSearchStats(),
      config: {
        aiProvider: this.aiProvider.providerName,
        creatorId: this.conversationManager.creatorId,
        autoInitialize: this.conversationManager.autoInitialize
      }
    };
  }

  // Reset methods
  resetConversation(): void {
    this.conversationManager.resetConversation();
    this.adSearch.clearAds();
    console.log('🔄 Chat session reset');
  }

  clearAdHistory(): void {
    this.adSearch.clearAds();
    this.adSearch.clearHistory();
    console.log('🔄 Ad history cleared');
  }
}

// Types for the service
export interface ChatMessageResult {
  content: string;
  source: 'toolhouse_mcp' | 'manual_mcp' | 'fallback';
  ads: any[];
  responseTime: number;
  metadata: {
    conversationId?: string;
    strategy: string;
    error?: string;
    adSearchTime?: number;
    adCount?: number;
    [key: string]: any;
  };
}

export interface HealthStatus {
  conversation: {
    isHealthy: boolean;
    conversationId: string | null;
    creatorId: string;
  };
  ai: {
    isHealthy: boolean;
    provider: string;
    isInitialized: boolean;
  };
  ads: {
    isHealthy: boolean;
    adCount: number;
    lastSearchTime?: Date;
  };
  overall: boolean;
}

export interface ApplicationStatus {
  conversation: any;
  ai: any;
  ads: any;
  config: {
    aiProvider: string;
    creatorId: string;
    autoInitialize: boolean;
  };
}