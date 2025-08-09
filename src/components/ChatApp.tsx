import React, { useState, useEffect, useRef } from 'react';
import { 
  MCPClient, 
  EarnLayerAdService, 
  AdDisplay, 
  MCPAdDisplay,
  DisplayAdComponent,
  useMCPAds,
  EarnLayerAdType
} from '@earnlayer/chat-ads';
import type { MCPResponse, DisplayAd } from '@earnlayer/chat-ads';
import './ChatApp.css';

// Initialize SDK services
const mcpClient = new MCPClient({
  mcpUrl: 'https://earnlayer-mcp-server-production.up.railway.app/mcp',
  apiKey: 'demo-api-key' // Replace with real API key
});

const adService = new EarnLayerAdService({
  mcpClient,
  displayApiUrl: 'https://your-backend.com' // Replace with real backend URL
});

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  mcpResponse?: MCPResponse;
  displayAds?: DisplayAd[];
}

export const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Demo conversation ID
  const conversationId = 'demo-conversation-123';
  const creatorId = 'demo-creator-456';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = async (userMessage: string): Promise<{ text: string; mcpResponse: MCPResponse; displayAds: DisplayAd[] }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate contextual AI response based on user input
    const responses = [
      `I understand you're asking about "${userMessage}". Let me help you with that!`,
      `Great question about "${userMessage}"! Here's what I found for you.`,
      `Based on your query "${userMessage}", I have some relevant information to share.`,
      `I've researched "${userMessage}" and here are the key insights.`
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    // Simulate MCP response with contextual ads
    const mockMcpResponse: MCPResponse = {
      result: {
        content: [{
          query: userMessage,
          ads: [
            {
              title: 'AI Tools Newsletter',
              url: 'https://example.com/ai-tools',
              content: 'Get the latest AI tools and updates',
              similarity: 0.85
            },
            {
              title: 'Productivity Apps',
              url: 'https://example.com/productivity',
              content: 'Boost your productivity with these apps',
              similarity: 0.78
            }
          ],
          content: [
            {
              title: 'AI Development Guide',
              content: 'Learn how to build AI applications',
              similarity: 0.92
            }
          ]
        }]
      }
    };

    // Simulate display ads
    const mockDisplayAds: DisplayAd[] = [
      {
        ad_id: `ad-${Date.now()}`,
        title: 'Premium AI Tools',
        description: 'Access advanced AI features and tools',
        url: 'https://example.com/premium',
        ad_type: EarnLayerAdType.POPUP,
        placement: 'sidebar',
        similarity: 0.9,
        source: 'contextual',
        impression_id: `imp-${Date.now()}`
      },
      {
        ad_id: `ad-${Date.now() + 1}`,
        title: 'Developer Resources',
        description: 'Essential tools for developers',
        url: 'https://example.com/dev-resources',
        ad_type: EarnLayerAdType.BANNER,
        placement: 'sidebar',
        similarity: 0.82,
        source: 'contextual',
        impression_id: `imp-${Date.now() + 1}`
      }
    ];

    return {
      text: randomResponse,
      mcpResponse: mockMcpResponse,
      displayAds: mockDisplayAds
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Simulate AI response with ads
      const aiResponse = await simulateAIResponse(inputValue);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        mcpResponse: aiResponse.mcpResponse,
        displayAds: aiResponse.displayAds
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error processing your message. Please try again.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAdClick = (ad: DisplayAd) => {
    console.log('Ad clicked:', ad);
    // In a real app, you'd track this click
    window.open(ad.url, '_blank', 'noopener,noreferrer');
  };

  const handleAdError = (error: string) => {
    console.error('Ad error:', error);
  };

  return (
    <div className="chat-app">
      <div className="chat-header">
        <h1>EarnLayer Chat Demo</h1>
        <p>Powered by @earnlayer/chat-ads SDK</p>
        <div className="chat-info">
          <span>Conversation ID: {conversationId}</span>
          <span>Creator ID: {creatorId}</span>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h3>Welcome to EarnLayer Chat Demo!</h3>
              <p>This demo showcases the @earnlayer/chat-ads SDK in action.</p>
              <p>Try asking about:</p>
              <ul>
                <li>"Tell me about AI tools"</li>
                <li>"What are the best productivity apps?"</li>
                <li>"How can I improve my coding skills?"</li>
                <li>"What's new in technology?"</li>
              </ul>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="message-container">
              <div className={`message ${message.isUser ? 'user' : 'assistant'}`}>
                <div className="message-content">
                  {message.text}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {/* Display MCP ads for assistant messages */}
              {!message.isUser && message.mcpResponse && (
                <div className="mcp-ads-section">
                  <h4>📎 Relevant Links (MCP Ads)</h4>
                  <MCPAdDisplay mcpResponse={message.mcpResponse} />
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="message assistant">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-sidebar">
          <h3>🎯 Display Ads</h3>
          <div className="ads-container">
            {messages
              .filter(msg => !msg.isUser && msg.displayAds)
              .flatMap(msg => msg.displayAds || [])
              .map((ad) => (
                <DisplayAdComponent
                  key={ad.ad_id}
                  ad={ad}
                  onAdClick={handleAdClick}
                  onAdError={handleAdError}
                />
              ))}
          </div>
          
          {messages.filter(msg => !msg.isUser && msg.displayAds).length === 0 && (
            <div className="no-ads-message">
              <p>No ads to display yet.</p>
              <p>Send a message to see contextual ads!</p>
            </div>
          )}
        </div>
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button 
          onClick={handleSendMessage}
          disabled={loading || !inputValue.trim()}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}; 