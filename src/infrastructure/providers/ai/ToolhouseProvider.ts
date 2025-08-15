import { BaseAIProvider, ProviderInitializationError, ProviderRequestError } from '../../../domain/ai/types/ProviderTypes';
import type { ProviderCapabilities } from '../../../domain/ai/types/ProviderTypes';
import type { AIMessage, AIResponse, AIStreamEvent } from '../../../domain/ai/types/AITypes';
import { AIResponseEntity } from '../../../domain/ai/types/AITypes';
import type { ToolhouseConfig } from '../../../configuration/types';
import { MCPClient } from '@earnlayer/chat-ads';

/**
 * Local Toolhouse AI Provider implementation
 * Integrates directly with local MCP server on port 8001
 * No backend dependencies - pure local implementation
 */
export class ToolhouseProvider extends BaseAIProvider {
  readonly name = 'toolhouse';
  readonly version = '1.0.0';
  readonly capabilities: ProviderCapabilities = {
    streaming: true,
    multimodal: false,
    functionCalling: true, // Via MCP tools
    contextRetention: true,
    maxTokens: 4000,
    supportedModalities: ['text']
  };

  private toolhouseConfig?: ToolhouseConfig;
  private mcpClient?: MCPClient;
  private runId: string | null = null;
  private conversationHistory: AIMessage[] = [];

  async initialize(config: ToolhouseConfig): Promise<void> {
    try {
      console.log('🔄 Initializing Local Toolhouse provider...');
      
      if (!this.validateConfig(config)) {
        throw new ProviderInitializationError(
          this.name,
          'Invalid Toolhouse configuration'
        );
      }

      this.toolhouseConfig = config;
      this.config = config;

      // Initialize MCP client for local MCP server
      this.mcpClient = new MCPClient({
        mcpUrl: `${config.baseUrl}/mcp`, // Direct to MCP server on port 8001
        apiKey: config.apiKey || 'local-dev-key'
      });

      // Test MCP connection
      await this.testMCPConnection();

      console.log('✅ Local Toolhouse provider initialized successfully');
      console.log(`📍 MCP Server: ${config.baseUrl}/mcp`);
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

    const toolhouseConfig = config as ToolhouseConfig;
    
    if (!toolhouseConfig.baseUrl || typeof toolhouseConfig.baseUrl !== 'string') {
      console.error('Toolhouse baseUrl is required');
      return false;
    }

    try {
      new URL(toolhouseConfig.baseUrl);
    } catch {
      console.error('Toolhouse baseUrl must be a valid URL');
      return false;
    }

    return true;
  }

  async sendMessage(message: AIMessage): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      this.validateMessage(message);
      
      if (!this.toolhouseConfig || !this.mcpClient) {
        throw new ProviderRequestError(this.name, 'Provider not initialized');
      }

      console.log(`🤖 Local Toolhouse processing: ${message.content.substring(0, 100)}...`);

      // Add message to conversation history
      this.conversationHistory.push(message);

      // Step 1: Search for relevant content via MCP
      const mcpResponse = await this.searchMCPContent(message);
      
      // Step 2: Generate AI response with MCP context
      const aiResponse = await this.generateAIResponse(message, mcpResponse);
      
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime);

      // Create response entity
      const response = AIResponseEntity.create(
        aiResponse.content,
        this.runId || this.generateConversationId(),
        'toolhouse',
        {
          model: 'local-toolhouse-mcp',
          usage: aiResponse.usage,
          responseTime,
          runId: this.runId,
          mcpAds: mcpResponse.ads,
          mcpContent: mcpResponse.content
        }
      );

      console.log(`✅ Local Toolhouse response generated (${responseTime}ms)`);
      console.log(`📊 MCP found ${mcpResponse.ads?.length || 0} relevant ads`);
      
