# 🚀 EarnLayer SDK Demo Setup Guide

## Quick Setup for Gemini MCP Integration

### 1. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file and add your Gemini API key
nano .env
```

### 2. Required Configuration

In your `.env` file, update the following:

```bash
# Required: Add your actual Gemini API key
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here

# Optional: Customize these settings
VITE_GEMINI_MODEL=gemini-2.0-flash-exp
VITE_GEMINI_TEMPERATURE=0.7
VITE_GEMINI_MAX_TOKENS=1000
```

### 3. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API key"
3. Create a new API key or use an existing one
4. Copy the API key and paste it in your `.env` file

### 4. Start the Demo

```bash
# Start the SDK in watch mode (in earnlayer-sdk directory)
cd ../earnlayer-sdk
npm run build:watch

# In another terminal, start the demo
cd ../earnlayer-sdk-demo
npm run dev
```

### 5. Verify Setup

1. Open http://localhost:3001
2. Check the debug info panel
3. Look for "✅ API Key Configured" status
4. Try sending a message to test Gemini integration

## 🔧 Troubleshooting

### API Key Issues
- **"❌ API Key Missing"**: Make sure you've added the API key to `.env`
- **"Invalid API key"**: Verify your Gemini API key is correct
- **"Rate limit exceeded"**: Wait a moment and try again

### Connection Issues
- **Backend not responding**: Make sure backend is running on port 8000
- **MCP Server not responding**: Make sure MCP server is running on port 8001

### Fallback Mode
If the API key is missing or invalid, the demo will work in fallback mode:
- Shows mock responses
- Still demonstrates the integration flow
- All logging and debugging features work

## 🎯 What You'll See

### With Valid API Key
- ✅ Real Gemini AI responses
- ✅ Contextual ads from your database
- ✅ Vector search through content
- ✅ Affiliate code integration

### Without API Key (Fallback)
- ⚠️ Mock responses
- ✅ Same UI and flow
- ✅ All debugging features
- ✅ Ad display functionality

## 🔍 Debug Information

The demo includes comprehensive debugging:
- API key status
- Connection health
- MCP server status
- Response sources
- Error details

Check the "🔧 Debug Info" panel for real-time status. 