import React from 'react';
import { X, AlertCircle, Clock, CheckCircle, Loader2 } from 'lucide-react';

interface AdsStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  mcpAds: any[];
  displayAds: any[];
  mcpLoading: boolean;
  mcpError: string | null;
  geminiLoading: boolean;
  geminiError: string | null;
  conversationId: string | null;
  geminiConversationId: string | null;
}

export const AdsStatusModal: React.FC<AdsStatusModalProps> = ({ 
  isOpen, 
  onClose,
  mcpAds,
  displayAds,
  mcpLoading,
  mcpError,
  geminiLoading,
  geminiError,
  conversationId,
  geminiConversationId
}) => {
  if (!isOpen) return null;

  const getStatusIcon = (status: 'idle' | 'loading' | 'error' | 'success') => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: 'idle' | 'loading' | 'error' | 'success') => {
    const variants = {
      idle: 'secondary' as const,
      loading: 'default' as const,
      error: 'destructive' as const,
      success: 'default' as const,
    };
    return variants[status];
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  const getMCPStatus = () => {
    if (mcpLoading) return 'loading';
    if (mcpError) return 'error';
    if (mcpAds.length > 0) return 'success';
    return 'idle';
  };

  const getGeminiStatus = () => {
    if (geminiLoading) return 'loading';
    if (geminiError) return 'error';
    if (geminiConversationId) return 'success';
    return 'idle';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">🎯</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ads Status Panel</h2>
              <p className="text-sm text-gray-600">Current ads state and integration status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* System Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Conversation ID</div>
                <div className="font-mono text-sm text-gray-900 mt-1">
                  {conversationId || 'None'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Gemini Conversation ID</div>
                <div className="font-mono text-sm text-gray-900 mt-1">
                  {geminiConversationId || 'None'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total Ads</div>
                <div className="font-semibold text-green-600 mt-1">
                  {mcpAds.length + displayAds.length}
                </div>
              </div>
            </div>
          </div>

          {/* Integration Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Integration Status</h3>
            <div className="space-y-4">
              {/* MCP Integration */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(getMCPStatus())}
                    <h4 className="font-medium text-gray-900">MCP Integration</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getMCPStatus() === 'success' ? 'bg-green-100 text-green-800' :
                      getMCPStatus() === 'error' ? 'bg-red-100 text-red-800' :
                      getMCPStatus() === 'loading' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getMCPStatus()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">MCP Ads Count</div>
                    <div className="font-semibold">{mcpAds.length}</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-600">Display Ads Count</div>
                    <div className="font-semibold">{displayAds.length}</div>
                  </div>
                  
                  {mcpError && (
                    <div>
                      <div className="text-gray-600">Error</div>
                      <div className="text-red-600 font-mono break-all">{mcpError}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Gemini Integration */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(getGeminiStatus())}
                    <h4 className="font-medium text-gray-900">Gemini Integration</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getGeminiStatus() === 'success' ? 'bg-green-100 text-green-800' :
                      getGeminiStatus() === 'error' ? 'bg-red-100 text-red-800' :
                      getGeminiStatus() === 'loading' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getGeminiStatus()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Conversation ID</div>
                    <div className="font-mono text-xs">{geminiConversationId || 'Not initialized'}</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-600">Status</div>
                    <div className="font-semibold">
                      {geminiLoading ? 'Processing...' : 
                       geminiError ? 'Error' : 
                       geminiConversationId ? 'Active' : 'Idle'}
                    </div>
                  </div>
                  
                  {geminiError && (
                    <div>
                      <div className="text-gray-600">Error</div>
                      <div className="text-red-600 font-mono break-all">{geminiError}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* MCP Ads */}
          {mcpAds.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">MCP Ads ({mcpAds.length})</h3>
              <div className="space-y-3">
                {mcpAds.map((ad, index) => (
                  <div key={index} className="bg-gray-50 rounded p-3">
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Title:</span> {ad.title}</div>
                      <div><span className="font-medium">Description:</span> {ad.description}</div>
                      <div><span className="font-medium">Type:</span> 
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {ad.ad_type || 'hyperlink'}
                        </span>
                      </div>
                      <div><span className="font-medium">URL:</span> 
                        <a href={ad.url} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline ml-1">
                          {ad.url}
                        </a>
                      </div>
                      {ad.similarity && (
                        <div><span className="font-medium">Similarity:</span> 
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {(ad.similarity * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display Ads */}
          {displayAds.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Display Ads ({displayAds.length})</h3>
              <div className="space-y-3">
                {displayAds.map((ad, index) => (
                  <div key={index} className="bg-gray-50 rounded p-3">
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Title:</span> {ad.title}</div>
                      <div><span className="font-medium">Description:</span> {ad.description}</div>
                      <div><span className="font-medium">Type:</span> 
                        <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                          {ad.ad_type || 'display'}
                        </span>
                      </div>
                      <div><span className="font-medium">URL:</span> 
                        <a href={ad.url} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline ml-1">
                          {ad.url}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Ads Message */}
          {mcpAds.length === 0 && displayAds.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">No ads available</div>
              <div className="text-gray-500 text-sm">Send a message to see ads in action!</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 