# Toolhouse Integration Guide for EarnLayer SDK Demo

## Overview

This guide shows how to implement Toolhouse for local development in a JavaScript/TypeScript environment with the EarnLayer SDK Demo. The implementation **calls Toolhouse agents as external APIs** while providing MCP (Micro-Content Platform) context to enhance responses.

## 🚀 Implementation Features

The ToolhouseProvider now:
- ✅ **Searches MCP content** for relevant ads and resources
- ✅ **Calls actual Toolhouse agents** via API for AI-generated responses
- ✅ **Enhances messages** with MCP context before sending to agents
- ✅ **Provides fallback responses** when Toolhouse agent is unavailable
- ✅ **Handles streaming responses** from Toolhouse agents

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Toolhouse CLI** (`npm i -g @toolhouseai/cli`)
4. **Toolhouse account** (sign up at [toolhouse.ai](https://toolhouse.ai))

## 🔧 Setup Steps

### Step 1: Install Toolhouse CLI

```bash
npm i -g @toolhouseai/cli
```

### Step 2: Login to Toolhouse

```bash
th login
```

### Step 3: Create Your Toolhouse Agent

Create a new agent configuration file:

```bash
th new earnlayer-agent.yaml
```

### Step 4: Configure Your Agent

Edit `earnlayer-agent.yaml`:

```yaml
title: EarnLayer AI Assistant

system_prompt: |-
  You are a helpful AI assistant that provides contextual responses based on user queries and available resources.
  
  When responding to users:
  1. Always provide helpful, accurate information
  2. Incorporate relevant context and resources when available
  3. If ads or resources are provided, mention them naturally in your response
  4. Be conversational and engaging
  5. If you don't have specific information, provide general guidance
  6. Always acknowledge the user's question and provide actionable advice

  You will receive enhanced messages that include MCP (Micro-Content Platform) context with relevant ads and resources.
  Use this information to enhance your responses and provide valuable resources to users.

message: "Hello! I'm your AI assistant. I can help you with various topics and provide relevant resources. How can I assist you today?"

bundle: "default"
public: true
```

### Step 5: Test Your Agent Locally

```bash
th run earnlayer-agent.yaml
```

### Step 6: Deploy Your Agent

```bash
th deploy earnlayer-agent.yaml
```

You'll receive a URL like: `https://agents.toolhouse.ai/your-agent-id`

### Step 7: Configure Environment Variables

Create a `.env` file in your EarnLayer SDK Demo project:

```env
# Toolhouse Configuration
VITE_TOOLHOUSE_AGENT_URL=https://agents.toolhouse.ai/your-agent-id
VITE_TOOLHOUSE_API_KEY=your-api-key-here
VITE_TOOLHOUSE_AGENT_ID=your-agent-id

# MCP Server Configuration
VITE_MCP_SERVER_URL=http://localhost:8001

# Backend Configuration
VITE_BACKEND_URL=http://localhost:8000
VITE_CREATOR_ID=d64a4899-20e4-4ecd-a53e-057aceed54cf
```

### Step 8: Start the Demo

```bash
npm run dev
```

## 🔄 How It Works

### 1. User Sends Message
```
User: "how do i implement toolhouse for local development"
```

### 2. MCP Search
The ToolhouseProvider searches the MCP server for relevant content:
```javascript
// Searches for relevant ads and content
const mcpResponse = await this.mcpClient.searchContentAds(
  ["how do i implement toolhouse"],
  creatorId,
  conversationId
);
```

### 3. Enhanced Message Construction
The provider builds an enhanced message with MCP context:
```javascript
let enhancedMessage = userMessage;
enhancedMessage += '\n\nRelevant context and resources:\n';
enhancedMessage += `MCP Content: ${JSON.stringify(mcpResponse.content)}\n\n`;
enhancedMessage += 'Available resources:\n';
// Add relevant ads and resources
enhancedMessage += 'Please provide a helpful response incorporating this context.';
```

### 4. Toolhouse Agent Call
The enhanced message is sent to your Toolhouse agent:
```javascript
const response = await fetch(this.toolhouseConfig.agentUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.toolhouseConfig.apiKey}`
  },
  body: JSON.stringify({ message: enhancedMessage })
});
```

### 5. AI-Generated Response
Your Toolhouse agent receives the enhanced message and generates a contextual AI response that incorporates the MCP content and ads.

## 📊 Example Response Flow

**Input:** "how do i implement toolhouse for local development"

**MCP Search Results:**
- Toolhouse Documentation (hyperlink ad)
- Local Development Guide (content)

**Enhanced Message to Toolhouse Agent:**
```
how do i implement toolhouse for local development

