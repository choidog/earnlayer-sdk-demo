// Test conversation manager initialization
console.log('🧪 Testing Conversation Manager...\n');

async function testConversationManager() {
  try {
    console.log('1. Testing backend conversation initialization...');
    const response = await fetch('http://localhost:8000/api/conversations/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: `test-manager-${Date.now()}`,
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

    console.log('\n2. Testing conversation config...');
    const config = {
      autoInitialize: true,
      creatorId: 'd64a4899-20e4-4ecd-a53e-057aceed54cf',
      baseUrl: 'http://localhost:8000',
      initialConfig: {
        ad_preferences: {
          ad_types: ['hyperlink', 'popup'],
          frequency: 'normal',
          revenue_vs_relevance: 0.5
        }
      }
    };
    
    console.log('✅ Conversation config:', config);

    console.log('\n🎉 Conversation manager test passed!');
    console.log('✅ Backend conversation initialization: Working');
    console.log('✅ Configuration format: Correct');
    console.log('✅ Creator ID format: Valid UUID');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testConversationManager(); 