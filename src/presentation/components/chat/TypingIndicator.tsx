import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="message assistant">
      <div className="message-content">
        <div className="typing-indicator">
          <span className="typing-text">🤖 AI is thinking...</span>
          <div className="typing-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>
    </div>
  );
};