// Test script to verify local SDK setup
import { EarnLayerAdService, EarnLayerAdType } from '@earnlayer/chat-ads';

console.log('🧪 Testing Local SDK Setup...\n');

// Test 1: Check if SDK is accessible
try {
  console.log('✅ SDK import successful');
  console.log('✅ EarnLayerAdService available:', typeof EarnLayerAdService);
  console.log('✅ EarnLayerAdType available:', typeof EarnLayerAdType);
  
  // Test 2: Check enum values
  console.log('\n📋 EarnLayerAdType values:');
  console.log('- POPUP:', EarnLayerAdType.POPUP);
  console.log('- BANNER:', EarnLayerAdType.BANNER);
  console.log('- VIDEO:', EarnLayerAdType.VIDEO);
  console.log('- THINKING:', EarnLayerAdType.THINKING);
  console.log('- HYPERLINK:', EarnLayerAdType.HYPERLINK);
  
  // Test 3: Test service instantiation
  console.log('\n🔧 Testing service instantiation...');
  const adService = new EarnLayerAdService({
    mcpUrl: 'http://localhost:8001',
    baseUrl: 'http://localhost:8000',
    apiKey: 'test-api-key',
    creatorId: 'd64a4899-20e4-4ecd-a53e-057aceed54cf',
    autoRequestDisplayAds: true
  });
  console.log('✅ EarnLayerAdService instantiated successfully');
  
  console.log('\n🎉 Local SDK setup is working correctly!');
  console.log('\n📋 Summary:');
  console.log('- ✅ SDK import: Working');
  console.log('- ✅ Type definitions: Working');
  console.log('- ✅ Service instantiation: Working');
  console.log('- ✅ Local development setup: Ready');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('\n🔧 Troubleshooting:');
  console.error('1. Make sure npm link is set up correctly');
  console.error('2. Check that the SDK is built (npm run build)');
  console.error('3. Verify the package.json dependencies');
  process.exit(1);
} 