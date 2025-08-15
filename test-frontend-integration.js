// Test script to verify frontend integration is working
console.log('🧪 Testing Frontend Integration...');

// Test if the frontend is serving correctly
async function testFrontend() {
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ Frontend is serving correctly');
      return true;
    } else {
      console.error('❌ Frontend returned status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Frontend test failed:', error.message);
    return false;
  }
}

// Test if the backend is accessible
async function testBackend() {
  try {
    const response = await fetch('http://localhost:8000/api/conversations/health');
    const data = await response.json();
    console.log('✅ Backend health check:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('\n🚀 Running frontend integration tests...\n');
  
  const frontendOk = await testFrontend();
  const backendOk = await testBackend();
  
  console.log('\n📊 Test Results:');
  console.log('- Frontend:', frontendOk ? '✅ OK' : '❌ FAILED');
  console.log('- Backend:', backendOk ? '✅ OK' : '❌ FAILED');
  
  if (frontendOk && backendOk) {
    console.log('\n🎉 Integration is working!');
    console.log('💡 Visit http://localhost:3000 to test the Gemini MCP integration');
    console.log('📝 Try sending a message to see if Gemini responds with MCP context');
  } else {
    console.log('\n❌ Some tests failed. Check the logs above.');
  }
}

runTests().catch(console.error); 