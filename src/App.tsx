import React from 'react';
import { ChatContainer } from './presentation/containers/ChatContainer';
import './App.css';

/**
 * Main application component
 * Uses the new modular architecture with container/component pattern
 */
function App() {
  console.log('🚀 EarnLayer SDK Demo starting with new modular architecture');

  return (
    <div className="App">
      <ChatContainer />
    </div>
  );
}

export default App;
