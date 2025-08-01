/**
 * Qloo Integration Usage Examples for Hackathon
 * 
 * This file demonstrates how to use the three core Qloo features:
 * 1. Cultural Goal Architect
 * 2. Smart Project Component Generation  
 * 3. Cross-Domain Discovery Engine
 */

import { 
  qloo, 
  culturalGoalArchitect, 
  smartProjectComponentGenerator, 
  crossDomainDiscoveryEngine,
  createUserTasteProfile,
  createProjectContext,
  ENTITY_TYPES
} from "./qloo-client";

// Example 1: Cultural Goal Architect
export async function exampleCulturalGoalArchitect() {
  console.log("🎨 Cultural Goal Architect Example");
  
  // Create a user taste profile
  const userProfile = createUserTasteProfile({
    interests: ["indie music", "specialty coffee", "urban hiking", "mindfulness apps"],
    age: "25_to_29",
    gender: "female",
    location: "Brooklyn, NY",
    priceRange: { min: 2, max: 4 }
  });

  // Create project context
  const context = createProjectContext({
    projectType: "wellness_journey",
    goalCategory: "fitness",
    userLocation: "Brooklyn, NY",
    timeframe: "3 months",
    budget: "moderate"
  });

  try {
    const enhancement = await culturalGoalArchitect.enhanceGoalWithCulturalInsights(
      "I want to get healthier and more active",
      userProfile,
      context
    );

    console.log("📊 Cultural Enhancement Results:");
    console.log("- Personalized Projects:", enhancement.personalizedProjects.length);
    console.log("- Cross-domain Connections:", enhancement.crossDomainConnections.length);
    console.log("- Cultural Recommendations:", enhancement.culturalRecommendations.length);

    // Example output structure:
    // personalizedProjects: [
    //   {
    //     projectName: "Discovery Project",
    //     culturalAlignment: [venues that play indie music, serve specialty coffee],
    //     affinityScore: 0.85
    //   }
    // ]
    
    return enhancement;
  } catch (error) {
    console.error("Error in Cultural Goal Architect:", error);
    return null;
  }
}

// Example 2: Smart Project Component Generation
export async function exampleSmartProjectComponents() {
  console.log("🏗️ Smart Project Component Generation Example");

  const userProfile = createUserTasteProfile({
    interests: ["sustainable living", "craft beer", "local businesses", "tech startups"],
    age: "30_to_34",
    gender: "male",
    location: "Austin, TX"
  });

  const context = createProjectContext({
    projectType: "local_business_launch",
    goalCategory: "business",
    userLocation: "Austin, TX",
    timeframe: "6 months"
  });

  try {
    const recommendations = await smartProjectComponentGenerator.generateComponentRecommendations(
      "local_business_launch",
      userProfile,
      context
    );

    console.log("🎯 Smart Component Recommendations:");
    console.log("- Venues:", recommendations.venues.length, "culturally-aligned locations");
    console.log("- Content:", recommendations.content.length, "learning resources");
    console.log("- Tools:", recommendations.tools.length, "recommended brands/tools");
    console.log("- Communities:", recommendations.communities.length, "networking opportunities");

    // Example output:
    // venues: [local co-working spaces that align with craft beer culture]
    // content: [business books that resonate with sustainable living values]
    // tools: [brands popular among tech startup community]
    // communities: [Austin business meetup locations]

    return recommendations;
  } catch (error) {
    console.error("Error in Smart Project Components:", error);
    return null;
  }
}

