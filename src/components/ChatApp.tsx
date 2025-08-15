import React, { useState, useRef, useEffect } from 'react';
import { useConversation, useMCPAds, EarnLayerAdType } from '@earnlayer/chat-ads';
import { useGeminiMCP } from '../hooks/useGeminiMCP';
import type { GeminiMCPConfig } from '../hooks/useGeminiMCP';
import { AdsStatusModal } from './AdsStatusModal';
import './ChatApp.css';

export const ChatApp: React.FC = () => {
  console.log('🔧 ChatApp component rendering...');
  
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
  }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdsModal, setShowAdsModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Configuration from environment variables
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const mcpUrl = `${baseUrl}/api/mcp/query`;
  const apiKey = import.meta.env.VITE_API_KEY || 'demo-api-key';
  const creatorId = import.meta.env.VITE_CREATOR_ID || 'd64a4899-20e4-4ecd-a53e-057aceed54cf';
  
  // Gemini MCP Configuration from environment variables
  const geminiConfig = {
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    mcpServerUrl: mcpUrl, // Use the same MCP URL as the backend
    creatorId: creatorId,
    model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-pro', // Latest Gemini 2.5 Pro model
    temperature: parseFloat(import.meta.env.VITE_GEMINI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(import.meta.env.VITE_GEMINI_MAX_TOKENS || '1000')
  };

  // Initialize conversation
  const {
    conversationId,
    isLoading: conversationLoading,
    error: conversationError,
    initializeConversation,
    isHealthy
  } = useConversation({
    baseUrl,
    creatorId,
    autoInitialize: true,
    initialConfig: {
      ad_preferences: {
        ad_types: [EarnLayerAdType.HYPERLINK, EarnLayerAdType.POPUP, EarnLayerAdType.BANNER],
        frequency: 'normal',
        revenue_vs_relevance: 0.5
      }
    }
  });

  // MCP integration
  const {
    mcpAds,
    displayAds,
    isLoading: mcpLoading,
    error: mcpError,
    searchAds,
    isHealthy: mcpHealthy
  } = useMCPAds({
    mcpUrl,
    baseUrl,
    apiKey,
    creatorId,
    conversationId: conversationId || undefined,
    autoRequestDisplayAds: true,
    defaultAdTypes: [EarnLayerAdType.HYPERLINK, EarnLayerAdType.POPUP, EarnLayerAdType.BANNER, EarnLayerAdType.VIDEO, EarnLayerAdType.THINKING]
  });

  // Gemini MCP integration
  const {
    isLoading: geminiLoading,
    error: geminiError,
    conversationId: geminiConversationId,
    lastResponse: geminiResponse,
    sendMessage: sendGeminiMessage,
    initializeConversation: initializeGeminiConversation,
    resetConversation: resetGeminiConversation
  } = useGeminiMCP({
    config: geminiConfig,
    autoInitialize: false // We'll initialize manually when needed
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !conversationId) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('🚀 Sending message to Gemini with MCP integration:', inputValue);
      
      // Send message to Gemini with MCP integration
      const geminiResult = await sendGeminiMessage(inputValue);
      
      console.log('✅ Received Gemini response:', geminiResult);

      // Create response from Gemini
      const responseText = geminiResult.content || `I understand you're asking about "${inputValue}". Here's what I found:`;

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('❌ Error sending message to Gemini:', error);
      
      // Fallback: use simple MCP response
      try {
        console.log('🔄 Falling back to MCP-only response...');
        await searchAds([inputValue]);
        
        let responseText = `I received your message: "${inputValue}". `;
        
        if (mcpAds.length > 0) {
          responseText += `I found ${mcpAds.length} relevant ads for you.`;
        } else {
          responseText += `I couldn't find any specific ads for this query.`;
        }

        const fallbackMessage = {
          id: (Date.now() + 1).toString(),
          text: responseText,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetGeminiConversation = () => {
    resetGeminiConversation();
    setMessages([]);
    console.log('🔄 Reset Gemini conversation');
  };

  return (
    <div className="chat-app">
      <div className="chat-header">
        <h1>🎯 EarnLayer SDK Demo</h1>
        <p>✅ React is working! - Gemini MCP Integration Active</p>
        
        <div className="debug-info">
          <details>
            <summary>🔧 Configuration & Debug Info</summary>
            <div className="debug-details">
              <p><strong>Backend URL:</strong> {baseUrl}</p>
              <p><strong>MCP URL:</strong> {mcpUrl}</p>
              <p><strong>API Key:</strong> {apiKey ? '✅ Configured' : '❌ Missing'}</p>
              <p><strong>Creator ID:</strong> {creatorId}</p>
              <p><strong>Gemini API Key:</strong> {geminiConfig.geminiApiKey ? '✅ Configured' : '❌ Missing'}</p>
              <p><strong>Gemini Model:</strong> {geminiConfig.model}</p>
              <p><strong>Conversation ID:</strong> {conversationId || 'Initializing...'}</p>
              <p><strong>Gemini Conversation ID:</strong> {geminiConversationId || 'Not initialized'}</p>
              <p><strong>Conversation Status:</strong> {isHealthy ? '✅ Healthy' : '❌ Unhealthy'}</p>
              <p><strong>Conversation Loading:</strong> {conversationLoading ? 'Yes' : 'No'}</p>
              <p><strong>MCP Status:</strong> {mcpHealthy ? '✅ Healthy' : '❌ Unhealthy'}</p>
              <p><strong>MCP Loading:</strong> {mcpLoading ? 'Yes' : 'No'}</p>
              <p><strong>MCP Error:</strong> {mcpError || 'None'}</p>
              <p><strong>Gemini Loading:</strong> {geminiLoading ? 'Yes' : 'No'}</p>
              <p><strong>Gemini Error:</strong> {geminiError || 'None'}</p>
              <p><strong>MCP Ads Count:</strong> {mcpAds.length}</p>
              <p><strong>Display Ads Count:</strong> {displayAds.length}</p>
              <p><strong>Status:</strong> Gemini MCP integration active - try sending a message!</p>
            </div>
          </details>
        </div>

        <div className="controls">
          <button 
            onClick={handleResetGeminiConversation}
            className="reset-button"
            disabled={isLoading}
          >
            🔄 Reset Gemini Conversation
          </button>
          
          <button 
            onClick={() => setShowAdsModal(true)}
            className="ads-status-button"
            disabled={isLoading}
          >
            🎯 Ads Status
          </button>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h3>Welcome to EarnLayer SDK Demo!</h3>
              <p>This is a Gemini-powered chat interface with MCP integration.</p>
              <p>Try sending a message to see Gemini respond with contextual ads!</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`message ${message.isUser ? 'user' : 'assistant'}`}>
              <div className="message-content">
                {message.text}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-content">
                <div className="typing-indicator">
                  <span>🤖 Gemini is thinking...</span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
        >
          {isLoading ? 'Processing...' : 'Send'}
        </button>
      </div>

      {showAdsModal && (
        <AdsStatusModal
          isOpen={showAdsModal}
          onClose={() => setShowAdsModal(false)}
          mcpAds={mcpAds}
          displayAds={displayAds}
          mcpLoading={mcpLoading}
          mcpError={mcpError}
          geminiLoading={geminiLoading}
          geminiError={geminiError}
          conversationId={conversationId}
          geminiConversationId={geminiConversationId}
        />
      )}
    </div>
  );
}; 