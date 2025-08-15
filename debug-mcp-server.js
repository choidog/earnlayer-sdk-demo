// Debug script to understand MCP server requirements
console.log('🔍 Debugging MCP Server Requirements...\n');

async function debugMCPServer() {
  const mcpUrl = 'http://localhost:8001/mcp';
  
  console.log('1. Testing MCP server health...');
  try {
    const healthResponse = await fetch('http://localhost:8001/health');
    const health = await healthResponse.json();
    console.log('✅ Health:', health);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }

  console.log('\n2. Testing available tools...');
  try {
    const toolsResponse = await fetch(mcpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'debug-1',
        method: 'tools/list',
        params: {}
      })
    });
    const tools = await toolsResponse.json();
    console.log('✅ Available tools:', JSON.stringify(tools, null, 2));
  } catch (error) {
    console.error('❌ Tools list failed:', error.message);
  }

  console.log('\n3. Testing different conversation_id formats...');
  const testCases = [
    { name: 'Empty string', id: '' },
    { name: 'Simple string', id: 'test' },
    { name: 'UUID format', id: 'd64a4899-20e4-4ecd-a53e-057aceed54cf' },
    { name: 'Generated UUID', id: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    })},
    { name: 'Timestamp based', id: `conv_${Date.now()}` },
    { name: 'Null value', id: null }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n   Testing: ${testCase.name} (${testCase.id})`);
      const response = await fetch(mcpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'debug-2',
          method: 'tools/call',
          params: {
            name: 'earnlayer_content_ads_search',
            arguments: {
              queries: ['test'],
              conversation_id: testCase.id,
              user_message: 'test'
            }
          }
        })
      });
      const result = await response.json();
      
      if (result.error) {
        console.log(`   ❌ Failed: ${result.error.message}`);
        if (result.error.data) {
          console.log(`   📋 Details: ${result.error.data}`);
        }
      } else {
        console.log(`   ✅ Success!`);
        console.log(`   📊 Response: ${JSON.stringify(result.result, null, 2)}`);
        break; // Found a working format
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n4. Testing without conversation_id...');
  try {
    const response = await fetch(mcpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'debug-3',
        method: 'tools/call',
        params: {
          name: 'earnlayer_content_ads_search',
          arguments: {
            queries: ['test'],
            user_message: 'test'
          }
        }
      })
    });
    const result = await response.json();
    console.log('✅ Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n🔍 Debug complete. Check the results above to understand MCP server requirements.');
}

debugMCPServer(); 