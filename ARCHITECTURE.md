# 🏗️ EarnLayer SDK Demo Architecture

## Overview

The EarnLayer SDK Demo is a React-based chat application that showcases advanced contextual advertising through the EarnLayer SDK. It demonstrates real-time AI conversations with Google Gemini 2.5 Pro, sophisticated MCP (Model Context Protocol) server integration for content search, and comprehensive display ad management with multi-layered fallback systems.

## 🎯 Core Architecture

### Application Stack
- **Frontend**: React 18 + TypeScript + Vite
- **AI Integration**: Google Gemini 2.5 Pro API with MCP enhancement
- **Ad Management**: EarnLayer SDK (`@earnlayer/chat-ads`) with hooks-based architecture
- **Content Search**: MCP Server integration via SDK hooks
- **UI Components**: Modular React components with Lucide React icons
- **Styling**: CSS with responsive design

### Key Components

```
src/
├── components/
│   ├── ChatApp.tsx          # Main chat interface with triple integration
│   ├── AdsStatusModal.tsx   # Advanced ads monitoring modal
│   └── ChatApp.css          # Responsive chat styling
├── hooks/
│   └── useGeminiMCP.ts      # Custom hook for Gemini+MCP integration
├── services/
│   └── GeminiMCPService.ts  # Core service handling AI and ads
└── main.tsx                 # Application entry point
```

## 🔄 Data Flow Architecture

### 1. Triple Integration Flow
```
User Input → [useConversation + useMCPAds + useGeminiMCP] → Enhanced Response + Contextual Ads
```

### 2. Detailed Flow Sequence
1. **User sends message** via ChatApp component
2. **Triple hook coordination**:
   - `useConversation`: Manages conversation lifecycle and preferences
   - `useMCPAds`: Searches MCP server for relevant ads and content
   - `useGeminiMCP`: Handles Gemini AI integration with MCP context
3. **Primary path**: Gemini processes user message with MCP-enhanced context
4. **Fallback path**: If Gemini fails, falls back to MCP-only response
5. **Final fallback**: Generic error response with user message acknowledgment
6. **UI update** with message display and optional ads modal

## 🧩 Component Architecture

### ChatApp Component (`src/components/ChatApp.tsx`)
**Purpose**: Main UI component managing chat interface with triple SDK integration

**Key Features**:
- **Triple Hook Integration**: `useConversation`, `useMCPAds`, and `useGeminiMCP`
- **Environment-based Configuration**: Dynamic URL and API key configuration
- **Layered Error Handling**: Primary Gemini → Fallback MCP → Final error response
- **Advanced Debug Panel**: Collapsible configuration and status information
- **Interactive Controls**: Reset conversation and ads status modal buttons
- **Responsive UI**: Clean message interface with real-time status updates

**Dependencies**:
```typescript
import { useConversation, useMCPAds, EarnLayerAdType } from '@earnlayer/chat-ads';
import { useGeminiMCP } from '../hooks/useGeminiMCP';
import { AdsStatusModal } from './AdsStatusModal';
```

### AdsStatusModal Component (`src/components/AdsStatusModal.tsx`)
**Purpose**: Advanced modal for monitoring ads and integration status

**Key Features**:
- **System Status Dashboard**: Conversation IDs, health checks, loading states
- **Integration Monitoring**: Real-time MCP and Gemini status with visual indicators
- **Ads Inspection**: Detailed view of MCP ads and display ads with metadata
- **Error Display**: Comprehensive error information for debugging
- **Responsive Design**: Clean modal interface with Lucide React icons

**Visual Elements**:
- Status icons (loading spinners, error alerts, success checks)
- Color-coded status badges
- Collapsible ad details with similarity scores
- Interactive close/navigation controls

### useGeminiMCP Hook (`src/hooks/useGeminiMCP.ts`)
**Purpose**: React hook providing state management for Gemini+MCP integration

**Capabilities**:
- **Dynamic Service Management**: Auto-recreates service when model configuration changes
- **Conversation Lifecycle**: Initialize, track, and reset Gemini conversations
- **Error Resilience**: Comprehensive error handling with state recovery
- **Manual Control**: Flexible initialization (auto vs manual)