      return response.toJSON();

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.handleError(
        error instanceof Error ? error : new Error('Unknown error'),
        'sendMessage'
      );
    }
  }

  async *streamMessage(message: AIMessage): AsyncGenerator<AIStreamEvent> {
    try {
      this.validateMessage(message);
      
      if (!this.toolhouseConfig || !this.mcpClient) {
        throw new ProviderRequestError(this.name, 'Provider not initialized');
      }

      console.log(`🌊 Starting Local Toolhouse stream: ${message.content.substring(0, 100)}...`);

      yield { type: 'start', metadata: { provider: this.name } };

      // Step 1: Search MCP content (stream metadata)
      yield { type: 'metadata', metadata: { step: 'searching_mcp' } };
      
      const mcpResponse = await this.searchMCPContent(message);
      
      yield { 
        type: 'metadata', 
        metadata: { 
          step: 'mcp_complete',
          adsFound: mcpResponse.ads?.length || 0,
          mcpContent: mcpResponse.content
        } 
      };

      // Step 2: Generate AI response (stream content)
      yield { type: 'metadata', metadata: { step: 'generating_response' } };
      
      const aiResponse = await this.generateAIResponse(message, mcpResponse);
      
      // Stream the response content
      const words = aiResponse.content.split(' ');
      for (const word of words) {
        yield { type: 'chunk', data: word + ' ' };
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate streaming
      }

      yield { 
        type: 'end', 
        metadata: { 
          runId: this.runId,
          mcpAds: mcpResponse.ads,
          responseTime: Date.now()
        } 
      };
      
    } catch (error) {
      console.error('Local Toolhouse streaming error:', error);
      yield { 
        type: 'error', 
        error: error instanceof Error ? error.message : 'Unknown streaming error' 
      };
    }
  }

  private async searchMCPContent(message: AIMessage): Promise<any> {
    if (!this.mcpClient) {
      throw new Error('MCP client not initialized');
    }

    try {
      console.log('🔍 Searching MCP content...');
      console.log(`Query: "${message.content}"`);
      console.log(`Creator ID: ${message.metadata?.creatorId || 'default'}`);
      console.log(`Conversation ID: ${message.metadata?.conversationId || 'none'}`);
      
      // Check if we have a valid conversation ID
      if (!message.metadata?.conversationId) {
        console.error('No conversation ID provided - MCP requires a valid conversation');
        throw new Error('Conversation ID is required for MCP integration');
      }
      
      // Validate conversation ID format (should be a UUID from backend)
      if (!this.isValidConversationId(message.metadata.conversationId)) {
        console.error('Invalid conversation ID format:', message.metadata.conversationId);
        throw new Error('Invalid conversation ID format');
      }
      
      console.log('Calling MCP client.searchContentAds...');
      const response = await this.mcpClient.searchContentAds(
        [message.content], // Search query
        message.metadata?.creatorId || 'default',
        message.metadata?.conversationId
      );

      console.log('Raw MCP response:', response);
      console.log(`MCP search complete - found ${response.ads?.length || 0} ads`);
      
      // Check if response has the expected structure
      if (!response || typeof response !== 'object') {
        console.warn('MCP response is not an object:', response);
        throw new Error('Invalid MCP response format');
      }
      
      return response;
    } catch (error) {
      console.error('MCP search failed:', error);
      throw error;
    }
  }

  private isValidConversationId(conversationId: string): boolean {
    // Check if it's a valid UUID format (from backend)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(conversationId);
  }

  private async generateAIResponse(message: AIMessage, mcpResponse: any): Promise<any> {
    try {
      console.log('Generating AI response with Toolhouse agent...');
      
      // Prepare context from MCP response
      const mcpContext = mcpResponse.content || '';
      const relevantAds = mcpResponse.ads || [];
      
      console.log('Preparing enhanced message with MCP context...');
      console.log(`Original message: "${message.content}"`);
      console.log(`MCP context available: ${mcpContext ? 'Yes' : 'No'}`);
      console.log(`Relevant ads found: ${relevantAds.length}`);
      
      // Build enhanced message with MCP context
      let enhancedMessage = message.content;
      
      if (mcpContext || relevantAds.length > 0) {
        enhancedMessage += '\n\nRelevant context and resources:\n';
        
        if (mcpContext) {
          console.log('Adding MCP context to enhanced message...');
          enhancedMessage += `MCP Content: ${JSON.stringify(mcpContext, null, 2)}\n\n`;
        }
        
        if (relevantAds.length > 0) {
          console.log('Adding relevant ads to enhanced message...');
          enhancedMessage += 'Available resources:\n';
          relevantAds.forEach((ad: any, index: number) => {
            console.log(`Adding ad ${index + 1}: ${ad.title}`);
            enhancedMessage += `${index + 1}. ${ad.title} - ${ad.description}\n`;
            if (ad.url) {
              enhancedMessage += `   Link: ${ad.url}\n`;
            }
          });
          enhancedMessage += '\n';
        }
        
        enhancedMessage += 'Please provide a helpful response incorporating this context and any relevant resources.';
      } else {
        console.log('No MCP context or ads available - sending original message only');
      }

      console.log('Enhanced message prepared:');
      console.log(`Length: ${enhancedMessage.length} characters`);
      console.log(`Preview: ${enhancedMessage.substring(0, 200)}${enhancedMessage.length > 200 ? '...' : ''}`);

      // Call Toolhouse agent
      console.log('Calling Toolhouse agent...');
      const toolhouseResponse = await this.callToolhouseAgent(enhancedMessage);
      
      console.log('Toolhouse agent response received:');
      console.log(`Response length: ${toolhouseResponse.length} characters`);
      console.log(`Response preview: ${toolhouseResponse.substring(0, 200)}${toolhouseResponse.length > 200 ? '...' : ''}`);
      
      return {
        content: toolhouseResponse,
        usage: {
          prompt_tokens: enhancedMessage.length,
          completion_tokens: toolhouseResponse.length,
          total_tokens: enhancedMessage.length + toolhouseResponse.length
        }
      };
      
    } catch (error) {
      console.error('Toolhouse agent call failed, falling back to template response:', error);
      
      // Fallback to template response
      const mcpContext = mcpResponse.content || '';
      const relevantAds = mcpResponse.ads || [];
      
      console.log('Generating fallback template response...');
      
      let responseContent = `I understand you're asking about: "${message.content}"\n\n`;
      
      if (mcpContext) {
        console.log('Including MCP context in fallback response');
        responseContent += `Based on relevant information: ${JSON.stringify(mcpContext)}\n\n`;
      }
      
      if (relevantAds.length > 0) {
        console.log(`Including ${relevantAds.length} ads in fallback response`);
        responseContent += `Here are some relevant resources:\n`;
        relevantAds.forEach((ad: any, index: number) => {
          responseContent += `${index + 1}. ${ad.title} - ${ad.description}\n`;
          if (ad.url) {
            responseContent += `   Link: ${ad.url}\n`;
          }
        });
      } else {
        console.log('No ads available for fallback response');
        responseContent += `I don't have specific resources for this topic, but I'm happy to help with general information.`;
      }

      return {
        content: responseContent,
        usage: {
          prompt_tokens: message.content.length,
          completion_tokens: responseContent.length,
          total_tokens: message.content.length + responseContent.length
        }
      };
    }
  }

  private async callToolhouseAgent(message: string): Promise<string> {
    if (!this.toolhouseConfig?.agentUrl) {
      throw new Error('Toolhouse agent URL not configured');
    }

    console.log('Calling Toolhouse agent:', this.toolhouseConfig.agentUrl);
    console.log('Request details:');
    console.log(`URL: ${this.toolhouseConfig.agentUrl}`);
    console.log(`API Key: ${this.toolhouseConfig.apiKey ? 'Configured' : 'Not configured'}`);
    console.log(`Message length: ${message.length} characters`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(this.toolhouseConfig.agentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.toolhouseConfig.apiKey && { 'Authorization': `Bearer ${this.toolhouseConfig.apiKey}` })
        },
        body: JSON.stringify({ message })
      });

      const responseTime = Date.now() - startTime;
      console.log(`Response received in ${responseTime}ms:`);
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error(`Toolhouse agent error response:`);
        console.error(`Status: ${response.status} ${response.statusText}`);
        
        // Try to get error details
        try {
          const errorText = await response.text();
          console.error(`Error body: ${errorText}`);
        } catch (e) {
          console.error(`Error body: Could not read response`);
        }
        
        throw new Error(`Toolhouse agent responded with ${response.status}: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body from Toolhouse agent');
      }

      const decoder = new TextDecoder();
      let result = '';
      let chunkCount = 0;

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          if (value) {
            chunkCount++;
            const chunk = decoder.decode(value);
            result += chunk;
            console.log(`Chunk ${chunkCount}: ${chunk.length} bytes`);
          }
        }
      } finally {
        reader.releaseLock();
      }

      console.log(`Toolhouse agent response complete:`);
      console.log(`Total chunks: ${chunkCount}`);
      console.log(`Total response length: ${result.length} characters`);
      console.log(`Total time: ${responseTime}ms`);

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`Toolhouse agent call failed after ${responseTime}ms:`, error);
      throw error;
    }
  }

  private async testMCPConnection(): Promise<void> {
    try {
      if (!this.mcpClient) {
        throw new Error('MCP client not initialized');
      }

      console.log('🏥 Testing MCP connection...');
      
      // First, we need to initialize a conversation with the backend
      // to get a valid conversation ID for MCP testing
      const testConversationId = await this.initializeTestConversation();
      
      // Test with a simple search using the valid conversation ID
      const testResponse = await this.mcpClient.searchContentAds(
        ['test'],
        'd64a4899-20e4-4ecd-a53e-057aceed54cf', // Use the correct UUID format
        testConversationId
      );
      
      console.log('✅ MCP connection test passed');
      console.log(`📊 Test response: ${testResponse.ads?.length || 0} ads found`);
      console.log(`📋 Test conversation ID: ${testConversationId}`);
    } catch (error) {
      console.error('❌ MCP connection test failed:', error);
      console.error('🔧 This means the local Toolhouse will use fallback responses');
      console.error('🔧 To fix this, ensure:');
      console.error('   1. The MCP server is running on localhost:8001');
      console.error('   2. The backend is running on localhost:8000');
      console.error('   3. The conversation system is properly initialized');
      console.error('🔧 The MCP server requires valid conversation IDs from the backend');
      
      // Don't throw - allow initialization to continue with fallback mode
      // But log the issue clearly so developers know what's wrong
    }
  }

  private async initializeTestConversation(): Promise<string> {
    try {
      console.log('🔄 Initializing test conversation for MCP...');
      
      const response = await fetch('http://localhost:8000/api/conversations/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversation_id: `test-mcp-${Date.now()}`,
          creator_id: 'd64a4899-20e4-4ecd-a53e-057aceed54cf', // Use the correct UUID format
          ad_preferences: {
            ad_types: ['hyperlink', 'popup'],
            frequency: 'normal',
            revenue_vs_relevance: 0.5
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend responded with ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Test conversation initialized:', result.conversation_id);
      return result.conversation_id;
    } catch (error) {
      console.error('❌ Failed to initialize test conversation:', error);
      throw error;
    }
  }

  private generateConversationId(): string {
    return `local_toolhouse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.toolhouseConfig || !this.mcpClient) {
        return false;
      }
      
      // Test MCP connection
      await this.testMCPConnection();
      return true;
    } catch {
      return false;
    }
  }

  async shutdown(): Promise<void> {
    this.toolhouseConfig = undefined;
    this.mcpClient = undefined;
    this.runId = null;
    this.conversationHistory = [];
    this.config = undefined;
    console.log('🔄 Local Toolhouse provider shutdown');
  }

  getCurrentRunId(): string | null {
    return this.runId;
  }

  resetConversation(): void {
    this.runId = null;
    this.conversationHistory = [];
    console.log('🔄 Local Toolhouse conversation reset');
  }

  getConversationHistory(): AIMessage[] {
    return [...this.conversationHistory];
  }
}