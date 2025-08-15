import { useState, useEffect, useCallback, useRef } from 'react';
import type { AIProviderPlugin, ProviderStatus } from '../../../domain/ai/types/ProviderTypes';
import type { AIResponse } from '../../../domain/ai/types/AITypes';
import type { AIConfig } from '../../../configuration/types';
import { ProviderFactory } from '../../../infrastructure/providers/ProviderFactory';
import { SendMessageUseCase } from '../../usecases/ai/SendMessageUseCase';

/**
 * Hook for managing AI provider instances and messaging
 */
export const useAIProvider = (config: AIConfig) => {
  const [provider, setProvider] = useState<AIProviderPlugin | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  
  const sendMessageUseCaseRef = useRef<SendMessageUseCase | null>(null);
  const configRef = useRef(config);

  // Initialize provider when config changes
  useEffect(() => {
    const initializeProvider = async () => {
      // Skip if config hasn't changed
      if (JSON.stringify(configRef.current) === JSON.stringify(config) && provider) {
        return;
      }

      configRef.current = config;
      setIsLoading(true);
      setError(null);

      try {
        console.log(`🔄 Initializing AI provider: ${config.provider}`);
        
        // Shutdown existing provider if any
        if (provider) {
          await ProviderFactory.shutdownProvider(config.provider);
          setProvider(null);
          sendMessageUseCaseRef.current = null;
        }

        // Create new provider
        const newProvider = await ProviderFactory.create(config.provider, config);
        setProvider(newProvider);
        
        // Create use case
        sendMessageUseCaseRef.current = new SendMessageUseCase(newProvider);
        
        // Update status
        const providerStatus = newProvider.getStatus();
        setStatus(providerStatus);
        setIsInitialized(true);

        console.log(`✅ AI provider ${config.provider} initialized successfully`);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Provider initialization failed';
        setError(errorMessage);
        setIsInitialized(false);
        console.error(`❌ AI provider initialization failed:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeProvider();
  }, [config, provider]);

  // Send message
  const sendMessage = useCallback(async (
    content: string,
    metadata?: Record<string, any>
  ): Promise<AIResponse> => {
    if (!sendMessageUseCaseRef.current) {
      throw new Error('Provider not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessageUseCaseRef.current.execute(content, metadata);
      
      // Update status after successful request
      if (provider) {
        const newStatus = provider.getStatus();
        setStatus(newStatus);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  // Health check
  const checkHealth = useCallback(async (): Promise<boolean> => {
    if (!sendMessageUseCaseRef.current) {
      return false;
    }

    try {
      const isHealthy = await sendMessageUseCaseRef.current.healthCheck();
      
      if (provider) {
        const newStatus = provider.getStatus();
        setStatus(newStatus);
      }

      return isHealthy;
    } catch {
      return false;
    }
  }, [provider]);

  // Get provider info
  const getProviderInfo = useCallback(() => {
    if (!sendMessageUseCaseRef.current) {
      return null;
    }
    return sendMessageUseCaseRef.current.getProviderInfo();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (provider) {
        ProviderFactory.shutdownProvider(config.provider).catch(console.error);
      }
    };
  }, [provider, config.provider]);

  return {
    // Provider state
    provider,
    isInitialized,
    isLoading,
    error,
    status,
    
    // Actions
    sendMessage,
    checkHealth,
    
    // Information
    getProviderInfo,
    providerName: config.provider,
    capabilities: provider?.capabilities || null,
    
    // Status helpers
    isHealthy: status?.isHealthy || false,
    hasError: error !== null,
    
    // Metrics (if available)
    metrics: status?.metrics || null
  };
};