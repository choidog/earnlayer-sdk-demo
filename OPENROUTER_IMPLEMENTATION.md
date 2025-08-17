# OpenRouter Implementation with MCP Integration

## Overview

This implementation adds OpenRouter support to the EarnLayer chat application, allowing users to use Gemini models through OpenRouter while integrating with the EarnLayer MCP server to get contextual ads and content.

## Features

- **OpenRouter API Integration**: Uses OpenRouter to access Gemini models
- **MCP Integration**: Automatically fetches relevant ads and content from the EarnLayer MCP server
- **Secure API Key Management**: Uses existing Gemini API key through Supabase edge functions
- **Context Enhancement**: Enhances user messages with relevant ads and content before sending to OpenRouter

## Architecture

### Components

1. **OpenRouterApiService** (`src/services/openRouterApi.ts`)
   - Extends BaseApiService for OpenRouter compatibility
   - Integrates with MCPClient to fetch ads and content
   - Enhances user messages with contextual information

2. **MCPClient** (`src/services/mcpClient.ts`)
   - Communicates with EarnLayer MCP server
   - Searches for relevant ads and content based on user queries
   - Handles JSON-RPC communication protocol

3. **OpenRouter Edge Function** (`supabase/functions/openrouter-chat/index.ts`)
   - Secure proxy for OpenRouter API calls
   - Uses existing Gemini API key for authentication
   - Handles CORS and error management

### Configuration

The OpenRouter provider is configured in `src/config/apiProviders.ts`:

```typescript
{
  id: 'openrouter',
  name: 'OpenRouter (Gemini)',
  type: 'openrouter',
  endpoint: 'https://openrouter.ai/api/v1/chat/completions',
  model: 'google/gemini-2.0-flash-exp',
  parameters: {
    temperature: 0.7,
    max_tokens: 1000,
    mcpUrl: 'https://backend-production-1774.up.railway.app',
    mcpApiKey: undefined,
    creatorId: 'demo-creator-openrouter',
    conversationId: undefined
  }
}
```

## How It Works

### 1. Message Processing Flow

1. User sends a message
2. OpenRouterApiService receives the message
3. If MCP client is configured:
   - Message is sent to MCP server as a search query
   - MCP server returns relevant ads and content
   - Message is enhanced with ads and content context
4. Enhanced message is sent to OpenRouter via edge function
5. OpenRouter returns Gemini response to user

### 2. MCP Integration

The MCP integration works as follows:

```typescript
// In OpenRouterApiService.buildRequestBody()
if (this.mcpClient) {
  const mcpResults = await this.mcpClient.searchContentAds(
    [message], // Use message as search query
    this.config.parameters?.creatorId,
    this.config.parameters?.conversationId
  );
  
  if (mcpResults.length > 0) {
    enhancedMessage = this.buildEnhancedMessage(message, mcpResults[0]);
  }
}
```

### 3. Message Enhancement

User messages are enhanced with relevant context:

```
Original: "Tell me about AI automation"

Enhanced: "Tell me about AI automation

Relevant content for context:
1. AI Automation Guide: Learn how to automate your workflow with AI tools
2. The Future of Work: How AI is transforming industries

Relevant advertisements:
1. AI Automation Tool: Boost your productivity with our AI automation platform
2. Workflow Optimization: Streamline your processes with intelligent automation"
```

## Setup Instructions

### 1. Environment Variables

Ensure the following environment variables are set in your Supabase project:

```bash
GEMINI_API_KEY=your_openrouter_api_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Deploy Edge Function

Deploy the OpenRouter edge function to Supabase:

```bash
cd earnlayer-chat
supabase functions deploy openrouter-chat
```

### 3. Configure MCP Server

Ensure your MCP server is running and accessible at the configured URL. The default configuration points to:

```
https://backend-production-1774.up.railway.app
```

### 4. Test the Implementation

1. Select "OpenRouter (Gemini)" from the API provider dropdown
2. Send a message that might trigger relevant ads (e.g., "AI tools", "automation", "productivity")
3. Verify that the response includes contextual information

## API Usage

### Basic Usage

```typescript
import { ApiServiceFactory } from '@/services/apiServiceFactory';
import { DEFAULT_API_PROVIDERS } from '@/config/apiProviders';

const openRouterConfig = DEFAULT_API_PROVIDERS.find(p => p.id === 'openrouter');
const service = ApiServiceFactory.createService(openRouterConfig);

const response = await service.sendMessage('Hello, world!');
console.log(response.content);
```

### With MCP Integration

```typescript
const configWithMCP = {
  ...openRouterConfig,
  parameters: {
    ...openRouterConfig.parameters,
    mcpUrl: 'https://your-mcp-server.com',
    creatorId: 'your-creator-id',
    conversationId: 'conversation-123'
  }
};

const service = ApiServiceFactory.createService(configWithMCP);
const response = await service.sendMessage('Tell me about AI automation');
```

## Error Handling

The implementation includes comprehensive error handling:

- **MCP Connection Errors**: Gracefully falls back to basic OpenRouter if MCP is unavailable
- **API Key Errors**: Clear error messages for authentication issues
- **Rate Limiting**: Handles OpenRouter rate limits with appropriate error messages
- **Network Errors**: Retry logic and fallback mechanisms

## Testing

Run the test suite to verify the implementation:

```bash
npm test -- openRouterApi.test.ts
```

## Security Considerations

1. **API Key Security**: API keys are stored securely in Supabase secrets
2. **CORS Protection**: Edge function includes proper CORS headers
3. **Authentication**: All requests require valid Supabase authentication
4. **Input Validation**: User inputs are validated before processing

## Troubleshooting

### Common Issues

1. **"MCP request failed"**: Check MCP server URL and connectivity
2. **"Invalid OpenRouter API key"**: Verify API key in Supabase secrets
3. **"Edge Function error"**: Check edge function deployment and logs

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=openrouter:*
```

## Future Enhancements

1. **Streaming Support**: Add real-time streaming for MCP-enhanced responses
2. **Ad Display Integration**: Direct integration with ad display components
3. **Multiple Model Support**: Support for other OpenRouter models
4. **Advanced Context**: More sophisticated context enhancement algorithms
5. **Analytics**: Track MCP usage and ad performance metrics 