**Interface**:
```typescript
interface UseGeminiMCPReturn {
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  lastResponse: GeminiMCPResponse | null;
  sendMessage: (message: string) => Promise<GeminiMCPResponse>;
  initializeConversation: () => Promise<string>;
  resetConversation: () => void;
  service: GeminiMCPService | null;
}
```

### GeminiMCPService (`src/services/GeminiMCPService.ts`)
**Purpose**: Core service orchestrating AI responses and ad integration

**Enhanced Features**:
- **MCP-First Architecture**: Always queries MCP server before Gemini for context
- **Advanced Prompt Engineering**: Builds enhanced messages with content and ads context
- **Gemini API Integration**: Direct API calls with configurable models and parameters
- **Graceful Degradation**: Returns fallback responses when Gemini API fails
- **Comprehensive Logging**: Detailed console output for debugging integration flow

**Key Methods**:
- `initializeConversation()`: Creates UUID-based conversation tracking
- `sendMessage()`: Orchestrates MCP search → context enhancement → Gemini API call
- `buildEnhancedMessage()`: Constructs context-rich prompts with ads and content
- `callGeminiAPI()`: Direct Gemini API integration with thinking config

**Configuration**:
```typescript
interface GeminiMCPConfig {
  geminiApiKey: string;
  mcpServerUrl: string;
  creatorId: string;
  model?: string;          // Default: 'gemini-2.5-pro'
  temperature?: number;    // Default: 0.7
  maxTokens?: number;      // Default: 1000
}
```

## 🔗 External Integrations

### Gemini AI Integration
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- **Model**: gemini-2.5-pro (environment configurable)
- **Advanced Features**: 
  - Context enhancement with MCP content
  - Temperature and token control
  - Thinking config with budget = 0
  - Comprehensive error handling
- **Security**: API key masking in logs for security

### MCP Server Integration
- **Purpose**: Vector search for relevant content and contextual ads
- **URL**: Dynamic backend URL construction (`${baseUrl}/api/mcp/query`)
- **Response Format**: Structured ads and content with similarity scores
- **Features**: Creator-specific content, conversation tracking, auto-display ad requests

### EarnLayer SDK Integration
- **Package**: `@earnlayer/chat-ads`
- **Hook-based Architecture**: `useConversation`, `useMCPAds`
- **Components**: Advanced ad display and status monitoring
- **Ad Types**: HYPERLINK, POPUP, BANNER, VIDEO, THINKING
- **Features**: 
  - Auto-initialization with preferences
  - Health monitoring
  - Impression tracking
  - Error resilience

## 🛠️ Development Architecture

### Build System
- **Bundler**: Vite 5.0+ with React plugin
- **TypeScript**: Full type safety with strict configuration  
- **Hot Reload**: Real-time development with instant updates
- **Port**: 3000 (configured in vite.config.ts with host: true)
- **Icons**: Lucide React for consistent iconography

### Local Development Setup
```bash
# SDK Development (linked via npm link)
earnlayer-sdk/
├── src/           # SDK source code
├── dist/          # Built SDK (auto-generated)
└── build:watch    # Auto-rebuild on changes

# Demo Development
earnlayer-sdk-demo/
├── npm link @earnlayer/chat-ads  # Link to local SDK
└── npm run dev                   # Start development server
```

### Environment Configuration
**Environment Variables**:
```bash
# Core Configuration
VITE_BACKEND_URL=http://localhost:8000                    # Backend base URL
VITE_API_KEY=demo-api-key                                 # API authentication
VITE_CREATOR_ID=d64a4899-20e4-4ecd-a53e-057aceed54cf      # Creator identifier

# Gemini Integration
VITE_GEMINI_API_KEY=your_api_key_here                     # Gemini API access
VITE_GEMINI_MODEL=gemini-2.5-pro                          # Model selection
VITE_GEMINI_TEMPERATURE=0.7                               # Response creativity
VITE_GEMINI_MAX_TOKENS=1000                               # Response length limit
```

**Development vs Production**:
- **Development**: Local PostgreSQL and backend (`http://localhost:8000`)
- **Production**: Railway deployments with cloud database
- **MCP URL**: Dynamically constructed as `${VITE_BACKEND_URL}/api/mcp/query`

## 📊 State Management