// Example 3: Cross-Domain Discovery Engine
export async function exampleCrossDomainDiscovery() {
  console.log("🔍 Cross-Domain Discovery Engine Example");

  const userInterests = [
    "Japanese cuisine",
    "minimalist design", 
    "meditation",
    "vinyl records",
    "independent films"
  ];

  const context = createProjectContext({
    projectType: "career_transition",
    goalCategory: "business",
    userLocation: "San Francisco, CA"
  });

  try {
    const discoveries = await crossDomainDiscoveryEngine.discoverUnexpectedConnections(
      userInterests,
      "business",
      context
    );

    console.log("💡 Cross-Domain Discoveries:");
    console.log("- Surprise Connections:", discoveries.surpriseConnections.length);
    console.log("- Domain Bridges:", discoveries.domainBridges.length);
    console.log("- Trending Crossovers:", discoveries.trendingCrossOvers.length);

    // Example insights:
    // - People who like Japanese cuisine often gravitate toward minimalist business aesthetics
    // - Vinyl record enthusiasts show affinity for artisanal/craft business models
    // - Meditation practitioners often succeed in consulting/coaching businesses

    return discoveries;
  } catch (error) {
    console.error("Error in Cross-Domain Discovery:", error);
    return null;
  }
}

// Example 4: Direct Qloo API Usage
export async function exampleDirectQlooAPI() {
  console.log("🔧 Direct Qloo API Usage Example");

  try {
    // Search for entities by name
    const coffeeShops = await qloo.searchEntities("specialty coffee", [ENTITY_TYPES.PLACE], {
      location: "Brooklyn, NY",
      take: 10
    });

    console.log("☕ Found", coffeeShops.length, "coffee shops");

    // Get insights based on user preferences
    const insights = await qloo.getInsights({
      filterType: ENTITY_TYPES.PLACE,
      signals: {
        entities: coffeeShops.slice(0, 3).map(shop => shop.id),
        demographics: {
          age: "25_to_29",
          gender: "female"
        },
        location: {
          query: "Brooklyn, NY"
        }
      },
      filters: {
        priceLevel: { min: 2, max: 4 },
        rating: { min: 4.0 }
      },
      take: 15,
      explainability: true
    });

    console.log("🎯 Got", insights.results.length, "culturally-aligned recommendations");
    console.log("📈 Average affinity score:", 
      insights.results.reduce((sum, r) => sum + (r.affinity || 0), 0) / insights.results.length
    );

    // Search for relevant tags
    const fitnessTag = await qloo.searchTags("yoga");
    console.log("🏷️ Found", fitnessTag.length, "yoga-related tags");

    return {
      venues: insights.results,
      tags: fitnessTag,
      explainability: insights.query.explainability
    };
  } catch (error) {
    console.error("Error in direct Qloo API usage:", error);
    return null;
  }
}

// Example 5: Integration with Your Existing Goal System
export async function exampleGoalSystemIntegration(userGoal: string, userContext: any) {
  console.log("🚀 Goal System Integration Example");

  // Extract user interests from their goal and context
  const extractedInterests = extractInterestsFromGoal(userGoal, userContext);
  
  const userProfile = createUserTasteProfile({
    interests: extractedInterests,
    age: userContext.demographics?.age,
    gender: userContext.demographics?.gender,
    location: userContext.location
  });

  // Step 1: Enhance the goal with cultural insights
  const culturalInsights = await culturalGoalArchitect.enhanceGoalWithCulturalInsights(
    userGoal,
    userProfile,
    createProjectContext({
      projectType: "user_defined_goal",
      goalCategory: categorizeGoal(userGoal),
      userLocation: userContext.location
    })
  );

  // Step 2: Generate smart components for each project
  const enhancedProjects = [];
  for (const project of culturalInsights.personalizedProjects) {
    const componentRecommendations = await smartProjectComponentGenerator.generateComponentRecommendations(
      project.projectName.toLowerCase().replace(/\s+/g, '_'),
      userProfile,
      createProjectContext({
        projectType: project.projectName.toLowerCase().replace(/\s+/g, '_'),
        goalCategory: categorizeGoal(userGoal),
        userLocation: userContext.location
      })
    );

    enhancedProjects.push({
      ...project,
      smartComponents: componentRecommendations
    });
  }

  // Step 3: Discover cross-domain opportunities
  const crossDomainInsights = await crossDomainDiscoveryEngine.discoverUnexpectedConnections(
    extractedInterests,
    categorizeGoal(userGoal),
    createProjectContext({
      projectType: "discovery",
      goalCategory: categorizeGoal(userGoal),
      userLocation: userContext.location
    })
  );

  return {
    originalGoal: userGoal,
    culturalEnhancement: culturalInsights,
    enhancedProjects,
    crossDomainOpportunities: crossDomainInsights,
    culturalFitScore: calculateOverallFitScore(culturalInsights, crossDomainInsights)
  };
}

