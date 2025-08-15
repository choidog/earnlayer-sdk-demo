// Test script to verify MCP integration
import { MCPClient } from '@earnlayer/chat-ads';

console.log('🧪 Testing MCP Integration...\n');

async function testMCPIntegration() {
  try {
    // Create MCP client
    const mcpClient = new MCPClient({
      mcpUrl: 'http://localhost:8001/mcp',
      apiKey: 'local-dev-key'
    });

    console.log('✅ MCP client created');

    // Test MCP search
    console.log('\n🔍 Testing MCP search...');
    const response = await mcpClient.searchContentAds(
      ['AI tools and productivity'],
      'd64a4899-20e4-4ecd-a53e-057aceed54cf',
      'test-conversation-' + Date.now()
    );

    console.log('✅ MCP search completed');
    console.log('- Response:', response);
    console.log('- Ads found:', response.ads?.length || 0);

    if (response.ads && response.ads.length > 0) {
      console.log('\n📋 Sample ad:');
      console.log('- Title:', response.ads[0].title);
      console.log('- Description:', response.ads[0].description);
      console.log('- URL:', response.ads[0].url);
    }

    console.log('\n🎉 MCP integration is working!');

  } catch (error) {
    console.error('❌ MCP integration test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check if MCP server is running on localhost:8001');
    console.error('2. Check MCP server logs for errors');
    console.error('3. Verify the conversation_id format');
    process.exit(1);
  }
}

testMCPIntegration(); 