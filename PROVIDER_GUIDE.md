# 🔌 AI Provider Development Guide

## Overview

The EarnLayer SDK Demo uses a plugin architecture that allows easy integration of different AI providers. This guide shows how to add new providers or customize existing ones.

## 🏗️ Provider Architecture

### Provider Interface
All AI providers must implement the `AIProviderPlugin` interface:

```typescript
interface AIProviderPlugin {
  readonly name: string;
  readonly version: string;
  readonly capabilities: ProviderCapabilities;

  initialize(config: ProviderConfig): Promise<void>;
  sendMessage(message: AIMessage): Promise<AIResponse>;
  streamMessage?(message: AIMessage): AsyncGenerator<AIStreamEvent>;
  shutdown?(): Promise<void>;
  
  isHealthy(): Promise<boolean>;
  validateConfig(config: ProviderConfig): boolean;
}
```

### Base Provider Class
Extend `BaseAIProvider` for common functionality:

```typescript
import { BaseAIProvider } from '../../../domain/ai/types/ProviderTypes';

export class MyCustomProvider extends BaseAIProvider {
  readonly name = 'mycustom';
  readonly version = '1.0.0';
  readonly capabilities = {
    streaming: true,
    multimodal: false,
    functionCalling: false,
    contextRetention: true,
    maxTokens: 4000
  };

  async initialize(config: MyCustomConfig): Promise<void> {
    // Initialize your provider
  }

  async sendMessage(message: AIMessage): Promise<AIResponse> {
    // Send message to your AI service
  }
}
```

## 🛠️ Creating a New Provider

### Step 1: Define Configuration Types

```typescript
// src/configuration/types/ConfigTypes.ts
export interface MyCustomConfig {
  apiKey: string;
  endpoint: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

// Add to AIConfig interface
export interface AIConfig {
  provider: AIProviderType;
  // ... existing providers
  mycustom?: MyCustomConfig;
}

// Add to provider type union
export type AIProviderType = 
  | 'toolhouse' 
  | 'openrouter' 
  | 'openai' 
  | 'anthropic' 
  | 'gemini'
  | 'mycustom'  // <- Add your provider
  | 'custom';
```

### Step 2: Update Configuration Factory

```typescript
// src/configuration/ConfigFactory.ts
private static createAIConfig(): AIConfig {
  const provider = import.meta.env.VITE_AI_PROVIDER as AIProviderType;
  const baseConfig: AIConfig = { provider };

  switch (provider) {
    // ... existing cases
    case 'mycustom':
      baseConfig.mycustom = {
        apiKey: import.meta.env.VITE_MYCUSTOM_API_KEY || '',
        endpoint: import.meta.env.VITE_MYCUSTOM_ENDPOINT || '',
        model: import.meta.env.VITE_MYCUSTOM_MODEL || 'default',
        temperature: parseFloat(import.meta.env.VITE_MYCUSTOM_TEMPERATURE || '0.7'),
        maxTokens: parseInt(import.meta.env.VITE_MYCUSTOM_MAX_TOKENS || '1000')
      };
      break;
  }

  return baseConfig;
}
```

### Step 3: Implement Provider Class

