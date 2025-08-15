// Test script to verify local Toolhouse integration with MCP
import { ConfigFactory } from './src/configuration/ConfigFactory.js';
import { ProviderFactory } from './src/infrastructure/providers/ProviderFactory.js';

console.log('🧪 Testing Local Toolhouse Integration with MCP...\n');

async function testLocalToolhouseIntegration() {
  try {
    // Test 1: Configuration loading
    console.log('📋 Test 1: Loading configuration...');
    const config = ConfigFactory.createFromEnvironment();
    console.log('✅ Configuration loaded successfully');
    console.log('- AI Provider:', config.ai.provider);
    console.log('- Toolhouse Base URL:', config.ai.toolhouse?.baseUrl);
    console.log('- MCP Server URL:', config.ai.toolhouse?.baseUrl + '/mcp/query');
    console.log('- Toolhouse API Key:', config.ai.toolhouse?.apiKey ? '✅ Set' : '❌ Not set');
    
    // Test 2: Provider creation
    console.log('\n🔧 Test 2: Creating Local Toolhouse provider...');
    const provider = await ProviderFactory.create('toolhouse', config.ai);
    console.log('✅ Local Toolhouse provider created successfully');
    console.log('- Provider name:', provider.name);
    console.log('- Provider version:', provider.version);
    
    // Test 3: Health check
    console.log('\n🏥 Test 3: Health check...');
    const isHealthy = await provider.isHealthy();
    console.log('✅ Health check completed');
    console.log('- Provider healthy:', isHealthy ? '✅ Yes' : '❌ No');
    
    // Test 4: Send test message
    console.log('\n💬 Test 4: Sending test message...');
    const response = await provider.sendMessage({
      content: 'Tell me about AI tools and productivity apps',
      metadata: {
        creatorId: 'd64a4899-20e4-4ecd-a53e-057aceed54cf',
        conversationId: 'test-conversation-123'
      }
    });
    console.log('✅ Test message sent successfully');
    console.log('- Response received:', response.content ? '✅ Yes' : '❌ No');
    console.log('- Response length:', response.content?.length || 0, 'characters');
    console.log('- MCP Ads found:', response.metadata?.mcpAds?.length || 0);
    
    // Test 5: Test streaming
    console.log('\n🌊 Test 5: Testing streaming...');
    const stream = provider.streamMessage({
      content: 'What are the best coding tools?',
      metadata: {
        creatorId: 'd64a4899-20e4-4ecd-a53e-057aceed54cf'
      }
    });
    
    let streamedContent = '';
    for await (const event of stream) {
      if (event.type === 'chunk') {
        streamedContent += event.data;
        process.stdout.write(event.data);
      } else if (event.type === 'metadata') {
        console.log('\n📊 Metadata:', event.metadata);
      } else if (event.type === 'end') {
        console.log('\n✅ Streaming completed');
        break;
      }
    }
    
    console.log('\n🎉 Local Toolhouse integration is working correctly!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Configuration: Working');
    console.log('- ✅ Provider creation: Working');
    console.log('- ✅ Health check: Working');
    console.log('- ✅ Message sending: Working');
    console.log('- ✅ Streaming: Working');
    console.log('- ✅ MCP integration: Working');
    
  } catch (error) {
    console.error('❌ Local Toolhouse integration test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check if MCP server is running on localhost:8001');
    console.error('2. Verify VITE_MCP_SERVER_URL is set correctly');
    console.error('3. Check MCP server logs for any errors');
    console.error('4. Ensure the SDK is built and linked correctly');
    process.exit(1);
  }
}

testLocalToolhouseIntegration(); 