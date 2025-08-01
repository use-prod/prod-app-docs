# Qloo Integration for Prod App - Hackathon Submission

This integration adds **Cultural Intelligence** to your goal-setting platform using Qloo's Taste AI, implementing three core features that make goals more personally meaningful and achievable.

## 🎯 Three Core Features

### 1. **Cultural Goal Architect**
Transforms generic goals into culturally-aligned, personally meaningful objectives.

**What it does:**
- Analyzes user's cultural preferences (music, food, lifestyle)
- Suggests goal approaches that align with their taste profile
- Creates projects that feel authentic and engaging

**Example:**
```typescript
// Input: "I want to get healthier"
// User Profile: Loves indie music, specialty coffee, urban environments

// Output: Goal enhanced with:
// - Boutique fitness studios that play indie music
// - Health-focused cafes with specialty coffee
// - Urban hiking groups and outdoor activities
// - Mindfulness apps that align with indie culture aesthetics
```

### 2. **Smart Project Component Generation**
Generates project components with culturally-aware recommendations for venues, content, tools, and communities.

**What it does:**
- Recommends specific venues that match user's taste profile
- Suggests learning content (books, podcasts) aligned with their interests
- Identifies tools and brands that resonate culturally
- Finds communities and networking opportunities

**Example:**
```typescript
// Project: "Launch Local Business"
// User Profile: Craft beer enthusiast, sustainability-focused, tech background

// Generated Components:
// - Venues: Co-working spaces popular with craft beer community
// - Content: Business books that emphasize sustainability
// - Tools: Brands favored by environmentally-conscious tech entrepreneurs  
// - Communities: Austin craft beer entrepreneur meetups
```

### 3. **Cross-Domain Discovery Engine**
Finds unexpected connections between user interests and their goals, revealing innovative approaches.

**What it does:**
- Discovers surprising cultural connections between interests and goal domains
- Identifies bridge opportunities between different cultural domains
- Suggests trending crossover opportunities
- Provides innovation insights based on cultural affinities

**Example:**
```typescript
// User Interests: Japanese cuisine, minimalist design, vinyl records
// Target Domain: Starting a business

// Discoveries:
// - Japanese cuisine enthusiasts gravitate toward minimalist business aesthetics
// - Vinyl record collectors show affinity for artisanal/craft business models
// - Opportunity: Launch a minimalist design consultancy for restaurants
```

## 🚀 Implementation Guide

### Setup

1. **Install Dependencies**
   ```bash
   # Add to your package.json
   npm install node-fetch
   ```

2. **Environment Variables**
   ```bash
   # Add to your .env file
   QLOO_API_KEY=your_hackathon_api_key_here
   ```

3. **Import the Integration**
   ```typescript
   import { qlooTools } from "./qloo-integration";
   import { 
     culturalGoalArchitect,
     smartProjectComponentGenerator,
     crossDomainDiscoveryEngine
   } from "./qloo-client";
   ```

### Basic Usage

#### 1. Direct API Usage
```typescript
import { qloo, ENTITY_TYPES } from "./qloo-client";

// Search for entities
const coffeeShops = await qloo.searchEntities("specialty coffee", [ENTITY_TYPES.PLACE], {
  location: "Brooklyn, NY",
  take: 10
});

// Get culturally-aligned recommendations
const insights = await qloo.getInsights({
  filterType: ENTITY_TYPES.PLACE,
  signals: {
    entities: ["indie_music_venue_id", "specialty_coffee_shop_id"],
    demographics: { age: "25_to_35", gender: "female" },
    location: { query: "Brooklyn, NY" }
  },
  take: 15
});
```

#### 2. Cultural Goal Enhancement
```typescript
import { culturalGoalArchitect, createUserTasteProfile, createProjectContext } from "./qloo-client";

const userProfile = createUserTasteProfile({
  interests: ["indie music", "specialty coffee", "urban hiking"],
  age: "25_to_35",
  location: "Brooklyn, NY"
});

const context = createProjectContext({
  projectType: "wellness_journey",
  goalCategory: "fitness",
  userLocation: "Brooklyn, NY"
});

const enhancement = await culturalGoalArchitect.enhanceGoalWithCulturalInsights(
  "I want to get healthier",
  userProfile,
  context
);
```

#### 3. Smart Component Generation
```typescript
const recommendations = await smartProjectComponentGenerator.generateComponentRecommendations(
  "local_business_launch",
  userProfile,
  context
);

// Returns: { venues, content, tools, communities }
```

