# Security Best Practices

## API Key Security

### ⚠️ CRITICAL SECURITY WARNING
**Never commit API keys to version control or expose them in client-side code.**

### Current Implementation Status

✅ **SECURE**: API keys are removed from source control  
✅ **SECURE**: Environment variables are gitignored  
✅ **SECURE**: Example configuration provided  
❌ **RISK**: API keys still exposed on client-side (VITE_ prefix)

### Recommended Security Improvements

#### 1. Server-Side API Proxy (Recommended)
Instead of using API keys directly in the frontend:

```
Frontend → Your Backend → AI APIs
```

**Benefits:**
- API keys stay on server
- Rate limiting and monitoring
- Request validation and sanitization
- Cost control

#### 2. Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your API keys to `.env.local`:
   ```bash
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Never commit** `.env.local` to version control

#### 3. API Key Restrictions

Configure API key restrictions in Google Cloud Console:
- **Application restrictions**: Limit to specific websites/IPs
- **API restrictions**: Only allow Gemini API access
- **Usage quotas**: Set daily/monthly limits

### Current Vulnerabilities

1. **Client-Side Exposure**: API keys are bundled in frontend code
2. **Public Access**: Anyone can view source and extract keys
3. **No Rate Limiting**: Direct API access without controls

### Migration Path

For production deployment:

1. **Immediate**: Remove `VITE_` prefix and use server-side proxy
2. **Short-term**: Implement backend API gateway
3. **Long-term**: Use authentication tokens with time-based expiry

## API Key Sources

- **Gemini**: https://ai.google.dev/gemini-api/docs/api-key
- **OpenAI**: https://platform.openai.com/api-keys  
- **Anthropic**: https://console.anthropic.com/

## Incident Response

If API keys are compromised:

1. **Immediately** revoke keys in respective consoles
2. Generate new keys with proper restrictions
3. Update environment variables
4. Monitor usage for unauthorized activity
5. Review access logs

## Development Guidelines

- Use `.env.local` for development keys
- Use environment-specific keys (dev/staging/prod)
- Regularly rotate API keys
- Monitor API usage and costs
- Implement proper error handling to avoid key leakage