import { MCPClient } from '@earnlayer/chat-ads';

export interface GeminiMCPConfig {
  geminiApiKey: string;
  mcpServerUrl: string;
  creatorId: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiMCPResponse {
  content: string;
  ads: any[];
  conversationId: string;
  source: 'gemini_mcp' | 'fallback';
  metadata?: {
    model: string;
    usage?: any;
  };
}

export class GeminiMCPService {
  private config: GeminiMCPConfig;
  private mcpClient: MCPClient;
  private conversationId: string | null = null;

  constructor(config: GeminiMCPConfig) {
    this.config = {
      model: 'gemini-2.5-pro',
      temperature: 0.7,
      maxTokens: 1000,
      ...config
    };
    
    this.mcpClient = new MCPClient({
      mcpUrl: config.mcpServerUrl,
      apiKey: 'demo-api-key'
    });
  }

  /**
   * Initialize a new Gemini conversation
   */
  async initializeConversation(): Promise<string> {
    // Generate a proper UUID for conversation ID
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    this.conversationId = uuid;
    console.log('🔄 GeminiMCPService initialized conversation:', this.conversationId);
    return this.conversationId;
  }

  /**
   * Send a message to Gemini with MCP integration
   */
  async sendMessage(message: string): Promise<GeminiMCPResponse> {
    if (!this.conversationId) {
      await this.initializeConversation();
    }

    console.log('🚀 GeminiMCPService sending message to Gemini:', message);

    try {
      // Step 1: Get relevant ads/content from MCP server
      console.log('🔍 GeminiMCPService calling MCP server for relevant content...');
      const mcpResponse = await this.mcpClient.searchContentAds(
        [message],
        this.config.creatorId,
        this.conversationId!
      );

      console.log('📥 GeminiMCPService received MCP response:', mcpResponse);

      // Step 2: Enhance message with MCP content for Gemini
      const enhancedMessage = this.buildEnhancedMessage(message, mcpResponse);

      // Step 3: Send enhanced message to Gemini
      console.log('🤖 GeminiMCPService sending enhanced message to Gemini...');
      const geminiResponse = await this.callGeminiAPI(enhancedMessage);

      console.log('✅ GeminiMCPService received Gemini response:', geminiResponse);

      // Step 4: Return combined response
      return {
        content: geminiResponse.content,
        ads: mcpResponse.ads || [],
        conversationId: this.conversationId!,
        source: 'gemini_mcp',
        metadata: {
          model: this.config.model!,
          usage: geminiResponse.metadata?.usage
        }
      };

    } catch (error) {
      console.error('❌ GeminiMCPService error:', error);
      
      // Fallback: return basic response without Gemini
      return {
        content: `I understand you're asking about "${message}". Here's what I found:`,
        ads: [],
        conversationId: this.conversationId!,
        source: 'fallback'
      };
    }
  }

  /**
   * Build enhanced message with MCP content for Gemini
   */
  private buildEnhancedMessage(userMessage: string, mcpResponse: any): string {
    let enhancedMessage = `User message: ${userMessage}\n\n`;

    if (mcpResponse.content) {
      enhancedMessage += `Relevant content for context:\n${mcpResponse.content}\n\n`;
    }

    if (mcpResponse.ads && mcpResponse.ads.length > 0) {
      enhancedMessage += `Relevant advertisements that might be helpful:\n`;
      mcpResponse.ads.forEach((ad: any, index: number) => {
        enhancedMessage += `${index + 1}. ${ad.title}: ${ad.description}\n`;
      });
      enhancedMessage += '\n';
    }

    enhancedMessage += `Please respond to the user's message naturally, and if relevant, you can mention the available resources or tools that might help them.`;

    console.log('📝 GeminiMCPService enhanced message:', enhancedMessage);
    return enhancedMessage;
  }

  /**
   * Call Gemini API directly
   */
  private async callGeminiAPI(message: string): Promise<any> {
    console.log('🔍 GeminiMCPService using model:', this.config.model);
    
    const geminiRequest = {
      contents: [{
        parts: [{
          text: message
        }]
      }],
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    };

    console.log('📤 GeminiMCPService calling Gemini API with request:', geminiRequest);
    console.log('🌐 GeminiMCPService API URL:', `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.geminiApiKey.substring(0, 10)}...`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiRequest)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ GeminiMCPService Gemini API error:', response.status, errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('📥 GeminiMCPService full API response:', data);
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    return {
      content: data.candidates[0].content.parts[0].text,
      metadata: {
        usage: data.usageMetadata
      }
    };
  }

  /**
   * Get current conversation ID
   */
  getConversationId(): string | null {
    return this.conversationId;
  }

  /**
   * Reset conversation
   */
  resetConversation(): void {
    this.conversationId = null;
    console.log('🔄 GeminiMCPService reset conversation');
  }
} 