### Component State (ChatApp)
```typescript
const [messages, setMessages] = useState<Array<{     // Simplified message structure
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}>>([]);
const [inputValue, setInputValue] = useState('');    // Current input
const [isLoading, setIsLoading] = useState(false);   // Message processing state
const [showAdsModal, setShowAdsModal] = useState(false);  // Modal visibility
```

### Hook-based State Management
```typescript
// Triple hook integration for comprehensive functionality
const { conversationId, isLoading: conversationLoading, isHealthy } = useConversation({...});
const { mcpAds, displayAds, isLoading: mcpLoading, searchAds } = useMCPAds({...});
const { sendMessage: sendGeminiMessage, error: geminiError } = useGeminiMCP({...});
```

### Configuration Management
```typescript
// Environment-driven configuration
const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const mcpUrl = `${baseUrl}/api/mcp/query`;
const geminiConfig = {
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  mcpServerUrl: mcpUrl,
  model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-pro',
  // ... other configurable parameters
};
```

## 🎨 UI Architecture

### Layout Structure
```
┌─────────────────────────────────────────────┐
│ Header: Title + Debug Panel + Controls      │
│ ├─ EarnLayer SDK Demo                       │
│ ├─ Collapsible Debug Info                   │
│ └─ [Reset] [Ads Status] Buttons             │
├─────────────────────────────────────────────┤
│ Messages Area (Full Width)                  │
│ ├─ Welcome message (when empty)             │
│ ├─ User/Assistant message bubbles           │
│ ├─ Typing indicator ("🤖 Gemini thinking")  │
│ └─ Auto-scroll to bottom                    │
├─────────────────────────────────────────────┤
│ Input Area: Text Field + Send Button        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ AdsStatusModal (Overlay)                    │
│ ├─ System Status (IDs, Health, Counts)     │
│ ├─ Integration Status (MCP + Gemini)        │
│ ├─ MCP Ads Details (with similarity %)     │
│ └─ Display Ads Details (with metadata)     │
└─────────────────────────────────────────────┘
```

### Design Philosophy
- **Clean Interface**: Streamlined chat without sidebar distractions
- **Debug-Friendly**: Comprehensive status information in collapsible panel
- **Modal-based Ads**: Dedicated overlay for ads inspection rather than inline display
- **Responsive**: Single-column layout adapts to all screen sizes

## 🔄 Error Handling & Resilience

### Triple-Layer Fallback Strategy
```typescript
// Primary: Gemini with MCP context
try {
  const geminiResult = await sendGeminiMessage(inputValue);
  // Use Gemini response
} catch (error) {
  // Fallback 1: MCP-only response
  try {
    await searchAds([inputValue]);
    // Generate response mentioning found ads
  } catch (fallbackError) {
    // Fallback 2: Generic error response
    // Display error message with user input acknowledgment
  }
}
```

### Error Handling Layers
1. **Gemini Service Level**: API errors, invalid responses, rate limiting
2. **MCP Integration Level**: Network failures, malformed responses
3. **Hook Level**: State management errors, configuration issues
4. **UI Level**: User feedback, loading states, error display

### Resilience Features
- **Graceful Degradation**: Always provides some response to user
- **Comprehensive Logging**: Detailed console output for debugging
- **Status Monitoring**: Real-time health checks via AdsStatusModal
- **Configuration Fallbacks**: Default values for missing environment variables

## 🚀 Performance Optimizations

### Rendering Optimizations
- **Message Virtualization**: Efficient rendering for long conversations
- **Component Memoization**: React.memo for stable components
- **State Batching**: Grouped state updates
- **Auto-scrolling**: Smooth scroll to latest messages

### Network Optimizations
- **Request Debouncing**: Prevent rapid API calls
- **Response Caching**: Store recent responses
- **Lazy Loading**: On-demand ad loading
- **Error Recovery**: Exponential backoff for retries

## 🧪 Testing Architecture

### Test Files
- `test-local-sdk.js`: SDK integration verification
- `test-gemini-integration.js`: AI service testing
- `test-frontend-integration.js`: Component testing

### Testing Strategies
- **Unit Tests**: Individual component testing
- **Integration Tests**: Service interaction testing
- **E2E Tests**: Full user flow testing
- **Manual Testing**: Interactive demo validation

---

This architecture enables a scalable, maintainable chat application with sophisticated ad integration while maintaining clean separation of concerns and robust error handling.