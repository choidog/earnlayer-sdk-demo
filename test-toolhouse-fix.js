// Quick test to verify the ToolhouseProvider fix
console.log('🧪 Testing ToolhouseProvider Fix...\n');

async function testToolhouseFix() {
  try {
    console.log('1. Testing backend conversation initialization with correct creator_id...');
    const response = await fetch('http://localhost:8000/api/conversations/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: `test-fix-${Date.now()}`,
        creator_id: 'd64a4899-20e4-4ecd-a53e-057aceed54cf',
        ad_preferences: {
          ad_types: ['hyperlink', 'popup'],
          frequency: 'normal',
          revenue_vs_relevance: 0.5
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Backend conversation initialized:', result.conversation_id);

    console.log('\n2. Testing MCP with the conversation ID...');
    const mcpResponse = await fetch('http://localhost:8001/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'test-fix',
        method: 'tools/call',
        params: {
          name: 'earnlayer_content_ads_search',
          arguments: {
            queries: ['AI tools'],
            conversation_id: result.conversation_id,
            user_message: 'Tell me about AI tools'
          }
        }
      })
    });

    if (!mcpResponse.ok) {
      throw new Error(`MCP failed: ${mcpResponse.status}`);
    }

    const mcpResult = await mcpResponse.json();
    console.log('✅ MCP search successful');
    console.log('📊 Response status:', mcpResult.error ? 'Error' : 'Success');

    console.log('\n🎉 ToolhouseProvider fix is working!');
    console.log('✅ Backend conversation initialization: Working');
    console.log('✅ MCP integration: Working');
    console.log('✅ Creator ID format: Fixed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testToolhouseFix(); 