# Qloo Integration Testing Guide

This guide provides comprehensive instructions for testing your Qloo integration using command-line scripts and interactive tools.

## 🚀 Quick Start

### Prerequisites

1. **Set your Qloo API key:**
   ```bash
   export QLOO_API_KEY=your_hackathon_api_key_here
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run a quick test:**
   ```bash
   # Option 1: Using npm scripts
   npm run test:qloo:basic
   
   # Option 2: Using bash script
   ./test-qloo.sh basic-api
   
   # Option 3: Quick demo
   ./test-qloo.sh demo
   ```

## 📋 Available Testing Methods

### Method 1: NPM Scripts (Recommended for Development)

```bash
# Test individual features
npm run test:qloo:basic          # Basic API connectivity
npm run test:qloo:goal           # Cultural Goal Architect
npm run test:qloo:components     # Smart Project Components
npm run test:qloo:discovery      # Cross-Domain Discovery
npm run test:qloo:demo           # Full demo scenario
npm run test:qloo:interactive    # Interactive mode

# Run comprehensive tests
npm run qloo:demo               # Quick demo via bash script
npm run qloo:all                # All tests via bash script
```

### Method 2: Bash Script (Best for Demos and CI)

```bash
# Make script executable (one time only)
chmod +x test-qloo.sh

# Basic usage
./test-qloo.sh [command] [options]

# Available commands
./test-qloo.sh help              # Show help
./test-qloo.sh check             # Check prerequisites  
./test-qloo.sh basic-api         # Test API connectivity
./test-qloo.sh goal-architect    # Test goal enhancement
./test-qloo.sh smart-components  # Test component generation
./test-qloo.sh cross-domain      # Test discovery engine
./test-qloo.sh full-demo         # Run complete demo
./test-qloo.sh interactive       # Interactive testing
./test-qloo.sh all              # Run all tests
./test-qloo.sh demo             # Quick demo presentation
```

### Method 3: Direct TypeScript Execution

```bash
# Using npx tsx
npx tsx src/test-qloo.ts [command] [options]

# Using ts-node (if installed globally)
ts-node src/test-qloo.ts [command] [options]
```

## 🎯 Detailed Command Examples

### 1. Basic API Test
Tests Qloo API connectivity and basic functionality.

```bash
# Simple test
./test-qloo.sh basic-api

# Expected output:
# ✅ Found 5 coffee shops
# ✅ Got 15 insights with average affinity: 78.3%
# ✅ Found 8 coffee-related tags
```

### 2. Cultural Goal Architect
Enhances goals with cultural intelligence.

```bash
# Default test
./test-qloo.sh goal-architect

# Custom test
./test-qloo.sh goal-architect \
  --goal "I want to start a creative business" \
  --interests "indie music,art galleries,sustainable living" \
  --location "Portland, OR" \
  --age "28_to_35"

# Using npm
npm run test:qloo:goal -- \
  --goal "I want to get healthier" \
  --interests "yoga,meditation,organic food"
```

**Sample Output:**
```
🎯 Personalized Projects (3):
  1. Discovery Project
     Affinity Score: 85.2%
     Cultural Alignments: 12
       - Blue Bottle Coffee (89% match)
       - Local Hiking Groups (76% match)

🔗 Cross-Domain Connections (2):
  1. user_interests → goal_domain
     Strength: 82.1%

💡 Cultural Recommendations (15):
  1. Specialized Fitness Studios (urn:entity:place)
     Match: 91.3%
```

### 3. Smart Project Components
Generates culturally-aware project components.

```bash
# Business project example
./test-qloo.sh smart-components \
  --project-type "local_business_launch" \
  --interests "craft beer,sustainability,tech" \
  --location "Austin, TX" \
  --age "30_to_40"

# Fitness project example  
./test-qloo.sh smart-components \
  --project-type "fitness_journey" \
  --interests "yoga,mindfulness,plant_based_nutrition" \
  --location "Boulder, CO"
