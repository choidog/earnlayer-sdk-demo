# 🔄 Migration Guide: From Legacy to Modular Architecture

## Overview

This guide helps you migrate from the legacy ChatApp implementation to the new modular, domain-driven architecture. The new system provides better maintainability, testability, and extensibility.

## 🏗️ What Changed

### Architecture Transformation
```
OLD (Legacy):                    NEW (Modular):
┌─ ChatApp.tsx ─┐               ┌─ Infrastructure ─┐
│ - Config mgmt │               │ - Providers      │
│ - State mgmt  │               │ - Repositories   │
│ - AI logic    │               └─────────────────┘
│ - Ad logic    │               ┌─ Domain ────────┐
│ - UI rendering│               │ - AI             │
│ - Error handle│               │ - Advertising    │
└───────────────┘               │ - Conversation   │
                                └─────────────────┘
                                ┌─ Application ───┐
                                │ - Use cases      │
                                │ - Hooks          │
                                │ - Services       │
                                └─────────────────┘
                                ┌─ Presentation ──┐
                                │ - Components     │
                                │ - Containers     │
                                │ - View models    │
                                └─────────────────┘
```

### Key Changes
1. **Configuration**: Centralized in `AppConfig` with validation
2. **AI Providers**: Plugin architecture supporting multiple providers
3. **Components**: Broken down into focused, reusable components
4. **State Management**: Domain-specific hooks with clear boundaries
5. **Error Handling**: Layered approach with graceful degradation

## 🚀 Migration Steps

### Step 1: Update Environment Configuration

**OLD (.env):**
```bash
VITE_GEMINI_API_KEY=your_key
VITE_BACKEND_URL=http://localhost:8000
VITE_CREATOR_ID=your_creator_id
```

**NEW (.env):**
```bash
# Choose your AI provider
VITE_AI_PROVIDER=toolhouse  # or openrouter, openai, etc.

# Provider-specific configuration
VITE_BACKEND_URL=http://localhost:8000
VITE_TOOLHOUSE_API_KEY=your_key  # if using toolhouse
VITE_OPENROUTER_API_KEY=your_key # if using openrouter

# Advertising & conversation config
VITE_CREATOR_ID=your_creator_id
VITE_API_KEY=demo-api-key
```

### Step 2: Update Imports

**OLD:**
```typescript
import { ChatApp } from './components/ChatApp';
import { useGeminiMCP } from './hooks/useGeminiMCP';
import { useMCPAds } from '@earnlayer/chat-ads';
```

**NEW:**
```typescript
import { ChatContainer } from './presentation/containers/ChatContainer';
import { useAIProvider } from './application/hooks/ai/useAIProvider';
import { useAdSearch } from './application/hooks/advertising/useAdSearch';
import { useConversationManager } from './application/hooks/conversation/useConversationManager';
```

### Step 3: Update Component Usage

**OLD:**
```typescript
function App() {
  return (
    <div className="App">
      <ChatApp />
    </div>
  );
}
```

**NEW:**
```typescript
function App() {
  return (
    <div className="App">
      <ChatContainer />
    </div>
  );
}
```

### Step 4: Migration of Custom Logic

If you have custom logic built on the old architecture:

**OLD Pattern:**
```typescript
const MyCustomComponent = () => {
  const { sendMessage } = useGeminiMCP(config);
  const { searchAds } = useMCPAds(adConfig);
  
  const handleMessage = async (message) => {
    // Manual coordination
    await searchAds([message]);
    const response = await sendMessage(enhancedMessage);
    // ...
  };
};
```

**NEW Pattern:**
```typescript
const MyCustomComponent = () => {
  const config = useAppConfig();
  const conversationManager = useConversationManager(config.conversationConfig);
  const adSearch = useAdSearch(config.advertisingConfig);
  const aiProvider = useAIProvider(config.aiConfig);
  
  const chatService = useMemo(
    () => new ChatApplicationService(conversationManager, adSearch, aiProvider),
    [conversationManager, adSearch, aiProvider]
  );
  
  const handleMessage = async (message) => {
    // Coordinated through service
    const result = await chatService.sendMessage(message);
    // ...
  };
};
```

