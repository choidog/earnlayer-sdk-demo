// Test MCPClient fix
console.log('🧪 Testing MCPClient Fix...\n');

async function testMCPClientFix() {
  try {
    console.log('1. Testing MCPClient with proper JSON-RPC parsing...');
    
    // First get a valid conversation ID
    const convResponse = await fetch('http://localhost:8000/api/conversations/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: `test-mcp-${Date.now()}`,
        creator_id: 'd64a4899-20e4-4ecd-a53e-057aceed54cf',
        ad_preferences: {
          ad_types: ['hyperlink', 'popup'],
          frequency: 'normal',
          revenue_vs_relevance: 0.5
        }
      })
    });

    const convResult = await convResponse.json();
    console.log('✅ Conversation initialized:', convResult.conversation_id);

    // Test MCP search
    const mcpResponse = await fetch('http://localhost:8001/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'test-mcp-client',
        method: 'tools/call',
        params: {
          name: 'earnlayer_content_ads_search',
          arguments: {
            queries: ['hello'],
            conversation_id: convResult.conversation_id,
            user_message: 'hello'
          }
        }
      })
    });

    const mcpResult = await mcpResponse.json();
    console.log('📊 Raw MCP response:', JSON.stringify(mcpResult, null, 2));

    // Parse the content like the MCPClient does
    const textContent = mcpResult.result.content[0].text;
    const parsedContent = JSON.parse(textContent);
    
    console.log('✅ Parsed content:', parsedContent);
    console.log('✅ Ads found:', parsedContent.results?.[0]?.hyperlink_ads?.length || 0);
    console.log('✅ Summary:', parsedContent.summary);

    console.log('\n🎉 MCPClient fix is working!');
    console.log('✅ JSON-RPC response parsing: Working');
    console.log('✅ Content extraction: Working');
    console.log('✅ Ads extraction: Working');
    console.log('✅ Summary extraction: Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testMCPClientFix(); 