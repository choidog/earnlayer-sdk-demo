import React from 'react';
import type { ChatMessage } from '../../viewmodels/ChatViewModel';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  hasMessages: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  error,
  messagesEndRef,
  hasMessages
}) => {
  return (
    <div className="message-list">
      {!hasMessages && (
        <div className="welcome-message">
          <h3>Welcome to EarnLayer SDK Demo!</h3>
          <p>This is a modular chat interface powered by pluggable AI providers.</p>
          <p>Try sending a message to see contextual ads in action!</p>
          <div className="example-queries">
            <p><strong>Try asking about:</strong></p>
            <ul>
              <li>"Tell me about AI tools"</li>
              <li>"What are the best productivity apps?"</li>
              <li>"How can I improve my coding skills?"</li>
              <li>"What's new in technology?"</li>
            </ul>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div key={message.id} className={`message ${message.isUser ? 'user' : 'assistant'}`}>
          <div className="message-content">
            {message.text}
          </div>
          <div className="message-metadata">
            <span className="message-time">
              {message.timestamp.toLocaleTimeString()}
            </span>
            {!message.isUser && message.metadata && (
              <span className="message-info">
                {message.metadata.source && (
                  <span className="source">via {message.metadata.source}</span>
                )}
                {message.metadata.responseTime && (
                  <span className="response-time">
                    ({message.metadata.responseTime}ms)
                  </span>
                )}
                {message.metadata.adCount !== undefined && (
                  <span className="ad-count">
                    {message.metadata.adCount} ads
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <TypingIndicator />
      )}

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};