```typescript
// src/infrastructure/providers/ai/MyCustomProvider.ts
import { BaseAIProvider, ProviderCapabilities, ProviderInitializationError, ProviderRequestError } from '../../../domain/ai/types/ProviderTypes';
import { AIMessage, AIResponse, AIResponseEntity } from '../../../domain/ai/types/AITypes';
import { MyCustomConfig } from '../../../configuration/types/ConfigTypes';

export class MyCustomProvider extends BaseAIProvider {
  readonly name = 'mycustom';
  readonly version = '1.0.0';
  readonly capabilities: ProviderCapabilities = {
    streaming: false,
    multimodal: false,
    functionCalling: false,
    contextRetention: true,
    maxTokens: 4000,
    supportedModalities: ['text']
  };

  private myCustomConfig?: MyCustomConfig;

  async initialize(config: MyCustomConfig): Promise<void> {
    try {
      console.log('🔄 Initializing MyCustom provider...');
      
      if (!this.validateConfig(config)) {
        throw new ProviderInitializationError(
          this.name,
          'Invalid MyCustom configuration'
        );
      }

      this.myCustomConfig = config;
      this.config = config;

      // Test connection
      await this.testConnection();

      console.log('✅ MyCustom provider initialized successfully');
    } catch (error) {
      throw new ProviderInitializationError(
        this.name,
        error instanceof Error ? error.message : 'Unknown initialization error',
        error instanceof Error ? error : undefined
      );
    }
  }

  validateConfig(config: any): boolean {
    if (!config || typeof config !== 'object') {
      return false;
    }

    const customConfig = config as MyCustomConfig;
    
    if (!customConfig.apiKey || typeof customConfig.apiKey !== 'string') {
      console.error('MyCustom API key is required');
      return false;
    }

    if (!customConfig.endpoint || typeof customConfig.endpoint !== 'string') {
      console.error('MyCustom endpoint is required');
      return false;
    }

    try {
      new URL(customConfig.endpoint);
    } catch {
      console.error('MyCustom endpoint must be a valid URL');
      return false;
    }

    return true;
  }

  async sendMessage(message: AIMessage): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      this.validateMessage(message);
      
      if (!this.myCustomConfig) {
        throw new ProviderRequestError(this.name, 'Provider not initialized');
      }

      console.log(`🤖 Sending message to MyCustom: ${message.content.substring(0, 100)}...`);

      const response = await this.callMyCustomAPI(message);
      const responseTime = Date.now() - startTime;

      this.updateMetrics(responseTime);

      const aiResponse = AIResponseEntity.create(
        response.content,
        this.generateConversationId(),
        'mycustom',
        {
          model: this.myCustomConfig.model,
          usage: response.usage,
          responseTime
        }
      );

      console.log(`✅ MyCustom response received (${responseTime}ms)`);
      return aiResponse.toJSON();

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.handleError(
        error instanceof Error ? error : new Error('Unknown error'),
        'sendMessage'
      );
    }
  }

  private async callMyCustomAPI(message: AIMessage): Promise<any> {
    const response = await fetch(this.myCustomConfig!.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.myCustomConfig!.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.myCustomConfig!.model,
        message: message.content,
        temperature: this.myCustomConfig!.temperature,
        max_tokens: this.myCustomConfig!.maxTokens
      })
    });

    if (!response.ok) {
      throw new ProviderRequestError(
        this.name,
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    
    return {
      content: data.response || data.content || 'No content received',
      usage: data.usage
    };
  }

  private async testConnection(): Promise<void> {
    // Implement a simple health check
    const testResponse = await fetch(this.myCustomConfig!.endpoint, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${this.myCustomConfig!.apiKey}`
      }
    });

    if (!testResponse.ok && testResponse.status !== 405) {
      throw new Error(`Connection test failed: ${testResponse.status}`);
    }
  }

  private generateConversationId(): string {
    return `mycustom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async isHealthy(): Promise<boolean> {
    try {
      return this.myCustomConfig !== undefined && this.validateConfig(this.myCustomConfig);
    } catch {
      return false;
    }
  }

  async shutdown(): Promise<void> {
    this.myCustomConfig = undefined;
    this.config = undefined;
    console.log('🔄 MyCustom provider shutdown');
  }
}
```

### Step 4: Register Provider

```typescript
// src/infrastructure/providers/ai/index.ts
import { MyCustomProvider } from './MyCustomProvider';

export function registerAIProviders(): void {
  console.log('🔄 Registering AI providers...');
  
  // ... existing providers
  
  // Register your custom provider
  const myCustomProvider = new MyCustomProvider();
  providerRegistry.register(myCustomProvider);
  
  console.log(`✅ Registered ${providerRegistry.list().length} AI providers`);
}
```

### Step 5: Update Provider Factory

```typescript
// src/infrastructure/providers/ProviderFactory.ts
private static extractProviderConfig(providerType: ProviderType, config: AIConfig): ProviderConfig {
  switch (providerType) {
    // ... existing cases
    case 'mycustom':
      if (!config.mycustom) {
        throw new Error('MyCustom configuration is missing');
      }
      return config.mycustom;
    
    default:
      throw new Error(`Unknown provider type: ${providerType}`);
  }
}

static getSupportedProviders(): ProviderType[] {
  return ['toolhouse', 'openrouter', 'openai', 'anthropic', 'gemini', 'mycustom', 'custom'];
}
```

### Step 6: Add Environment Variables

```bash
# .env.example
# MyCustom Configuration
VITE_MYCUSTOM_API_KEY=your_api_key_here
VITE_MYCUSTOM_ENDPOINT=https://api.mycustom.ai/v1/chat
VITE_MYCUSTOM_MODEL=mycustom-model-v1
VITE_MYCUSTOM_TEMPERATURE=0.7
VITE_MYCUSTOM_MAX_TOKENS=1000
```

## 🔄 Streaming Support

To add streaming support to your provider:

```typescript
async *streamMessage(message: AIMessage): AsyncGenerator<AIStreamEvent> {
  try {
    yield { type: 'start', metadata: { provider: this.name } };

    const response = await fetch(this.myCustomConfig!.endpoint + '/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.myCustomConfig!.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        model: this.myCustomConfig!.model,
        message: message.content,
        stream: true
      })
    });

    if (!response.ok) {
      throw new ProviderRequestError(this.name, `HTTP ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          
          if (data.content) {
            yield { type: 'chunk', data: data.content };
          }
          
          if (data.done) {
            yield { type: 'end', metadata: data };
            return;
          }
        }
      }
    }
  } catch (error) {
    yield { 
      type: 'error', 
      error: error instanceof Error ? error.message : 'Streaming error' 
    };
  }
}
```

## 🧪 Testing Your Provider

### Unit Tests
```typescript
// tests/providers/MyCustomProvider.test.ts
import { MyCustomProvider } from '../../src/infrastructure/providers/ai/MyCustomProvider';

