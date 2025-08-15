// Test script to verify Toolhouse integration
import { ConfigFactory } from './src/configuration/ConfigFactory.js';
import { ProviderFactory } from './src/infrastructure/providers/ProviderFactory.js';

console.log('🧪 Testing Toolhouse Integration...\n');

async function testToolhouseIntegration() {
  try {
    // Test 1: Configuration loading
    console.log('📋 Test 1: Loading configuration...');
    const config = ConfigFactory.createFromEnvironment();
    console.log('✅ Configuration loaded successfully');
    console.log('- AI Provider:', config.ai.provider);
    console.log('- Toolhouse Base URL:', config.ai.toolhouse?.baseUrl);
    console.log('- Toolhouse API Key:', config.ai.toolhouse?.apiKey ? '✅ Set' : '❌ Not set');
    
    // Test 2: Provider creation
    console.log('\n🔧 Test 2: Creating Toolhouse provider...');
    const provider = await ProviderFactory.create('toolhouse', config.ai);
    console.log('✅ Toolhouse provider created successfully');
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
      content: 'Hello, this is a test message',
      metadata: {
        creatorId: 'd64a4899-20e4-4ecd-a53e-057aceed54cf',
        adTypes: ['popup', 'banner']
      }
    });
    console.log('✅ Test message sent successfully');
    console.log('- Response received:', response.content ? '✅ Yes' : '❌ No');
    console.log('- Response length:', response.content?.length || 0, 'characters');
    
    console.log('\n🎉 Toolhouse integration is working correctly!');
    
  } catch (error) {
    console.error('❌ Toolhouse integration test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check if backend is running on localhost:8000');
    console.error('2. Verify TOOLHOUSE_API_KEY is set in .env');
    console.error('3. Check backend logs for any errors');
    process.exit(1);
  }
}

testToolhouseIntegration(); 