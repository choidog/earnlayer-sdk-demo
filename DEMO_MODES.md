# Demo Modes Documentation

This application now supports multiple demo modes to showcase different aspects of the AI newsletter monetization system.

## 🎯 Available Demo Modes

### 1. **Demo Mode (JSON)** - `type: 'demo'`
**Purpose**: Original demo showcasing ad concepts with JSON-based configuration

**Features**:
- Uses hardcoded responses from `src/data/new-demo.json`
- Shows ads through legacy components (`AdaptiveThinkingAd`, `AdaptiveBannerAd`, etc.)
- Thinking ads configured in JSON with fixed durations
- Simple popup and banner ads after responses
- Blue indicator: "DEMO MODE"

**Best for**: Demonstrating basic ad integration concepts and quick prototyping

### 2. **Demo Mode (API)** - `type: 'demo-api'` 
**Purpose**: Showcases the production-ready Display Ads API integration

**Features**:
- Uses `DemoApiService` with realistic API simulation
- Centralized ad state management through `AdStateContext`
- All ads rendered via `ManagedAdComponent` (production components)
- Real `run_id` generation and Display Ads API workflow
- Automatic fallback to `defaultAds.json` when no contextual ads
- Purple indicator: "DEMO API MODE"

**Best for**: Demonstrating the actual production ad system and API integration

## 🔧 Technical Architecture

### Demo Mode (JSON) Flow:
```
User Input → generateDemoResponse() → AdaptiveThinkingAd → JSON Config → Fixed Display
```

### Demo Mode (API) Flow:
```
User Input → DemoApiService → run_id → AdStateContext → DisplayAdService → ManagedAdComponent
```

## 🎮 How to Switch Modes

1. **Click the provider dropdown** in the navbar
2. **Select either**:
   - "Demo Mode (JSON)" - for JSON-based demo
   - "Demo Mode (API)" - for API-powered demo
3. **Notice the indicator change** in the top-right corner

## 🧪 Testing Scenarios

### Recommended Test Questions:

**Enterprise AI** (triggers thinking ads):
```
"What's new in enterprise AI?"
```

**Video Generation** (triggers popup ads):
```
"Tell me about AI video generation."
```

**Productivity Tools** (triggers banner ads):
```
"What's the latest trend in AI productivity tools?"
```

### Expected Behavior:

#### Demo Mode (JSON):
- Fixed 8-second thinking ad for enterprise AI
- Popup appears after video generation response
- Banner shows after productivity tools response

#### Demo Mode (API):
- Centralized ad state shows in debug modal
- Real `run_id` in console logs
- Fallback to default ads when no contextual match
- Production-ready component rendering

## 📊 Debug Information

### Console Logs to Watch:

**Demo API Mode**:
```
🤖 [DemoApiService] Generated demo API response
🔧 [useAdaptiveChat] Initializing API service  
🎯 [Ad State] Setting run ID: demo-run-xxx
🎯 [Ad State] Fetching ad: thinking
```

**JSON Demo Mode**:
```
🎯 [generateDemoResponse] Matched enterprise AI query
🎯 [useAdaptiveChat] Setting thinking ad
```

### Debug Modal:
- Click the "🎯 Ads" button in navbar
- Shows real-time ad state for API mode
- Displays current `run_id` and ad loading status

## 🚀 Live Mode vs Demo Modes

| Feature | Demo (JSON) | Demo (API) | Live Mode |
|---------|-------------|------------|-----------|
| Ad Source | JSON Config | Demo API + Default Ads | Real Display Ads API |
| Components | Legacy Adaptive | Production Managed | Production Managed |
| State Management | Local State | Centralized Context | Centralized Context |
| `run_id` | None | Simulated | Real from API |
| Indicator | Blue "DEMO MODE" | Purple "DEMO API MODE" | Red "LIVE MODE" |

## 🎯 Use Cases

**Demo Mode (JSON)**: 
- Client presentations
- Quick concept validation
- Testing ad timing and placement

**Demo Mode (API)**:
- Technical demonstrations
- Testing production ad components
- Showcasing API integration workflow
- QA testing of ad state management

**Live Mode**:
- Production environment
- Real user interactions
- Actual monetization

## 📝 Development Notes

- Both demo modes use the same content from `new-demo.json`
- API demo mode generates unique `run_id` for each conversation
- Default ads automatically load from `src/data/defaultAds.json`
- All ad analytics and tracking work in both modes
- Performance is identical - API mode just simulates realistic delays 