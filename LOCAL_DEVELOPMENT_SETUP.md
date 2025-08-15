# 🚀 Local Development Setup Guide

This guide explains how to set up the earnlayer-sdk for local development with the earnlayer-sdk-demo.

## ✅ Current Status

**Both development servers are running:**
- ✅ **Vite Dev Server**: Running on http://localhost:5173
- ✅ **Rollup Watch Mode**: Auto-rebuilding SDK on changes
- ✅ **npm link**: SDK linked to demo
- ✅ **Local SDK**: Working and tested

## 🔧 Setup Process

### 1. SDK Setup (earnlayer-sdk directory)

```bash
cd earnlayer-sdk

# Install dependencies
npm install

# Build the SDK
npm run build

# Create global link
npm link

# Start watch mode (auto-rebuild on changes)
npm run build:watch
```

### 2. Demo Setup (earnlayer-sdk-demo directory)

```bash
cd earnlayer-sdk-demo

# Install dependencies
npm install

# Link to local SDK
npm link @earnlayer/chat-ads

# Start development server
npm run dev
```

## 🎯 Development Workflow

### Real-time Development

1. **Make changes to SDK source** (`earnlayer-sdk/src/`)
2. **Rollup automatically rebuilds** (watch mode)
3. **Demo automatically uses updated SDK** (npm link)
4. **No manual steps needed!**

### Testing Changes

1. **Edit SDK files** in `earnlayer-sdk/src/`
2. **Save the file**
3. **Check terminal** - Rollup should rebuild
4. **Refresh browser** - Demo uses new SDK
5. **Test functionality** in the demo

## 📁 File Structure

```
earnlayer-dev/
├── earnlayer-sdk/           # SDK source code
│   ├── src/
│   │   ├── services/        # Core services
│   │   ├── hooks/          # React hooks
│   │   ├── components/     # React components
│   │   └── types/          # TypeScript types
│   ├── dist/               # Built SDK (auto-generated)
│   └── package.json
└── earnlayer-sdk-demo/     # Demo application
    ├── src/
    │   ├── components/
    │   │   └── ChatApp.tsx # Updated to use new SDK
    │   └── main.tsx
    └── package.json
```

## 🔗 Key Features

### SDK Features (Local Development)
- ✅ **Conversation Management**: Full lifecycle with ad preferences
- ✅ **MCP Integration**: Hyperlink ads from MCP responses
- ✅ **Display Ads API**: Popup, banner, video, thinking ads
- ✅ **Auto-Integration**: Display ads requested after MCP responses
- ✅ **Impression Tracking**: Built-in analytics
- ✅ **TypeScript Support**: Full type safety

### Demo Features
- ✅ **Real-time Updates**: Changes reflect immediately
- ✅ **Integrated Chat**: Shows both MCP and display ads
- ✅ **Error Handling**: Displays connection status
- ✅ **Local Backend**: Connects to localhost:8000
- ✅ **Local MCP**: Connects to localhost:8001

## 🌐 Access Points

- **Demo Application**: http://localhost:5173
- **Backend API**: http://localhost:8000 (if running)
- **MCP Server**: http://localhost:8001 (if running)

## 🧪 Testing

### Test Local SDK Setup
```bash
cd earnlayer-sdk-demo
node test-local-sdk.js
```

### Expected Output
```
🧪 Testing Local SDK Setup...

✅ SDK import successful
✅ EarnLayerAdService available: function
✅ EarnLayerAdType available: object

📋 EarnLayerAdType values:
- POPUP: popup
- BANNER: banner
- VIDEO: video
- THINKING: thinking
- HYPERLINK: hyperlink

🔧 Testing service instantiation...
✅ EarnLayerAdService instantiated successfully

🎉 Local SDK setup is working correctly!
```

## 🔄 Development Commands

### SDK Development
```bash
# In earnlayer-sdk directory
npm run build          # Build once
npm run build:watch    # Auto-rebuild on changes
npm test              # Run tests
```

### Demo Development
```bash
# In earnlayer-sdk-demo directory
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
```

## 🐛 Troubleshooting

### Common Issues

1. **SDK not updating in demo**
   - Check if rollup watch is running
   - Verify npm link is set up
   - Restart demo dev server

2. **Import errors**
   - Check if SDK is built (`npm run build`)
   - Verify package.json dependencies
   - Check TypeScript configuration

3. **Connection errors**
   - Ensure backend is running on localhost:8000
   - Ensure MCP server is running on localhost:8001
   - Check network connectivity

### Reset Setup
```bash
# Unlink and relink
cd earnlayer-sdk
npm unlink
npm link

cd ../earnlayer-sdk-demo
npm unlink @earnlayer/chat-ads
npm link @earnlayer/chat-ads
```

## 📝 Notes

- **Hot Reload**: Changes to SDK source files trigger automatic rebuild
- **Type Safety**: Full TypeScript support with IntelliSense
- **Error Boundaries**: Demo includes error handling and status display
- **Backward Compatibility**: Legacy components still work
- **Production Ready**: Same code works in production builds

## 🎉 Success!

Your local development environment is now set up and ready for:
- ✅ Real-time SDK development
- ✅ Integrated testing with demo
- ✅ No deployment cycles needed
- ✅ Full TypeScript support
- ✅ Hot reload functionality

Happy coding! 🚀 