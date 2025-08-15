// Test script to verify Gemini MCP integration
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Gemini MCP Integration...');

// Read .env file to get the real API key
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error reading .env file:', error.message);
    return {};
  }
}

const envVars = loadEnvFile();

// Test environment variables
const geminiApiKey = envVars.VITE_GEMINI_API_KEY;
const backendUrl = envVars.VITE_BACKEND_URL || 'http://localhost:8000';

console.log('🔧 Configuration:');
console.log('- Backend URL:', backendUrl);
console.log('- Gemini API Key:', geminiApiKey ? '✅ Configured' : '❌ Missing');

// Test backend health
async function testBackendHealth() {
  try {
    const response = await fetch(`${backendUrl}/api/conversations/health`);
    const data = await response.json();
    console.log('✅ Backend health check:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    return false;
  }
}

// Test MCP endpoint
async function testMCPEndpoint() {
  try {
    const response = await fetch(`${backendUrl}/api/mcp/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queries: ['test message'],
        creator_id: 'd64a4899-20e4-4ecd-a53e-057aceed54cf',
        conversation_id: 'test-conversation-123'
      })
    });
    const data = await response.json();
    console.log('✅ MCP endpoint test:', data);
    return true;
  } catch (error) {
    console.error('❌ MCP endpoint test failed:', error.message);
    return false;
  }
}

// Test Gemini API directly (if API key is available)
async function testGeminiAPI() {
  if (!geminiApiKey) {
    console.log('⚠️  Skipping Gemini API test - no API key');
    return false;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Hello, this is a test message.' }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100
          }
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Gemini API test failed:', response.status, errorData);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Gemini API test successful');
    return true;
  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n🚀 Running integration tests...\n');
  
  const backendOk = await testBackendHealth();
  const mcpOk = await testMCPEndpoint();
  const geminiOk = await testGeminiAPI();
  
  console.log('\n📊 Test Results:');
  console.log('- Backend:', backendOk ? '✅ OK' : '❌ FAILED');
  console.log('- MCP Endpoint:', mcpOk ? '✅ OK' : '❌ FAILED');
  console.log('- Gemini API:', geminiOk ? '✅ OK' : '⚠️  SKIPPED/FAILED');
  
  if (backendOk && mcpOk) {
    console.log('\n🎉 Basic integration is working!');
    console.log('💡 Try sending a message in the frontend at http://localhost:3000');
  } else {
    console.log('\n❌ Some tests failed. Check the logs above.');
  }
}

runTests().catch(console.error); 