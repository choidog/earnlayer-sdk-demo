# EarnLayer SDK Demo

A comprehensive demonstration of the `@earnlayer/chat-ads` SDK in action. This React TypeScript application showcases how to integrate EarnLayer's contextual ads into a chat interface.

## 🚀 Live Demo

Visit the live demo: [https://earnlayer-sdk-demo.vercel.app](https://earnlayer-sdk-demo.vercel.app)

## 🎯 Features Demonstrated

- **Real-time Chat Interface**: Functional chat application with user and assistant messages
- **MCP Ads Integration**: Contextual hyperlink ads from EarnLayer's MCP server
- **Display Ads**: Popup, banner, and other display ad types
- **Ad Tracking**: Impression and click tracking functionality
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript**: Full type safety throughout the application

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/choidog/earnlayer-sdk-demo.git
cd earnlayer-sdk-demo

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🎮 How to Use

1. **Start the application**: Run `npm run dev` and open `http://localhost:5173`
2. **Try the suggested topics**:
   - "Tell me about AI tools"
   - "What are the best productivity apps?"
   - "How can I improve my coding skills?"
   - "What's new in technology?"
3. **Watch the ads appear**: Contextual ads will appear based on your messages
4. **Interact with ads**: Click on ads to see them open in new tabs

## 🏗️ Architecture

### Components

- **ChatApp**: Main chat interface component
- **Message Display**: User and assistant message rendering
- **Ad Integration**: MCP and display ad components
- **Responsive Layout**: Sidebar for ads, main chat area

### SDK Integration

```tsx
// Initialize SDK services
const mcpClient = new MCPClient({
  mcpUrl: 'https://your-mcp-server.com/mcp',
  apiKey: 'your-api-key'
});

const adService = new EarnLayerAdService({
  mcpClient,
  displayApiUrl: 'https://your-backend.com'
});

// Use in chat component
const handleMessage = async (message: string) => {
  const ads = await adService.fetchAds(
    message,
    'creator-id',
    'conversation-id',
    { mcpAds: true, displayAds: ['popup', 'banner'] }
  );
  
  setMcpResponse(ads.mcpAds);
  setDisplayAds(ads.displayAds);
};
```

### Ad Types Demonstrated

1. **MCP Ads**: Contextual hyperlink ads that appear as relevant links
2. **Display Ads**: Popup and banner ads in the sidebar
3. **Ad Tracking**: Impression and click tracking

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_MCP_URL=https://your-mcp-server.com/mcp
VITE_API_KEY=your-api-key
VITE_DISPLAY_API_URL=https://your-backend.com
```

### Demo Mode

The demo uses mock data to simulate real API responses. In production, replace the mock services with real API calls.

## 📱 Screenshots

### Desktop View
- Main chat interface with sidebar ads
- MCP ads displayed as relevant links
- Display ads in the sidebar

### Mobile View
- Responsive design that adapts to smaller screens
- Collapsible sidebar for ads
- Touch-friendly interface

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The demo can be deployed to any platform that supports React applications:
- Netlify
- GitHub Pages
- AWS Amplify
- Firebase Hosting

## 📚 Related Links

- **[SDK Documentation](https://github.com/choidog/earnlayer-sdk)**: Full SDK documentation and API reference
- **[EarnLayer Documentation](https://docs.earnlayer.com)**: Official EarnLayer documentation
- **[MCP Protocol](https://modelcontextprotocol.io)**: Model Context Protocol specification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@earnlayer.com
- Join our Discord: [EarnLayer Community](https://discord.gg/earnlayer)

## 🎉 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- Bundled with [Vite](https://vitejs.dev/)
- Powered by [EarnLayer](https://earnlayer.com)
