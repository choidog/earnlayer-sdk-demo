import { useState, useEffect, useCallback } from 'react';
import type { AppConfig } from '../../../configuration/types';
import { appConfig } from '../../../configuration/AppConfig';
import { ConfigValidationError } from '../../../configuration/ConfigValidator';

/**
 * Hook for managing application configuration
 */
export const useAppConfig = () => {
  const [config, setConfig] = useState<AppConfig>(appConfig.getConfig());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Re-sync with config manager when component mounts
  useEffect(() => {
    try {
      const currentConfig = appConfig.getConfig();
      setConfig(currentConfig);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Configuration error');
    }
  }, []);

  const updateConfig = useCallback(async (newConfig: Partial<AppConfig>) => {
    setIsLoading(true);
    setError(null);

    try {
      appConfig.updateConfig(newConfig);
      const updatedConfig = appConfig.getConfig();
      setConfig(updatedConfig);
      console.log('✅ Configuration updated successfully');
    } catch (err) {
      const errorMessage = err instanceof ConfigValidationError 
        ? `Configuration error in ${err.field}: ${err.message}`
        : err instanceof Error 
        ? err.message 
        : 'Unknown configuration error';
      
      setError(errorMessage);
      console.error('❌ Configuration update failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetConfig = useCallback(() => {
    try {
      appConfig.reset();
      const resetConfig = appConfig.getConfig();
      setConfig(resetConfig);
      setError(null);
      console.log('🔄 Configuration reset to defaults');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    }
  }, []);

  const validateCurrentConfig = useCallback((): boolean => {
    try {
      // The config manager validates on access
      appConfig.getConfig();
      setError(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof ConfigValidationError 
        ? `Validation error in ${err.field}: ${err.message}`
        : err instanceof Error 
        ? err.message 
        : 'Validation failed';
      
      setError(errorMessage);
      return false;
    }
  }, []);

  // Convenient getters
  const aiConfig = config.ai;
  const advertisingConfig = config.advertising;
  const conversationConfig = config.conversation;
  const apiConfig = config.api;
  const isDevelopment = config.environment === 'development';
  const isProduction = config.environment === 'production';

  return {
    // Configuration state
    config,
    aiConfig,
    advertisingConfig,
    conversationConfig,
    apiConfig,
    
    // Environment helpers
    isDevelopment,
    isProduction,
    environment: config.environment,
    
    // State management
    isLoading,
    error,
    
    // Actions
    updateConfig,
    resetConfig,
    validateCurrentConfig,
    
    // Utility functions
    getAIProvider: () => config.ai.provider,
    hasValidConfig: () => error === null,
    getConfigSummary: () => ({
      environment: config.environment,
      aiProvider: config.ai.provider,
      creatorId: config.conversation.creatorId,
      hasError: error !== null
    })
  };
};