```

**Sample Output:**
```
🏢 Venues (8):
  1. WeWork Austin Downtown
     Type: urn:entity:place
     Cultural Match: 87.4%

📚 Content (12):
  1. "The Lean Startup" by Eric Ries  
     Type: urn:entity:book
     Relevance: 79.8%

🛠️ Tools & Brands (6):
  1. Patagonia
     Type: urn:entity:brand
     Cultural Fit: 91.2%
```

### 4. Cross-Domain Discovery
Finds unexpected connections between interests and goals.

```bash
# Discover business opportunities from creative interests
./test-qloo.sh cross-domain \
  --interests "Japanese cuisine,minimalist design,vinyl records" \
  --domain "business" \
  --location "San Francisco, CA"

# Find fitness connections from tech interests
./test-qloo.sh cross-domain \
  --interests "coding,craft coffee,electronic music" \
  --domain "fitness"
```

**Sample Output:**
```
💫 Surprise Connections (4):
  1. Japanese cuisine → Ippudo NY
     Strength: 89.3%
     Insight: People who like Japanese cuisine often gravitate toward minimalist business aesthetics

🌉 Domain Bridges (2):
  1. user_interests ↔ business
     Bridge Entities: 8
       - Muji (minimalist retail brand)
       - Blue Note Records (vinyl culture)

📈 Trending Crossovers (6):
  1. Sustainable Restaurant Brands
     Type: urn:entity:brand
     Trending Score: 84.7%
```

### 5. Full Demo Scenarios
Runs comprehensive scenarios with predefined user profiles.

```bash
# Scenario 1: Fitness Enthusiast in Brooklyn
./test-qloo.sh full-demo --scenario 1

# Scenario 2: Aspiring Entrepreneur in Austin  
./test-qloo.sh full-demo --scenario 2

# Scenario 3: Creative Professional in San Francisco
./test-qloo.sh full-demo --scenario 3

# Custom demo with location override
./test-qloo.sh full-demo --scenario 1 --location "Seattle, WA"
```

**Demo Scenarios:**
1. **Fitness Enthusiast**: Indie music lover, coffee enthusiast, urban hiker in Brooklyn, NY
2. **Aspiring Entrepreneur**: Craft beer fan, sustainability advocate, tech background in Austin, TX  
3. **Creative Professional**: Japanese design lover, vinyl collector, film buff in San Francisco, CA

### 6. Interactive Testing Mode
Allows custom input for personalized testing.

```bash
# Start interactive mode
./test-qloo.sh interactive

# Or with npm
npm run test:qloo:interactive
```

**Interactive Flow:**
```
🎯 What's your goal? I want to learn photography
🎵 What are your interests? (comma-separated) travel,coffee,indie music,design
📍 What's your location? (optional) Brooklyn, NY
👤 Age range? (25_to_35, 30_to_40, etc., optional) 25_to_35

🚀 Running your custom test...
[Results displayed]

❓ Run smart components test too? (y/n) y
❓ Run cross-domain discovery? (y/n) y
🎯 Target domain (fitness, business, creative, etc.) creative
```

## 🎪 Demo Presentation Mode

For hackathon presentations, use the demo mode:

```bash
# Quick 5-minute demo
./test-qloo.sh demo

# Full comprehensive demo
./test-qloo.sh all
```

The demo mode:
1. ✅ Verifies API connectivity
2. 🎨 Shows cultural goal enhancement
3. 🏗️ Demonstrates smart components
4. 🔍 Reveals cross-domain discoveries
5. 📊 Displays cultural fit scores
6. 💡 Highlights innovation opportunities

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# Qloo API configuration
export QLOO_API_KEY="your_hackathon_api_key"

# Optional configuration
export NODE_ENV="development"
export QLOO_BASE_URL="https://hackathon.api.qloo.com"  # Already set as default
```

### Setting Up Environment Variables

**Option 1: Command Line (Temporary)**
```bash
export QLOO_API_KEY=your_key_here
./test-qloo.sh basic-api
```

