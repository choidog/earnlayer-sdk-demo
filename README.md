# 🎯 EarnLayer SDK Demo

A comprehensive demo showcasing the EarnLayer SDK with integrated conversation management, MCP ads, and display ads.

## 🚀 Quick Start

### Environment Setup

1. **Configure Environment Variables**:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your Gemini API key
   nano .env
   ```

2. **Add Your Gemini API Key**:
   ```bash
   # In .env file, replace:
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

### Local Development Setup

The demo is configured for local development with the earnlayer-sdk:

```bash
# 1. Start the SDK in watch mode (in earnlayer-sdk directory)
cd ../earnlayer-sdk
npm run build:watch

# 2. Start the demo (in this directory)
npm run dev
```

### Access the Demo

- **Demo URL**: http://localhost:5173
- **Backend API**: http://localhost:8000 (if running)
- **MCP Server**: http://localhost:8001 (if running)

## ✨ Features

### True Gemini MCP Integration
- ✅ **Gemini AI**: Real AI conversations with contextual responses
- ✅ **MCP Server**: Vector search through your content database
- ✅ **Context Enhancement**: Gemini gets relevant ads/content before responding
- ✅ **Affiliate Integration**: Real affiliate codes and tracking
- ✅ **Fallback System**: Works even without API keys
- ✅ **Complete Logging**: All API calls and MCP interactions logged

### Integrated Chat Flow
- ✅ **Conversation Management**: Automatic conversation initialization
- ✅ **MCP Integration**: Hyperlink ads from MCP responses
- ✅ **Display Ads**: Popup, banner, video, thinking ads via API
- ✅ **Auto-Integration**: Display ads requested after MCP responses
- ✅ **Impression Tracking**: Built-in analytics
- ✅ **Error Handling**: Connection status and error display

### Real-time Development
- ✅ **Hot Reload**: SDK changes reflect immediately
- ✅ **TypeScript Support**: Full type safety
- ✅ **Local Development**: No deployment cycles needed

## 🎯 Demo Features

### Chat Interface
- Real-time messaging with AI responses
- Contextual ad display based on user messages
- Conversation history with ad tracking

### Ad Display
- **MCP Ads**: Hyperlink ads from MCP responses
- **Display Ads**: Sponsored content via API
- **Sidebar**: Current ads display
- **Analytics**: Impression and click tracking

### Status Monitoring
- Connection health indicators
- Display ad availability
- Error handling and retry functionality

## 🔧 Configuration

### Environment Variables

The demo uses environment variables for configuration. See `.env.example` for all available options:

```bash
# Required for full functionality
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Backend and MCP configuration
VITE_BACKEND_URL=http://localhost:8000
VITE_MCP_SERVER_URL=http://localhost:8001/mcp
VITE_CREATOR_ID=d64a4899-20e4-4ecd-a53e-057aceed54cf

# Gemini model configuration
VITE_GEMINI_MODEL=gemini-2.0-flash-exp
VITE_GEMINI_TEMPERATURE=0.7
VITE_GEMINI_MAX_TOKENS=1000
```

### Default Connections
- **Backend**: `http://localhost:8000`
- **MCP Server**: `http://localhost:8001`
- **Creator ID**: `d64a4899-20e4-4ecd-a53e-057aceed54cf`

## 🧪 Testing

### Test Local SDK Setup
```bash
node test-local-sdk.js
```

### Try These Messages
- "Tell me about AI tools"
- "What are the best productivity apps?"
- "How can I improve my coding skills?"
- "What's new in technology?"

## 📚 Documentation

- [Local Development Setup Guide](./LOCAL_DEVELOPMENT_SETUP.md)
- [SDK Documentation](../earnlayer-sdk/README.md)
- [API Reference](../earnlayer-sdk/README.md#api-reference)

## 🛠️ Development

### Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### File Structure
```
src/
├── components/
│   ├── ChatApp.tsx      # Main chat component
│   └── ChatApp.css      # Chat styles
├── main.tsx             # App entry point
└── index.css            # Global styles
```

## 🎉 What's New

### Latest Updates
- ✅ **Integrated SDK**: Uses new conversation management
- ✅ **Display Ads API**: Real display ads via API
- ✅ **Auto-Integration**: Seamless MCP + display ads
- ✅ **Local Development**: Real-time development setup
- ✅ **Error Handling**: Comprehensive error management

### Key Improvements
- Real conversation management instead of mock data
- Actual API integration for display ads
- Automatic display ad requests after MCP responses
- Better error handling and status display
- Local development workflow

## 🔗 Related

- [EarnLayer SDK](../earnlayer-sdk/) - The main SDK package
- [Backend API](../../EarnLayer-Spec/earnlayer-backend/) - Backend services
- [MCP Server](../../EarnLayer-Spec/mcp-server/) - MCP server implementation

---

**EarnLayer SDK Demo** - Showcasing the future of contextual ads in chat applications! 🚀
