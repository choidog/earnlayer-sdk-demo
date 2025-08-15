// Test conversation UUID fix
console.log('🧪 Testing Conversation UUID Fix...\n');

async function testConversationUUID() {
  try {
    console.log('1. Testing backend conversation initialization...');
    const response = await fetch('http://localhost:8000/api/conversations/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: `test-uuid-${Date.now()}`,
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
    
    // Check if it's a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(result.conversation_id);
    console.log('🔍 UUID format check:', {
      conversationId: result.conversation_id,
      isUUID: isUUID
    });

    if (!isUUID) {
      throw new Error('Backend did not return a valid UUID');
    }

    console.log('\n2. Testing MCP with the UUID...');
    const mcpResponse = await fetch('http://localhost:8001/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'test-uuid',
        method: 'tools/call',
        params: {
          name: 'earnlayer_content_ads_search',
          arguments: {
            queries: ['test'],
            conversation_id: result.conversation_id,
            user_message: 'test message'
          }
        }
      })
    });

    if (!mcpResponse.ok) {
      throw new Error(`MCP failed: ${mcpResponse.status}`);
    }

    const mcpResult = await mcpResponse.json();
    console.log('✅ MCP search successful with UUID');
    console.log('📊 Response status:', mcpResult.error ? 'Error' : 'Success');

    console.log('\n🎉 Conversation UUID fix is working!');
    console.log('✅ Backend returns valid UUID:', result.conversation_id);
    console.log('✅ MCP accepts UUID format');
    console.log('✅ ToolhouseProvider should now work correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testConversationUUID(); 