#!/usr/bin/env node

/**
 * Qloo Integration Test Script
 * 
 * This script allows you to test all Qloo integration features from the command line.
 * 
 * Usage:
 *   npm run test-qloo [command] [options]
 * 
 * Commands:
 *   basic-api     - Test basic Qloo API connectivity
 *   goal-architect - Test Cultural Goal Architect
 *   smart-components - Test Smart Project Component Generation
 *   cross-domain  - Test Cross-Domain Discovery Engine
 *   full-demo     - Run complete demo scenario
 *   interactive   - Interactive testing mode
 * 
 * Examples:
 *   npm run test-qloo basic-api
 *   npm run test-qloo goal-architect --goal "get healthier" --interests "indie music,coffee"
 *   npm run test-qloo full-demo --location "Brooklyn, NY"
 */

import { program } from 'commander';
import * as readline from 'readline';
import { 
  qloo, 
  culturalGoalArchitect, 
  smartProjectComponentGenerator, 
  crossDomainDiscoveryEngine,
  createUserTasteProfile,
  createProjectContext,
  ENTITY_TYPES,
  QlooEntity,
  UserTasteProfile
} from './qloo-client';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

function printHeader(title: string) {
  console.log('\n' + '='.repeat(60));
  colorLog(colors.cyan + colors.bright, `🎯 ${title}`);
  console.log('='.repeat(60));
}

function printSuccess(message: string) {
  colorLog(colors.green, `✅ ${message}`);
}

function printError(message: string) {
  colorLog(colors.red, `❌ ${message}`);
}

function printInfo(message: string) {
  colorLog(colors.blue, `ℹ️  ${message}`);
}

function printWarning(message: string) {
  colorLog(colors.yellow, `⚠️  ${message}`);
}

// Test 1: Basic API Connectivity
async function testBasicAPI() {
  printHeader('Basic Qloo API Connectivity Test');

  try {
    // Test 1: Simple entity search
    printInfo('Testing entity search...');
    const searchResults = await qloo.searchEntities('coffee shop', [ENTITY_TYPES.PLACE], {
      location: 'New York, NY',
      take: 5
    });
    
    if (searchResults.length > 0) {
      printSuccess(`Found ${searchResults.length} coffee shops`);
      console.log('Sample results:');
      searchResults.slice(0, 3).forEach((result, i) => {
        console.log(`  ${i + 1}. ${result.name} (${result.type})`);
      });
    } else {
      printWarning('No search results returned');
    }

    // Test 2: Basic insights query
    printInfo('Testing basic insights...');
    const insights = await qloo.getInsights({
      filterType: ENTITY_TYPES.PLACE,
      signals: {
        location: { query: 'Brooklyn, NY' },
        demographics: { age: '25_to_29' }
      },
      take: 5
    });

    if (insights.results.length > 0) {
      printSuccess(`Got ${insights.results.length} insights`);
      const avgAffinity = insights.results.reduce((sum, r) => sum + (r.affinity || 0), 0) / insights.results.length;
      console.log(`Average affinity score: ${(avgAffinity * 100).toFixed(1)}%`);
    } else {
      printWarning('No insights returned');
    }

    // Test 3: Tags search
    printInfo('Testing tags search...');
    const tags = await qloo.searchTags('coffee', { take: 5 });
    
    if (tags.length > 0) {
      printSuccess(`Found ${tags.length} coffee-related tags`);
      tags.slice(0, 3).forEach((tag, i) => {
        console.log(`  ${i + 1}. ${tag.name || tag.id}`);
      });
    } else {
      printWarning('No tags found');
    }

    printSuccess('Basic API test completed successfully!');
    return true;

  } catch (error) {
    printError(`Basic API test failed: ${error}`);
    console.error(error);
    return false;
  }
}

