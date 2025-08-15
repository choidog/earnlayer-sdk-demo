import React from 'react';
import type { AppConfig } from '../../../configuration/types';
import { useConversationManager } from '../../../application/hooks/conversation/useConversationManager';
import { useAIProvider } from '../../../application/hooks/ai/useAIProvider';

interface ChatHeaderProps {
  config: AppConfig;
  conversationManager: ReturnType<typeof useConversationManager>;
  aiProvider: ReturnType<typeof useAIProvider>;
  onResetChat: () => void;
  onToggleStatus: () => void;
  showStatusPanel: boolean;
  isDevelopment: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  config,
  conversationManager,
  aiProvider,
  onResetChat,
  onToggleStatus,
  showStatusPanel,
  isDevelopment
}) => {
  return (
    <div className="chat-header">
      <div className="header-main">
        <h1>🎯 EarnLayer SDK Demo</h1>
        <p className="header-subtitle">
          ✅ Modular Architecture - {aiProvider.providerName} Integration Active
        </p>
      </div>

      {isDevelopment && (
        <div className="debug-info">
          <details>
            <summary>🔧 Configuration & Debug Info</summary>
            <div className="debug-details">
              <div className="debug-section">
                <h4>🤖 AI Provider</h4>
                <p><strong>Provider:</strong> {config.ai.provider}</p>
                <p><strong>Status:</strong> {aiProvider.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}</p>
                <p><strong>Initialized:</strong> {aiProvider.isInitialized ? 'Yes' : 'No'}</p>
                <p><strong>Loading:</strong> {aiProvider.isLoading ? 'Yes' : 'No'}</p>
                {aiProvider.error && <p><strong>Error:</strong> {aiProvider.error}</p>}
              </div>

              <div className="debug-section">
                <h4>💬 Conversation</h4>
                <p><strong>ID:</strong> {conversationManager.conversationId || 'Not initialized'}</p>
                <p><strong>Creator:</strong> {conversationManager.creatorId}</p>
                <p><strong>Status:</strong> {conversationManager.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}</p>
                <p><strong>Auto-init:</strong> {conversationManager.autoInitialize ? 'Yes' : 'No'}</p>
                <p><strong>Backend:</strong> {conversationManager.backendInitialized ? '✅ Connected' : '❌ Local only'}</p>
              </div>

              <div className="debug-section">
                <h4>🎯 Advertising</h4>
                <p><strong>MCP URL:</strong> {config.advertising.mcpUrl}</p>
                <p><strong>Creator ID:</strong> {config.advertising.creatorId}</p>
                <p><strong>API Key:</strong> {config.advertising.apiKey ? '✅ Configured' : '❌ Missing'}</p>
                <p><strong>Auto Display Ads:</strong> {config.advertising.autoRequestDisplayAds ? 'Yes' : 'No'}</p>
              </div>

              <div className="debug-section">
                <h4>⚙️ Environment</h4>
                <p><strong>Environment:</strong> {config.environment}</p>
                <p><strong>Base URL:</strong> {config.advertising.baseUrl}</p>
                <p><strong>Timeout:</strong> {config.api.timeout}ms</p>
                <p><strong>Retry Attempts:</strong> {config.api.retryAttempts}</p>
              </div>
            </div>
          </details>
        </div>
      )}

      <div className="controls">
        <button 
          onClick={onResetChat}
          className="reset-button"
          disabled={aiProvider.isLoading}
        >
          🔄 Reset Chat
        </button>
        
        {isDevelopment && (
          <button 
            onClick={onToggleStatus}
            className={`status-button ${showStatusPanel ? 'active' : ''}`}
            disabled={aiProvider.isLoading}
          >
            {showStatusPanel ? '📊 Hide Status' : '📊 Show Status'}
          </button>
        )}
      </div>
    </div>
  );
};