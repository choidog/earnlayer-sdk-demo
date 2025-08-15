import React from 'react';
import { ChatApplicationService } from '../../../application/services/ChatApplicationService';
import { useConversationManager } from '../../../application/hooks/conversation/useConversationManager';
import { useAdSearch } from '../../../application/hooks/advertising/useAdSearch';
import { useAIProvider } from '../../../application/hooks/ai/useAIProvider';

interface StatusPanelProps {
  isOpen: boolean;
  onClose: () => void;
  chatService: ChatApplicationService;
  conversationManager: ReturnType<typeof useConversationManager>;
  adSearch: ReturnType<typeof useAdSearch>;
  aiProvider: ReturnType<typeof useAIProvider>;
  chatStats: {
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    averageResponseTime: number;
    hasError: boolean;
  };
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  isOpen,
  onClose,
  chatService,
  conversationManager,
  adSearch,
  aiProvider,
  chatStats
}) => {
  if (!isOpen) return null;

  const getStatusIcon = (isHealthy: boolean) => {
    return isHealthy ? '✅' : '❌';
  };

  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy ? 'status-healthy' : 'status-unhealthy';
  };

  return (
    <div className="status-panel-overlay">
      <div className="status-panel">
        <div className="status-header">
          <h2>📊 System Status</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="status-content">
          {/* AI Provider Status */}
          <div className="status-section">
            <h3>🤖 AI Provider Status</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="label">Provider:</span>
                <span className="value">{aiProvider.providerName}</span>
              </div>
              <div className="status-item">
                <span className="label">Status:</span>
                <span className={`value ${getStatusColor(aiProvider.isHealthy)}`}>
                  {getStatusIcon(aiProvider.isHealthy)} {aiProvider.isHealthy ? 'Healthy' : 'Unhealthy'}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Initialized:</span>
                <span className="value">{aiProvider.isInitialized ? 'Yes' : 'No'}</span>
              </div>
              <div className="status-item">
                <span className="label">Loading:</span>
                <span className="value">{aiProvider.isLoading ? 'Yes' : 'No'}</span>
              </div>
              {aiProvider.error && (
                <div className="status-item error">
                  <span className="label">Error:</span>
                  <span className="value">{aiProvider.error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Conversation Status */}
          <div className="status-section">
            <h3>💬 Conversation Status</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="label">Conversation ID:</span>
                <span className="value mono">{conversationManager.conversationId || 'None'}</span>
              </div>
              <div className="status-item">
                <span className="label">Creator ID:</span>
                <span className="value mono">{conversationManager.creatorId}</span>
              </div>
              <div className="status-item">
                <span className="label">Status:</span>
                <span className={`value ${getStatusColor(conversationManager.isHealthy)}`}>
                  {getStatusIcon(conversationManager.isHealthy)} {conversationManager.isHealthy ? 'Healthy' : 'Unhealthy'}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Backend Connected:</span>
                <span className="value">{conversationManager.backendInitialized ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Ad Search Status */}
          <div className="status-section">
            <h3>🎯 Ad Search Status</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="label">Status:</span>
                <span className={`value ${getStatusColor(adSearch.isHealthy)}`}>
                  {getStatusIcon(adSearch.isHealthy)} {adSearch.isHealthy ? 'Healthy' : 'Unhealthy'}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Current Ads:</span>
                <span className="value">{adSearch.adCount}</span>
              </div>
              <div className="status-item">
                <span className="label">Last Search:</span>
                <span className="value">
                  {adSearch.lastSearchTimestamp 
                    ? adSearch.lastSearchTimestamp.toLocaleTimeString()
                    : 'Never'
                  }
                </span>
              </div>
              <div className="status-item">
                <span className="label">Response Time:</span>
                <span className="value">
                  {adSearch.lastResponseTime ? `${adSearch.lastResponseTime}ms` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Chat Statistics */}
          <div className="status-section">
            <h3>📈 Chat Statistics</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="label">Total Messages:</span>
                <span className="value">{chatStats.totalMessages}</span>
              </div>
              <div className="status-item">
                <span className="label">User Messages:</span>
                <span className="value">{chatStats.userMessages}</span>
              </div>
              <div className="status-item">
                <span className="label">AI Messages:</span>
                <span className="value">{chatStats.assistantMessages}</span>
              </div>
              <div className="status-item">
                <span className="label">Avg Response Time:</span>
                <span className="value">
                  {chatStats.averageResponseTime > 0 
                    ? `${Math.round(chatStats.averageResponseTime)}ms` 
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Provider Capabilities */}
          {aiProvider.capabilities && (
            <div className="status-section">
              <h3>⚡ Provider Capabilities</h3>
              <div className="status-grid">
                <div className="status-item">
                  <span className="label">Streaming:</span>
                  <span className="value">{aiProvider.capabilities.streaming ? 'Yes' : 'No'}</span>
                </div>
                <div className="status-item">
                  <span className="label">Multimodal:</span>
                  <span className="value">{aiProvider.capabilities.multimodal ? 'Yes' : 'No'}</span>
                </div>
                <div className="status-item">
                  <span className="label">Function Calling:</span>
                  <span className="value">{aiProvider.capabilities.functionCalling ? 'Yes' : 'No'}</span>
                </div>
                <div className="status-item">
                  <span className="label">Max Tokens:</span>
                  <span className="value">{aiProvider.capabilities.maxTokens || 'Unlimited'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Current Ads */}
          {adSearch.hasAds && (
            <div className="status-section">
              <h3>🎯 Current Ads ({adSearch.adCount})</h3>
              <div className="ads-list">
                {adSearch.ads.map((ad, index) => (
                  <div key={index} className="ad-item">
                    <div className="ad-title">{ad.title}</div>
                    <div className="ad-meta">
                      <span className="ad-type">{ad.ad_type}</span>
                      <span className="ad-similarity">{(ad.similarity * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};