### Integration with Existing Genkit Tools

Your existing goal generation now includes Qloo tools automatically:

```typescript
// In generate-goal.ts - the tools are already integrated
const result = await ai.generate({
  system: promptString + culturalIntelligencePrompt,
  messages: allMessages,
  tools: [askClarification, completeGeneration, ...qlooTools], // ← Qloo tools added
  context: {userId, conversationId}
});
```

The AI can now use these tools when appropriate:
- `enhance_goal_with_cultural_insights`
- `generate_smart_project_components`  
- `discover_cross_domain_connections`

## 📊 Data Flow

```
User Input (Goal + Context)
        ↓
Extract Cultural Profile
        ↓
Qloo Taste AI Analysis
        ↓
Cultural Recommendations
        ↓
Enhanced Goal System
        ↓
Culturally-Aligned Projects & Components
```

## 🎪 Demo Scenarios

### Scenario 1: Fitness Goal
**Input:** "I want to get into better shape"
**User Profile:** Indie music lover, coffee enthusiast, urban professional

**Cultural Enhancement:**
- Boutique fitness studios with curated playlists
- Workout classes at venues that serve specialty coffee
- Urban hiking groups that meet at indie venues
- Fitness apps with aesthetics that match indie culture

### Scenario 2: Business Goal  
**Input:** "I want to start a local business"
**User Profile:** Craft beer enthusiast, sustainability advocate, tech background

**Cultural Enhancement:**
- Co-working spaces popular with craft beer entrepreneurs
- Sustainable business networking events
- Local suppliers aligned with craft/artisanal values
- Tech tools favored by environmentally-conscious startups

### Scenario 3: Learning Goal
**Input:** "I want to learn a new skill"
**User Profile:** Minimalist design lover, meditation practitioner, audiobook listener

**Cultural Enhancement:**
- Learning platforms with minimalist interfaces
- Meditation-adjacent skill development (mindful coding, design thinking)
- Audio-first learning resources and podcasts
- Study spaces that embrace minimalist aesthetics

## 🏆 Hackathon Value Proposition

### Innovation Points:
1. **First integration** of cultural intelligence with productivity/goal-setting
2. **Personalization beyond demographics** - using actual taste preferences
3. **Cross-domain insights** that reveal unexpected opportunities
4. **Cultural sustainability** - goals that align with identity are more likely to succeed

### Technical Achievement:
- Complex API integration with proper error handling
- Sophisticated data transformation and analysis
- Seamless integration with existing LLM tools
- Production-ready architecture with TypeScript types

### Real-World Impact:
- **Higher goal completion rates** through cultural alignment
- **More innovative approaches** via cross-domain discovery
- **Reduced decision fatigue** with curated, relevant recommendations
- **Authentic user experience** that respects individual taste

## 🔧 API Reference

### Key Endpoints Used:
- `GET /v2/insights` - Core recommendation engine
- `GET /search` - Entity search and resolution
- `GET /v2/tags` - Tag-based filtering
- `GET /v2/audiences` - Demographic targeting
- `GET /v2/insights/compare` - Cross-domain analysis

### Entity Types Supported:
- `urn:entity:place` - Venues, restaurants, locations
- `urn:entity:brand` - Tools, services, companies
- `urn:entity:book` - Learning resources
- `urn:entity:podcast` - Audio content
- `urn:entity:artist` - Music and cultural references
- `urn:entity:destination` - Travel and exploration
- `urn:entity:movie` - Entertainment content

## 🎯 Next Steps for Production

1. **User Onboarding Flow** - Collect taste preferences during signup
2. **Continuous Learning** - Update user profiles based on goal interactions
3. **A/B Testing** - Compare culturally-enhanced vs. generic goal systems
4. **Geographic Expansion** - Leverage Qloo's global data for international users
5. **Community Features** - Connect users with similar cultural profiles
6. **Progress Tracking** - Monitor how cultural alignment affects goal completion

## 📝 Files Created

- `qloo-client.ts` - Core API client and utility functions
- `qloo-integration.ts` - Genkit tool definitions and integrations
- `qloo-usage-examples.ts` - Comprehensive usage examples
- `generate-goal.ts` - Enhanced with Qloo integration
- This README file

Your hackathon submission now demonstrates how AI can become culturally intelligent, creating more meaningful and successful goal-achievement experiences for users.