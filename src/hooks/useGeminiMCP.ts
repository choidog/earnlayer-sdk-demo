import { useState, useCallback, useRef } from 'react';
import { GeminiMCPService } from '../services/GeminiMCPService';

// Define the interfaces locally to avoid import issues
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

export interface UseGeminiMCPOptions {
  config: GeminiMCPConfig;
  autoInitialize?: boolean;
}

export interface UseGeminiMCPReturn {
  // State
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  lastResponse: GeminiMCPResponse | null;
  
  // Methods
  sendMessage: (message: string) => Promise<GeminiMCPResponse>;
  initializeConversation: () => Promise<string>;
  resetConversation: () => void;
  
  // Service access
  service: GeminiMCPService | null;
}

export const useGeminiMCP = (options: UseGeminiMCPOptions): UseGeminiMCPReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<GeminiMCPResponse | null>(null);
  
  const serviceRef = useRef<GeminiMCPService | null>(null);
  const configRef = useRef(options.config);

  // Recreate service if config changes
  if (!serviceRef.current || configRef.current.model !== options.config.model) {
    serviceRef.current = new GeminiMCPService(options.config);
    configRef.current = options.config;
    console.log('🔄 useGeminiMCP recreated service with new model:', options.config.model);
  }

  const service = serviceRef.current;

  // Initialize conversation if auto-initialize is enabled
  const initializeConversation = useCallback(async (): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const id = await service.initializeConversation();
      setConversationId(id);
      
      console.log('✅ useGeminiMCP initialized conversation:', id);
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize conversation';
      setError(errorMessage);
      console.error('❌ useGeminiMCP initialization error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  // Send message to Gemini with MCP integration
  const sendMessage = useCallback(async (message: string): Promise<GeminiMCPResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚀 useGeminiMCP sending message:', message);
      
      const response = await service.sendMessage(message);
      
      setLastResponse(response);
      setConversationId(response.conversationId);
      
      console.log('✅ useGeminiMCP received response:', response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('❌ useGeminiMCP send message error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  // Reset conversation
  const resetConversation = useCallback(() => {
    service.resetConversation();
    setConversationId(null);
    setLastResponse(null);
    setError(null);
    console.log('🔄 useGeminiMCP reset conversation');
  }, [service]);

  // Auto-initialize if enabled
  if (options.autoInitialize && !conversationId && !isLoading) {
    initializeConversation().catch(console.error);
  }

  return {
    // State
    isLoading,
    error,
    conversationId,
    lastResponse,
    
    // Methods
    sendMessage,
    initializeConversation,
    resetConversation,
    
    // Service access
    service
  };
}; 