**Option 2: .env File (Persistent)**
```bash
# Create .env file in functions directory
echo "QLOO_API_KEY=your_key_here" > .env

# Load environment variables
source .env
./test-qloo.sh basic-api
```

**Option 3: .bashrc/.zshrc (Permanent)**
```bash
# Add to your shell profile
echo 'export QLOO_API_KEY=your_key_here' >> ~/.bashrc
source ~/.bashrc
```

## 📊 Understanding Test Output

### Success Indicators
- ✅ **Green checkmarks**: Successful operations
- **High affinity scores** (>70%): Good cultural alignment
- **Multiple recommendations**: Rich data from Qloo
- **Cross-domain connections**: Innovation opportunities found

### Warning Signs
- ⚠️ **Yellow warnings**: Non-critical issues (missing optional data)
- **Low affinity scores** (<50%): Poor cultural match
- **Empty results**: API connectivity or parameter issues

### Error Indicators  
- ❌ **Red errors**: Critical failures
- **API key issues**: Authentication problems
- **Network errors**: Connectivity problems
- **Parsing errors**: Data format issues

## 🚨 Troubleshooting

### Common Issues

**1. API Key Not Set**
```bash
Error: Qloo API key not found
Solution: export QLOO_API_KEY=your_key_here
```

**2. Dependencies Missing**
```bash
Error: Cannot find module 'commander'
Solution: npm install
```

**3. TypeScript Compilation Errors**
```bash
Error: Cannot find name 'fetch'
Solution: Make sure node-fetch is installed and imported correctly
```

**4. Permission Denied**
```bash
Error: Permission denied: ./test-qloo.sh
Solution: chmod +x test-qloo.sh
```

**5. Empty Results**
```bash
Warning: No search results returned
Possible causes:
- API key invalid
- Location too specific
- Interests not recognized by Qloo
- Network connectivity issues
```

### Debug Mode

Enable verbose logging:
```bash
# Set debug environment
export DEBUG=true
export NODE_ENV=development

# Run tests with detailed output
./test-qloo.sh basic-api
```

### Validate Setup

Run the prerequisites check:
```bash
./test-qloo.sh check

# Expected output:
# ✅ Node.js found: v22.x.x
# ✅ npm found: 10.x.x  
# ✅ npx available for TypeScript execution
# ✅ QLOO_API_KEY is set
# ✅ Test file found
```

## 🎯 Best Practices for Testing

### For Development
- Use `npm run test:qloo:basic` first to verify connectivity
- Test individual features before running full demos
- Use interactive mode for experimenting with different inputs

### For Demos  
- Always run `./test-qloo.sh check` before presenting
- Use `./test-qloo.sh demo` for quick 5-minute presentations
- Prepare interesting user profiles that showcase cultural intelligence

### For CI/CD
- Set environment variables in your CI system
- Use `./test-qloo.sh all` for comprehensive testing
- Check exit codes for automated validation

## 📈 Performance Expectations

### Expected Response Times
- **Basic API**: < 2 seconds
- **Goal Architect**: 5-10 seconds  
- **Smart Components**: 8-15 seconds
- **Cross-Domain Discovery**: 10-20 seconds
- **Full Demo**: 30-60 seconds

### Rate Limits
- Qloo hackathon API: Check current limits in hackathon documentation
- Implement exponential backoff for production use
- Monitor response times and adjust test timeouts if needed

## 🎪 Hackathon Presentation Tips

### Demo Script
1. **Start with basics**: `./test-qloo.sh basic-api`
2. **Show goal enhancement**: Use relatable example goal
3. **Demonstrate components**: Show culturally-aligned recommendations  
4. **Reveal discoveries**: Highlight unexpected connections
5. **Explain innovation**: Cultural intelligence + productivity = higher success rates

### Impressive Examples
- Show how indie music preferences lead to specific fitness studio recommendations
- Demonstrate cross-domain connections (e.g., coffee culture → business networking)
- Highlight affinity scores and cultural fit metrics
- Compare generic vs. culturally-enhanced goal systems

Your Qloo integration is now fully testable and demo-ready! 🚀