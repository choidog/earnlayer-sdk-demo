import React, { useState } from 'react';
import type { AppConfig } from '../../../configuration/types';
import { ChatApplicationService } from '../../../application/services/ChatApplicationService';
import { useConversationManager } from '../../../application/hooks/conversation/useConversationManager';
import { useAdSearch } from '../../../application/hooks/advertising/useAdSearch';
import { useAIProvider } from '../../../application/hooks/ai/useAIProvider';
import { useChatViewModel } from '../../viewmodels/ChatViewModel';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { StatusPanel } from '../common/StatusPanel';
import './ChatInterface.css';

interface ChatInterfaceProps {
  chatService: ChatApplicationService;
  config: AppConfig;
  isDevelopment: boolean;
  conversationManager: ReturnType<typeof useConversationManager>;
  adSearch: ReturnType<typeof useAdSearch>;
  aiProvider: ReturnType<typeof useAIProvider>;
}

/**
 * Main chat interface component
 * Composed of smaller, focused components
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatService,
  config,
  isDevelopment,
  conversationManager,
  adSearch,
  aiProvider
}) => {
  console.log('🔧 ChatInterface rendering...');

  const [showStatusPanel, setShowStatusPanel] = useState(false);
  
  // Use chat view model for state management
  const {
    messages,
    inputValue,
    isLoading,
    error,
    messagesEndRef,
    sendMessage,
    setInputValue,
    handleKeyPress,
    resetChat,
    canSendMessage,
    hasMessages,
    getChatStats
  } = useChatViewModel(chatService);

  const handleResetChat = () => {
    resetChat();
    console.log('🔄 Chat reset from interface');
  };

  const handleToggleStatus = () => {
    setShowStatusPanel(!showStatusPanel);
  };

  return (
    <div className="chat-interface">
      <ChatHeader 
        config={config}
        conversationManager={conversationManager}
        aiProvider={aiProvider}
        onResetChat={handleResetChat}
        onToggleStatus={handleToggleStatus}
        showStatusPanel={showStatusPanel}
        isDevelopment={isDevelopment}
      />

      <div className="chat-main">
        <MessageList 
          messages={messages}
          isLoading={isLoading}
          error={error}
          messagesEndRef={messagesEndRef}
          hasMessages={hasMessages}
        />

        <MessageInput 
          value={inputValue}
          onChange={setInputValue}
          onSendMessage={sendMessage}
          onKeyPress={handleKeyPress}
          disabled={!canSendMessage}
          isLoading={isLoading}
        />
      </div>

      {isDevelopment && showStatusPanel && (
        <StatusPanel 
          isOpen={showStatusPanel}
          onClose={() => setShowStatusPanel(false)}
          chatService={chatService}
          conversationManager={conversationManager}
          adSearch={adSearch}
          aiProvider={aiProvider}
          chatStats={getChatStats()}
        />
      )}
    </div>
  );
};