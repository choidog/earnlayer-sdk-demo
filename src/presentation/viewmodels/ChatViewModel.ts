import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatApplicationService } from '../../application/services/ChatApplicationService';
import type { ChatMessageResult } from '../../application/services/ChatApplicationService';

/**
 * View model for chat interface state management
 */
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: {
    source?: string;
    responseTime?: number;
    adCount?: number;
    [key: string]: any;
  };
}

export const useChatViewModel = (chatService: ChatApplicationService) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 ChatViewModel: Sending message:', inputValue);
      
      const result = await chatService.sendMessage(inputValue);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: result.content,
        isUser: false,
        timestamp: new Date(),
        metadata: {
          source: result.source,
          responseTime: result.responseTime,
          adCount: result.ads.length,
          strategy: result.metadata.strategy
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      console.log(`✅ ChatViewModel: Message processed (${result.responseTime}ms)`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
        isUser: false,
        timestamp: new Date(),
        metadata: {
          source: 'error',
          isError: true
        }
      };

      setMessages(prev => [...prev, errorChatMessage]);
      console.error('❌ ChatViewModel: Message failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, chatService]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    console.log('🔄 ChatViewModel: Messages cleared');
  }, []);

  const resetChat = useCallback(() => {
    clearMessages();
    chatService.resetConversation();
    console.log('🔄 ChatViewModel: Chat reset');
  }, [chatService, clearMessages]);

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.isUser);
    if (lastUserMessage) {
      setInputValue(lastUserMessage.text);
    }
  }, [messages]);

  const getChatStats = useCallback(() => {
    const userMessages = messages.filter(msg => msg.isUser);
    const assistantMessages = messages.filter(msg => !msg.isUser);
    const averageResponseTime = assistantMessages
      .filter(msg => msg.metadata?.responseTime)
      .reduce((sum, msg) => sum + (msg.metadata!.responseTime || 0), 0) / assistantMessages.length;

    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      averageResponseTime: averageResponseTime || 0,
      hasError: error !== null
    };
  }, [messages, error]);

  return {
    // State
    messages,
    inputValue,
    isLoading,
    error,
    messagesEndRef,
    
    // Actions
    sendMessage,
    setInputValue,
    handleKeyPress,
    clearMessages,
    resetChat,
    retryLastMessage,
    
    // Computed values
    canSendMessage: inputValue.trim().length > 0 && !isLoading,
    hasMessages: messages.length > 0,
    getChatStats
  };
};