## 🔧 Configuration Migration

### Provider-Specific Migration

#### From Gemini to Toolhouse
```bash
# OLD
VITE_GEMINI_API_KEY=your_gemini_key
VITE_GEMINI_MODEL=gemini-2.5-pro

# NEW
VITE_AI_PROVIDER=toolhouse
VITE_BACKEND_URL=http://localhost:8000
```

#### From Gemini to OpenRouter
```bash
# OLD
VITE_GEMINI_API_KEY=your_gemini_key
VITE_GEMINI_MODEL=gemini-2.5-pro

# NEW
VITE_AI_PROVIDER=openrouter
VITE_OPENROUTER_API_KEY=sk-or-v1-your_key
VITE_OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```

### Ad Configuration
```bash
# OLD (implicit)
# Ads were managed through useMCPAds directly

# NEW (explicit)
VITE_DEFAULT_AD_TYPES=["hyperlink", "popup", "banner", "video"]
VITE_AUTO_REQUEST_DISPLAY_ADS=true
VITE_AD_FREQUENCY=normal
VITE_REVENUE_VS_RELEVANCE=0.5
```

## 🧪 Testing Migration

### 1. Configuration Test
```typescript
import { ConfigFactory } from './configuration/ConfigFactory';

// Test configuration loading
const config = ConfigFactory.createFromEnvironment();
console.log('Configuration loaded:', config);
```

### 2. Provider Test
```typescript
import { ProviderFactory } from './infrastructure/providers/ProviderFactory';

// Test provider creation
const provider = await ProviderFactory.create('toolhouse', config.ai);
console.log('Provider initialized:', provider.name);
```

### 3. Integration Test
```typescript
import { ChatApplicationService } from './application/services/ChatApplicationService';

// Test full integration
const chatService = new ChatApplicationService(/* ... */);
const result = await chatService.sendMessage('Hello');
console.log('Chat service working:', result);
```

## 🐛 Common Migration Issues

### Issue 1: Configuration Errors
**Problem:** `ConfigValidationError: AI provider is required`
**Solution:** Set `VITE_AI_PROVIDER` in your `.env` file

### Issue 2: Provider Not Found
**Problem:** `Provider toolhouse is not registered`
**Solution:** Import the provider registration:
```typescript
import './infrastructure/providers/ai'; // Registers all providers
```

### Issue 3: Missing Dependencies
**Problem:** Import errors for new modules
**Solution:** Ensure all new files are created and properly exported

### Issue 4: CSS Conflicts
**Problem:** Styling conflicts between old and new components
**Solution:** Remove old CSS imports and use new `ChatInterface.css`

## 📈 Benefits After Migration

### For Developers
- **Faster Development**: Modular architecture accelerates feature development
- **Better Testing**: Isolated components are easier to test
- **Clearer Debugging**: Domain boundaries simplify troubleshooting
- **Type Safety**: Full TypeScript coverage with strict validation

### For Users
- **Provider Choice**: Switch between AI providers easily
- **Better Performance**: Optimized state management and rendering
- **More Reliable**: Improved error handling and fallback systems
- **Better UX**: Cleaner interface with better status information

### For SDK
- **Extensibility**: Easy to add new providers and features
- **Maintainability**: Clear code organization and separation of concerns
- **Reusability**: Components can be used in other applications
- **Documentation**: Better code documentation and examples

## 🔄 Rollback Plan

If you need to rollback to the legacy system:

1. **Revert App.tsx:**
```typescript
import { ChatApp } from './components/ChatApp';

function App() {
  return <ChatApp />;
}
```

2. **Restore old environment variables**
3. **Remove new architecture files** (optional)

## 📚 Additional Resources

- [Configuration Reference](./CONFIGURATION.md)
- [Provider Development Guide](./PROVIDER_GUIDE.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

## 🎉 Success Checklist

After migration, verify:
- [ ] Configuration loads without errors
- [ ] AI provider initializes successfully
- [ ] Messages can be sent and received
- [ ] Ads are displayed (if configured)
- [ ] Debug panel shows healthy status (development mode)
- [ ] Error handling works gracefully
- [ ] UI is responsive and functional

Your migration is complete when all items are checked! 🚀