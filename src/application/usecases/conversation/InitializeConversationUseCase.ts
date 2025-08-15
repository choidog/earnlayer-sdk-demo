/**
 * Use case for initializing conversations with ad preferences
 */
export class InitializeConversationUseCase {
  constructor(
    private baseUrl: string,
    private creatorId: string,
    private defaultConfig: ConversationInitConfig
  ) {}

  async execute(config?: Partial<ConversationInitConfig>): Promise<ConversationResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔄 Initializing conversation...');

      const conversationConfig = {
        ...this.defaultConfig,
        ...config
      };

      // Initialize conversation with backend to get a valid UUID
      let backendResult: any = null;
      let conversationId: string;
      
      try {
        backendResult = await this.initializeWithBackend(conversationConfig);
        conversationId = backendResult.conversation_id; // Use the UUID from backend
        console.log('✅ Using backend conversation ID:', conversationId);
      } catch (error) {
        console.warn('⚠️ Backend initialization failed, using local initialization:', error);
        // Fallback to local generation only if backend fails
        conversationId = this.generateConversationId();
      }

      const responseTime = Date.now() - startTime;
      const result: ConversationResult = {
        conversationId,
        creatorId: this.creatorId,
        config: conversationConfig,
        isHealthy: true,
        responseTime,
        timestamp: new Date(),
        backendInitialized: backendResult !== null,
        metadata: {
          source: backendResult ? 'backend' : 'local',
          backendResponse: backendResult
        }
      };

      console.log(`✅ Conversation initialized: ${conversationId} (${responseTime}ms)`);
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ Conversation initialization failed (${responseTime}ms):`, error);
      
      throw new ConversationError(
        `Failed to initialize conversation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  private async initializeWithBackend(
    config: ConversationInitConfig
  ): Promise<any> {
    const endpoint = `${this.baseUrl}/api/conversations/initialize`;
    
    // Generate a temporary ID for the request
    const tempConversationId = this.generateConversationId();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversation_id: tempConversationId,
        creator_id: this.creatorId,
        ad_preferences: config.ad_preferences,
        context: config.context,
        metadata: config.metadata
      })
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private generateConversationId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `conv_${timestamp}_${random}`;
  }

  validateConfig(config: ConversationInitConfig): boolean {
    if (!config.ad_preferences) {
      return false;
    }

    if (!Array.isArray(config.ad_preferences.ad_types)) {
      return false;
    }

    if (typeof config.ad_preferences.revenue_vs_relevance !== 'number' ||
        config.ad_preferences.revenue_vs_relevance < 0 ||
        config.ad_preferences.revenue_vs_relevance > 1) {
      return false;
    }

    return true;
  }

  getConfiguration() {
    return {
      baseUrl: this.baseUrl,
      creatorId: this.creatorId,
      defaultConfig: this.defaultConfig
    };
  }
}

export interface ConversationInitConfig {
  ad_preferences: {
    ad_types: string[];
    frequency: string;
    revenue_vs_relevance: number;
  };
  context?: string;
  metadata?: Record<string, any>;
}

export interface ConversationResult {
  conversationId: string;
  creatorId: string;
  config: ConversationInitConfig;
  isHealthy: boolean;
  responseTime: number;
  timestamp: Date;
  backendInitialized: boolean;
  metadata: {
    source: 'backend' | 'local';
    backendResponse?: any;
  };
}

export class ConversationError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'ConversationError';
  }
}