import React from 'react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled: boolean;
  isLoading: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSendMessage,
  onKeyPress,
  disabled,
  isLoading
}) => {
  return (
    <div className="message-input">
      <div className="input-container">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          className="message-input-field"
        />
        <button 
          onClick={onSendMessage}
          disabled={disabled}
          className={`send-button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? (
            <span className="loading-spinner">⏳</span>
          ) : (
            <span>Send</span>
          )}
        </button>
      </div>
      
      {isLoading && (
        <div className="input-status">
          <span className="processing-text">Processing your message...</span>
        </div>
      )}
    </div>
  );
};