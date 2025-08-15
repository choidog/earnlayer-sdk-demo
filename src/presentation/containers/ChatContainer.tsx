import React, { useMemo } from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';
import { ChatApplicationService } from '../../application/services/ChatApplicationService';
import { useAppConfig } from '../../application/hooks/configuration/useAppConfig';
import { useConversationManager } from '../../application/hooks/conversation/useConversationManager';
import { useAdSearch } from '../../application/hooks/advertising/useAdSearch';
import { useAIProvider } from '../../application/hooks/ai/useAIProvider';

// Import provider registration to ensure providers are available
import '../../infrastructure/providers/ai';

/**
 * Main container that orchestrates all chat functionality
 * This component follows the container/component pattern
 */
export const ChatContainer: React.FC = () => {
  console.log('🔧 ChatContainer rendering...');

  // Get application configuration
  const {
    config,
    aiConfig,
    advertisingConfig,
    conversationConfig,
    isDevelopment,
    error: configError,
    isLoading: configLoading
  } = useAppConfig();

  // Initialize domain hooks
  const conversationManager = useConversationManager(conversationConfig);
  const adSearch = useAdSearch(advertisingConfig, conversationManager.conversationId || undefined);
  const aiProvider = useAIProvider(aiConfig);

  // Create application service
  const chatService = useMemo(() => {
    return new ChatApplicationService(conversationManager, adSearch, aiProvider);
  }, [conversationManager, adSearch, aiProvider]);

  // Handle configuration loading states
  if (configLoading) {
    return (
      <div className="chat-container loading">
        <div className="loading-message">
          <h2>🔄 Loading Configuration...</h2>
          <p>Initializing EarnLayer SDK Demo</p>
        </div>
      </div>
    );
  }

  // Handle configuration errors
  if (configError) {
    return (
      <div className="chat-container error">
        <div className="error-message">
          <h2>❌ Configuration Error</h2>
          <p>{configError}</p>
          <details>
            <summary>Configuration Details</summary>
            <pre>{JSON.stringify(config, null, 2)}</pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <ChatInterface 
        chatService={chatService}
        config={config}
        isDevelopment={isDevelopment}
        conversationManager={conversationManager}
        adSearch={adSearch}
        aiProvider={aiProvider}
      />
    </div>
  );
};