// Test 2: Cultural Goal Architect
async function testGoalArchitect(goal: string, interests: string[], options: any = {}) {
  printHeader('Cultural Goal Architect Test');

  try {
    printInfo(`Goal: "${goal}"`);
    printInfo(`Interests: ${interests.join(', ')}`);
    printInfo(`Location: ${options.location || 'Not specified'}`);

    const userProfile = createUserTasteProfile({
      interests,
      age: options.age || '25_to_29',
      gender: options.gender,
      location: options.location,
      priceRange: options.priceRange ? JSON.parse(options.priceRange) : undefined
    });

    const context = createProjectContext({
      projectType: 'user_goal',
      goalCategory: categorizeGoal(goal),
      userLocation: options.location,
      timeframe: options.timeframe || '3 months'
    });

    printInfo('Enhancing goal with cultural insights...');
    const enhancement = await culturalGoalArchitect.enhanceGoalWithCulturalInsights(
      goal,
      userProfile,
      context
    );

    // Display results
    console.log('\n📊 Results:');
    
    console.log(`\n🎯 Personalized Projects (${enhancement.personalizedProjects.length}):`);
    enhancement.personalizedProjects.forEach((project, i) => {
      console.log(`  ${i + 1}. ${project.projectName}`);
      console.log(`     Affinity Score: ${(project.affinityScore * 100).toFixed(1)}%`);
      console.log(`     Cultural Alignments: ${project.culturalAlignment.length}`);
      if (project.culturalAlignment.length > 0) {
        project.culturalAlignment.slice(0, 2).forEach(item => {
          console.log(`       - ${item.name} (${(item.affinity || 0) * 100}% match)`);
        });
      }
    });

    console.log(`\n🔗 Cross-Domain Connections (${enhancement.crossDomainConnections.length}):`);
    enhancement.crossDomainConnections.forEach((connection, i) => {
      console.log(`  ${i + 1}. ${connection.from} → ${connection.to}`);
      console.log(`     Strength: ${(connection.strength * 100).toFixed(1)}%`);
    });

    console.log(`\n💡 Cultural Recommendations (${enhancement.culturalRecommendations.length}):`);
    enhancement.culturalRecommendations.slice(0, 5).forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec.name} (${rec.type})`);
      if (rec.affinity) {
        console.log(`     Match: ${(rec.affinity * 100).toFixed(1)}%`);
      }
    });

    printSuccess('Cultural Goal Architect test completed!');
    return enhancement;

  } catch (error) {
    printError(`Goal Architect test failed: ${error}`);
    console.error(error);
    return null;
  }
}

// Test 3: Smart Project Components
async function testSmartComponents(projectType: string, interests: string[], options: any = {}) {
  printHeader('Smart Project Component Generation Test');

  try {
    printInfo(`Project Type: ${projectType}`);
    printInfo(`Interests: ${interests.join(', ')}`);

    const userProfile = createUserTasteProfile({
      interests,
      age: options.age || '30_to_34',
      gender: options.gender,
      location: options.location,
      priceRange: options.priceRange ? JSON.parse(options.priceRange) : undefined
    });

    const context = createProjectContext({
      projectType,
      goalCategory: categorizeProject(projectType),
      userLocation: options.location
    });

    printInfo('Generating smart components...');
    const recommendations = await smartProjectComponentGenerator.generateComponentRecommendations(
      projectType,
      userProfile,
      context
    );

    // Display results
    console.log('\n📊 Smart Component Recommendations:');

    console.log(`\n🏢 Venues (${recommendations.venues.length}):`);
    recommendations.venues.slice(0, 5).forEach((venue, i) => {
      console.log(`  ${i + 1}. ${venue.name}`);
      console.log(`     Type: ${venue.type}`);
      if (venue.affinity) {
        console.log(`     Cultural Match: ${(venue.affinity * 100).toFixed(1)}%`);
      }
    });

    console.log(`\n📚 Content (${recommendations.content.length}):`);
    recommendations.content.slice(0, 5).forEach((content, i) => {
      console.log(`  ${i + 1}. ${content.name}`);
      console.log(`     Type: ${content.type}`);
      if (content.affinity) {
        console.log(`     Relevance: ${(content.affinity * 100).toFixed(1)}%`);
      }
    });

    console.log(`\n🛠️  Tools & Brands (${recommendations.tools.length}):`);
    recommendations.tools.slice(0, 5).forEach((tool, i) => {
      console.log(`  ${i + 1}. ${tool.name}`);
      console.log(`     Type: ${tool.type}`);
      if (tool.affinity) {
        console.log(`     Cultural Fit: ${(tool.affinity * 100).toFixed(1)}%`);
      }
    });

    console.log(`\n👥 Communities (${recommendations.communities.length}):`);
    recommendations.communities.slice(0, 5).forEach((community, i) => {
      console.log(`  ${i + 1}. ${community.name}`);
      console.log(`     Type: ${community.type}`);
      if (community.affinity) {
        console.log(`     Alignment: ${(community.affinity * 100).toFixed(1)}%`);
      }
    });

    printSuccess('Smart Components test completed!');
    return recommendations;

  } catch (error) {
    printError(`Smart Components test failed: ${error}`);
    console.error(error);
    return null;
  }
}

// Test 4: Cross-Domain Discovery
async function testCrossDomainDiscovery(interests: string[], targetDomain: string, options: any = {}) {
  printHeader('Cross-Domain Discovery Engine Test');

  try {
    printInfo(`Interests: ${interests.join(', ')}`);
    printInfo(`Target Domain: ${targetDomain}`);

    const context = createProjectContext({
      projectType: 'discovery',
      goalCategory: targetDomain,
      userLocation: options.location
    });

    printInfo('Discovering cross-domain connections...');
    const discoveries = await crossDomainDiscoveryEngine.discoverUnexpectedConnections(
      interests,
      targetDomain,
      context
    );

    // Display results
    console.log('\n🔍 Cross-Domain Discoveries:');

    console.log(`\n💫 Surprise Connections (${discoveries.surpriseConnections.length}):`);
    discoveries.surpriseConnections.slice(0, 5).forEach((connection, i) => {
      console.log(`  ${i + 1}. ${connection.fromInterest} → ${connection.toRecommendation.name}`);
      console.log(`     Strength: ${(connection.connectionStrength * 100).toFixed(1)}%`);
      console.log(`     Insight: ${connection.explanation}`);
    });

    console.log(`\n🌉 Domain Bridges (${discoveries.domainBridges.length}):`);
    discoveries.domainBridges.forEach((bridge, i) => {
      console.log(`  ${i + 1}. ${bridge.domain1} ↔ ${bridge.domain2}`);
      console.log(`     Bridge Entities: ${bridge.bridgeEntities.length}`);
      bridge.bridgeEntities.slice(0, 3).forEach(entity => {
        console.log(`       - ${entity.name}`);
      });
      if (bridge.insights.length > 0) {
        console.log(`     Insights: ${bridge.insights[0]}`);
      }
    });

    console.log(`\n📈 Trending Crossovers (${discoveries.trendingCrossOvers?.length || 0}):`);
    if (discoveries.trendingCrossOvers && discoveries.trendingCrossOvers.length > 0) {
      discoveries.trendingCrossOvers.slice(0, 5).forEach((trend, i) => {
        console.log(`  ${i + 1}. ${trend.name}`);
        console.log(`     Type: ${trend.type}`);
        if (trend.affinity) {
          console.log(`     Trending Score: ${(trend.affinity * 100).toFixed(1)}%`);
        }
      });
    } else {
      console.log(`  No trending crossovers available for ${targetDomain} domain`);
    }

    printSuccess('Cross-Domain Discovery test completed!');
    return discoveries;

  } catch (error) {
    printError(`Cross-Domain Discovery test failed: ${error}`);
    console.error(error);
    return null;
  }
}

// Test 5: Full Demo Scenario
async function runFullDemo(options: any = {}) {
  printHeader('Full Qloo Integration Demo');

  const demoScenarios = [
    {
      name: 'Fitness Enthusiast',
      goal: 'I want to get into better shape and build healthy habits',
      interests: ['indie music', 'specialty coffee', 'urban hiking', 'mindfulness'],
      demographics: { age: '25_to_29', gender: 'female' },
      location: 'Brooklyn, NY'
    },
    {
      name: 'Aspiring Entrepreneur', 
      goal: 'I want to start a sustainable local business',
      interests: ['craft beer', 'sustainable living', 'tech startups', 'community building'],
      demographics: { age: '30_to_34', gender: 'male' },
      location: 'Austin, TX'
    },
    {
      name: 'Creative Professional',
      goal: 'I want to transition into a more creative career',
      interests: ['Japanese design', 'vinyl records', 'independent films', 'meditation'],
      demographics: { age: '28_to_35', gender: 'non-binary' },
      location: 'San Francisco, CA'
    }
  ];

  const scenario = demoScenarios[0]; // Use first scenario or allow selection
  if (options.scenario) {
    const scenarioIndex = parseInt(options.scenario) - 1;
    if (scenarioIndex >= 0 && scenarioIndex < demoScenarios.length) {
      Object.assign(scenario, demoScenarios[scenarioIndex]);
    }
  }

  printInfo(`Demo Scenario: ${scenario.name}`);
  printInfo(`Goal: ${scenario.goal}`);
  printInfo(`Location: ${scenario.location}`);

  try {
    // Step 1: Cultural Goal Enhancement
    console.log('\n🎨 Step 1: Cultural Goal Enhancement');
    const goalEnhancement = await testGoalArchitect(
      scenario.goal, 
      scenario.interests, 
      { location: scenario.location, ...scenario.demographics }
    );

    // Step 2: Smart Components for top project
    if (goalEnhancement && goalEnhancement.personalizedProjects.length > 0) {
      console.log('\n🏗️ Step 2: Smart Component Generation');  
      const topProject = goalEnhancement.personalizedProjects[0];
      await testSmartComponents(
        topProject.projectName.toLowerCase().replace(/\s+/g, '_'),
        scenario.interests,
        { location: scenario.location, ...scenario.demographics }
      );
    }

    // Step 3: Cross-Domain Discovery
    console.log('\n🔍 Step 3: Cross-Domain Discovery');
    const targetDomain = categorizeGoal(scenario.goal);
    await testCrossDomainDiscovery(
      scenario.interests,
      targetDomain,
      { location: scenario.location }
    );

    printSuccess(`Full demo completed for ${scenario.name}!`);

  } catch (error) {
    printError(`Full demo failed: ${error}`);
    console.error(error);
  }
}

// Interactive Testing Mode
async function runInteractiveMode() {
  printHeader('Interactive Qloo Testing Mode');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
  };

  try {
    printInfo('Welcome to interactive testing! Let\'s create a custom test scenario.');

    const goal = await question('\n🎯 What\'s your goal? ');
    const interestsInput = await question('🎵 What are your interests? (comma-separated) ');
    const interests = interestsInput.split(',').map(i => i.trim());
    const location = await question('📍 What\'s your location? (optional) ');
    const age = await question('👤 Age range? (25_to_35, 30_to_40, etc., optional) ');

    console.log('\n🚀 Running your custom test...');

    // Run the test
    await testGoalArchitect(goal, interests, { location, age });

    const runMore = await question('\n❓ Run smart components test too? (y/n) ');
    if (runMore.toLowerCase() === 'y') {
      const projectType = goal.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '_');
      await testSmartComponents(projectType, interests, { location, age });
    }

    const runDiscovery = await question('\n❓ Run cross-domain discovery? (y/n) ');
    if (runDiscovery.toLowerCase() === 'y') {
      const domain = await question('🎯 Target domain (fitness, business, creative, etc.) ');
      await testCrossDomainDiscovery(interests, domain, { location });
    }

    printSuccess('Interactive testing completed!');

  } catch (error) {
    printError(`Interactive mode failed: ${error}`);
  } finally {
    rl.close();
  }
}

// Utility functions
function categorizeGoal(goal: string): string {
  const goalLower = goal.toLowerCase();
  
  if (goalLower.includes('fitness') || goalLower.includes('health') || goalLower.includes('exercise') || goalLower.includes('shape')) {
    return 'fitness';
  } else if (goalLower.includes('business') || goalLower.includes('startup') || goalLower.includes('entrepreneur')) {
    return 'business';
  } else if (goalLower.includes('travel') || goalLower.includes('explore')) {
    return 'travel';
  } else if (goalLower.includes('learn') || goalLower.includes('study') || goalLower.includes('education') || goalLower.includes('career')) {
    return 'learning';
  } else if (goalLower.includes('creative') || goalLower.includes('art') || goalLower.includes('music')) {
    return 'creative';
  } else if (goalLower.includes('social') || goalLower.includes('network') || goalLower.includes('community')) {
    return 'social';
  }
  
  return 'general';
}

function categorizeProject(projectType: string): string {
  const typeMap: Record<string, string> = {
    'fitness': 'fitness',
    'health': 'fitness', 
    'business': 'business',
    'startup': 'business',
    'travel': 'travel',
    'learning': 'learning',
    'education': 'learning',
    'creative': 'creative',
    'art': 'creative',
    'social': 'social',
    'networking': 'social'
  };

  return typeMap[projectType.toLowerCase()] || 'general';
}

// CLI Setup
program
  .name('test-qloo')
  .description('Test Qloo integration features')
  .version('1.0.0');

program
  .command('basic-api')
  .description('Test basic Qloo API connectivity')
  .action(async () => {
    await testBasicAPI();
  });

program
  .command('goal-architect')
  .description('Test Cultural Goal Architect')
  .option('-g, --goal <goal>', 'Goal to enhance', 'I want to get healthier')
  .option('-i, --interests <interests>', 'Comma-separated interests', 'indie music,coffee,hiking')
  .option('-l, --location <location>', 'User location')
  .option('-a, --age <age>', 'Age range')
  .option('-p, --price-range <range>', 'Price range as JSON')
  .action(async (options) => {
    const interests = options.interests.split(',').map((i: string) => i.trim());
    await testGoalArchitect(options.goal, interests, options);
  });

program
  .command('smart-components')
  .description('Test Smart Project Component Generation')
  .option('-p, --project-type <type>', 'Project type', 'fitness_journey')
  .option('-i, --interests <interests>', 'Comma-separated interests', 'yoga,mindfulness,healthy_food')
  .option('-l, --location <location>', 'User location')
  .option('-a, --age <age>', 'Age range')
  .action(async (options) => {
    const interests = options.interests.split(',').map((i: string) => i.trim());
    await testSmartComponents(options.projectType, interests, options);
  });

program
  .command('cross-domain')
  .description('Test Cross-Domain Discovery Engine')
  .option('-i, --interests <interests>', 'Comma-separated interests', 'coffee,music,design')
  .option('-d, --domain <domain>', 'Target domain', 'business')
  .option('-l, --location <location>', 'User location')
  .action(async (options) => {
    const interests = options.interests.split(',').map((i: string) => i.trim());
    await testCrossDomainDiscovery(interests, options.domain, options);
  });

program
  .command('full-demo')
  .description('Run complete demo scenario')
  .option('-s, --scenario <number>', 'Demo scenario (1-3)', '1')
  .option('-l, --location <location>', 'Override location')
  .action(async (options) => {
    await runFullDemo(options);
  });

program
  .command('interactive')
  .description('Interactive testing mode')
  .action(async () => {
    await runInteractiveMode();
  });

// Handle command line arguments
if (require.main === module) {
  program.parse();
}

export {
  testBasicAPI,
  testGoalArchitect,
  testSmartComponents,
  testCrossDomainDiscovery,
  runFullDemo,
  runInteractiveMode
};