describe('MyCustomProvider', () => {
  let provider: MyCustomProvider;

  beforeEach(() => {
    provider = new MyCustomProvider();
  });

  test('should validate config correctly', () => {
    const validConfig = {
      apiKey: 'test-key',
      endpoint: 'https://api.test.com',
      model: 'test-model'
    };
    
    expect(provider.validateConfig(validConfig)).toBe(true);
  });

  test('should reject invalid config', () => {
    const invalidConfig = { apiKey: '' };
    expect(provider.validateConfig(invalidConfig)).toBe(false);
  });
});
```

### Integration Tests
```typescript
// tests/integration/provider-integration.test.ts
import { ProviderFactory } from '../../src/infrastructure/providers/ProviderFactory';
import { ConfigFactory } from '../../src/configuration/ConfigFactory';

describe('Provider Integration', () => {
  test('should create mycustom provider', async () => {
    const config = ConfigFactory.createDevelopmentConfig();
    config.ai.provider = 'mycustom';
    config.ai.mycustom = {
      apiKey: 'test-key',
      endpoint: 'https://api.test.com',
      model: 'test-model'
    };

    const provider = await ProviderFactory.create('mycustom', config.ai);
    expect(provider.name).toBe('mycustom');
  });
});
```

## 📈 Best Practices

### 1. Error Handling
- Always use `ProviderInitializationError` and `ProviderRequestError`
- Provide detailed error messages with context
- Implement graceful degradation

### 2. Configuration
- Validate all configuration parameters
- Provide sensible defaults
- Support environment variable overrides

### 3. Performance
- Update metrics using `this.updateMetrics()`
- Implement proper timeouts
- Use connection pooling if appropriate

### 4. Logging
- Use consistent logging format
- Log important events (init, errors, etc.)
- Include provider name in log messages

### 5. Security
- Never log API keys or sensitive data
- Validate all inputs
- Use secure headers for API calls

## 🔌 Example Providers

### Simple HTTP API Provider
```typescript
export class SimpleHttpProvider extends BaseAIProvider {
  readonly name = 'simple-http';
  
  async sendMessage(message: AIMessage): Promise<AIResponse> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: message.content })
    });
    
    const data = await response.json();
    
    return AIResponseEntity.create(
      data.response,
      this.generateId(),
      this.name
    ).toJSON();
  }
}
```

### WebSocket Provider
```typescript
export class WebSocketProvider extends BaseAIProvider {
  private ws?: WebSocket;
  
  async initialize(config: any): Promise<void> {
    this.ws = new WebSocket(config.wsUrl);
    // Handle WebSocket events
  }
  
  async sendMessage(message: AIMessage): Promise<AIResponse> {
    return new Promise((resolve, reject) => {
      this.ws!.send(JSON.stringify({ message: message.content }));
      
      this.ws!.onmessage = (event) => {
        const data = JSON.parse(event.data);
        resolve(AIResponseEntity.create(
          data.response,
          this.generateId(),
          this.name
        ).toJSON());
      };
    });
  }
}
```

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [WebSocket API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Architecture Documentation](./ARCHITECTURE.md)

Your provider is ready when it implements the interface, passes validation, and provides a good user experience! 🚀