// Utility Functions
function extractInterestsFromGoal(goal: string, context: any): string[] {
  // Simple keyword extraction - in production, use NLP
  const keywords = goal.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const contextInterests = context.interests || [];
  return [...new Set([...keywords, ...contextInterests])].slice(0, 10);
}

function categorizeGoal(goal: string): string {
  const goalLower = goal.toLowerCase();
  
  if (goalLower.includes('fitness') || goalLower.includes('health') || goalLower.includes('exercise')) {
    return 'fitness';
  } else if (goalLower.includes('business') || goalLower.includes('startup') || goalLower.includes('entrepreneur')) {
    return 'business';
  } else if (goalLower.includes('travel') || goalLower.includes('explore')) {
    return 'travel';
  } else if (goalLower.includes('learn') || goalLower.includes('study') || goalLower.includes('education')) {
    return 'learning';
  } else if (goalLower.includes('creative') || goalLower.includes('art') || goalLower.includes('music')) {
    return 'creative';
  } else if (goalLower.includes('social') || goalLower.includes('network') || goalLower.includes('community')) {
    return 'social';
  }
  
  return 'general';
}

function calculateOverallFitScore(culturalInsights: any, crossDomainInsights: any): number {
  let totalScore = 0;
  let factors = 0;

  // Factor in project affinity scores
  if (culturalInsights.personalizedProjects?.length > 0) {
    const avgProjectScore = culturalInsights.personalizedProjects.reduce(
      (sum: number, project: any) => sum + project.affinityScore, 0
    ) / culturalInsights.personalizedProjects.length;
    totalScore += avgProjectScore * 100;
    factors++;
  }

  // Factor in cross-domain connection strength
  if (crossDomainInsights.surpriseConnections?.length > 0) {
    const avgConnectionScore = crossDomainInsights.surpriseConnections.reduce(
      (sum: number, conn: any) => sum + conn.connectionStrength, 0
    ) / crossDomainInsights.surpriseConnections.length;
    totalScore += avgConnectionScore * 100;
    factors++;
  }

  // Factor in number of domain bridges
  if (crossDomainInsights.domainBridges?.length > 0) {
    totalScore += Math.min(crossDomainInsights.domainBridges.length * 10, 80);
    factors++;
  }

  return factors > 0 ? Math.round(totalScore / factors) : 70;
}

// Demo function to run all examples
export async function runAllQlooExamples() {
  console.log("🎪 Running All Qloo Integration Examples");
  console.log("=" .repeat(50));

  try {
    // Example 1
    console.log("\n1️⃣ Cultural Goal Architect");
    await exampleCulturalGoalArchitect();

    // Example 2  
    console.log("\n2️⃣ Smart Project Components");
    await exampleSmartProjectComponents();

    // Example 3
    console.log("\n3️⃣ Cross-Domain Discovery");
    await exampleCrossDomainDiscovery();

    // Example 4
    console.log("\n4️⃣ Direct API Usage");
    await exampleDirectQlooAPI();

    // Example 5
    console.log("\n5️⃣ Full Integration Example");
    await exampleGoalSystemIntegration(
      "I want to start a sustainable food business in my local community",
      {
        interests: ["organic farming", "community building", "environmental sustainability"],
        demographics: { age: "30_to_40", gender: "non-binary" },
        location: "Portland, OR"
      }
    );

    console.log("\n✅ All examples completed successfully!");
  } catch (error) {
    console.error("❌ Error running examples:", error);
  }
}

// Export for use in Firebase Functions
export {
  extractInterestsFromGoal,
  categorizeGoal,
  calculateOverallFitScore
};