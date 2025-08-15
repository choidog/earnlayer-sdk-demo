import { useState, useEffect, useCallback, useRef } from 'react';
import { InitializeConversationUseCase } from '../../usecases/conversation';
import type { ConversationInitConfig, ConversationResult } from '../../usecases/conversation';
import type { ConversationConfig } from '../../../configuration/types';

/**
 * Hook for managing conversation lifecycle (replaces useConversation)
 */
export const useConversationManager = (config: ConversationConfig) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHealthy, setIsHealthy] = useState(false);
  const [conversationResult, setConversationResult] = useState<ConversationResult | null>(null);
  
  const initUseCaseRef = useRef<InitializeConversationUseCase | null>(null);
  const configRef = useRef(config);

  // Define initializeConversation first to avoid circular dependency
  const initializeConversation = useCallback(async (
    customConfig?: Partial<ConversationInitConfig>
  ): Promise<string> => {
    console.log('🚀 initializeConversation called, initUseCaseRef.current:', !!initUseCaseRef.current);
    
    if (!initUseCaseRef.current) {
      console.error('❌ initUseCaseRef.current is null! Config:', config);
      throw new Error('Conversation use case not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Initializing conversation...');
      
      const result = await initUseCaseRef.current.execute(customConfig);
      
      setConversationId(result.conversationId);
      setConversationResult(result);
      setIsHealthy(result.isHealthy);
      
      console.log(`✅ Conversation initialized: ${result.conversationId}`);
      console.log(`🔍 Conversation ID format check:`, {
        conversationId: result.conversationId,
        isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(result.conversationId),
        backendInitialized: result.backendInitialized
      });
      return result.conversationId;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Conversation initialization failed';
      setError(errorMessage);
      setIsHealthy(false);
      console.error('❌ Conversation initialization failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // Create use case when config changes
  useEffect(() => {
    // Always create the use case, even if config hasn't changed
    initUseCaseRef.current = new InitializeConversationUseCase(
      config.baseUrl,
      config.creatorId,
      config.initialConfig
    );

    console.log('🔄 Conversation manager initialized with config:', {
      baseUrl: config.baseUrl,
      creatorId: config.creatorId,
      autoInitialize: config.autoInitialize
    });
  }, [config.baseUrl, config.creatorId, config.autoInitialize, config.initialConfig]);

  // Auto-initialize if enabled
  useEffect(() => {
    console.log('🔄 Auto-initialize check:', {
      autoInitialize: config.autoInitialize,
      conversationId: !!conversationId,
      isLoading,
      hasUseCase: !!initUseCaseRef.current
    });
    
    if (config.autoInitialize && !conversationId && !isLoading && initUseCaseRef.current) {
      console.log('🚀 Auto-initializing conversation...');
      initializeConversation();
    }
  }, [config.autoInitialize, conversationId, isLoading, initializeConversation]);

  const resetConversation = useCallback(() => {
    setConversationId(null);
    setConversationResult(null);
    setError(null);
    setIsHealthy(false);
    console.log('🔄 Conversation reset');
  }, []);

  const updateConversationHealth = useCallback(async (): Promise<boolean> => {
    if (!conversationId || !initUseCaseRef.current) {
      setIsHealthy(false);
      return false;
    }

    try {
      // For now, just check if we have a valid conversation ID
      // In the future, this could ping the backend to verify the conversation
      const healthy = conversationId !== null;
      setIsHealthy(healthy);
      return healthy;
    } catch (err) {
      console.error('Health check failed:', err);
      setIsHealthy(false);
      return false;
    }
  }, [conversationId]);

  const getConversationInfo = useCallback(() => {
    return {
      conversationId,
      creatorId: config.creatorId,
      isHealthy,
      isInitialized: conversationId !== null,
      config: conversationResult?.config,
      backendInitialized: conversationResult?.backendInitialized,
      lastInitialized: conversationResult?.timestamp
    };
  }, [conversationId, config.creatorId, isHealthy, conversationResult]);

  const validateConfig = useCallback((testConfig: ConversationInitConfig): boolean => {
    if (!initUseCaseRef.current) {
      return false;
    }
    return initUseCaseRef.current.validateConfig(testConfig);
  }, []);

  return {
    // State
    conversationId,
    isLoading,
    error,
    isHealthy,
    
    // Actions
    initializeConversation,
    resetConversation,
    updateConversationHealth,
    
    // Information
    getConversationInfo,
    validateConfig,
    
    // Configuration
    creatorId: config.creatorId,
    baseUrl: config.baseUrl,
    autoInitialize: config.autoInitialize,
    
    // Status helpers
    isInitialized: conversationId !== null,
    hasError: error !== null,
    
    // Result details
    backendInitialized: conversationResult?.backendInitialized || false,
    responseTime: conversationResult?.responseTime,
    initializationTimestamp: conversationResult?.timestamp
  };
};