Relevant context and resources:
MCP Content: {
  "results": [
    {
      "query": "toolhouse local development",
      "hyperlink_ads": [
        {
          "title": "Toolhouse Documentation",
          "description": "Complete guide to implementing Toolhouse",
          "url": "https://docs.toolhouse.ai"
        }
      ]
    }
  ]
}

Available resources:
1. Toolhouse Documentation - Complete guide to implementing Toolhouse
   Link: https://docs.toolhouse.ai

Please provide a helpful response incorporating this context and any relevant resources.
```

**Toolhouse Agent Response:**
```
Great question! I can help you implement Toolhouse for local development. Based on the available resources, here's a comprehensive guide:

## Step-by-Step Implementation

1. **Install the Toolhouse CLI**
   ```bash
   npm i -g @toolhouseai/cli
   ```

2. **Authenticate with Toolhouse**
   ```bash
   th login
   ```

3. **Create Your Agent**
   ```bash
   th new my-agent.yaml
   ```

4. **Test Locally**
   ```bash
   th run my-agent.yaml
   ```

5. **Deploy Your Agent**
   ```bash
   th deploy my-agent.yaml
   ```

## Additional Resources

I found some helpful documentation that might be useful:
- **[Toolhouse Documentation](https://docs.toolhouse.ai)** - Complete guide to implementing Toolhouse in your projects

This approach gives you a fully functional Toolhouse agent that you can integrate into your JavaScript/TypeScript applications. The agent will be available at a URL like `https://agents.toolhouse.ai/your-agent-id` that you can call from your code.

Would you like me to show you how to integrate this agent into your application code?
```

## 🛠️ Customization Options

### Custom Agent Prompts

You can customize your agent's behavior by modifying the `system_prompt` in your YAML file:

```yaml
system_prompt: |-
  You are a specialized technical assistant focused on [your domain].
  
  When responding:
  1. Provide technical, detailed explanations
  2. Include code examples when relevant
  3. Reference official documentation
  4. Suggest best practices
  5. Incorporate any provided resources naturally
```

### Multiple Agents

You can create different agents for different use cases:

```bash
th new technical-assistant.yaml
th new marketing-assistant.yaml
th new support-assistant.yaml
```

### Environment-Specific Configuration

Use different agent URLs for different environments:

```env
# Development
VITE_TOOLHOUSE_AGENT_URL=https://agents.toolhouse.ai/dev-assistant

# Production
VITE_TOOLHOUSE_AGENT_URL=https://agents.toolhouse.ai/prod-assistant
```

## 🔍 Troubleshooting

### Common Issues

1. **Agent URL Not Found**
   - Verify your agent is deployed: `th list`
   - Check the agent URL in your `.env` file

2. **API Key Issues**
   - Re-authenticate: `th login`
   - Check your API key in `~/.toolhouse`

3. **MCP Connection Issues**
   - Ensure MCP server is running on port 8001
   - Check backend is running on port 8000

4. **Fallback Responses**
   - If you see template responses, check Toolhouse agent configuration
   - Verify network connectivity to Toolhouse

### Debug Mode

Enable detailed logging by checking the browser console for:
- MCP search results
- Toolhouse agent calls
- Response processing

## 🎯 Best Practices

1. **Agent Design**
   - Write clear, specific system prompts
   - Test your agent locally before deploying
   - Use descriptive agent titles

2. **MCP Integration**
   - Ensure MCP content is relevant to your use case
   - Monitor ad relevance and performance
   - Update content regularly

3. **Error Handling**
   - Always provide fallback responses
   - Log errors for debugging
   - Graceful degradation when services are unavailable

4. **Performance**
   - Cache agent responses when appropriate
   - Optimize MCP queries
   - Monitor response times

## 📚 Additional Resources

- [Toolhouse Documentation](https://docs.toolhouse.ai)
- [Toolhouse CLI Reference](https://docs.toolhouse.ai/cli)
- [EarnLayer SDK Documentation](https://docs.earnlayer.com)
- [MCP Server Documentation](https://docs.mcp.dev)

## 🚀 Next Steps

1. **Deploy your first agent** using the steps above
2. **Customize the agent prompt** for your specific use case
3. **Test with different queries** to see contextual responses
4. **Monitor performance** and adjust as needed
5. **Scale up** by creating multiple specialized agents

The ToolhouseProvider now provides a complete integration that combines the power of Toolhouse AI agents with MCP content to deliver highly contextual and useful responses to your users! 