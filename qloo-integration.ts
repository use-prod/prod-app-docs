import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { openAI } from "@genkit-ai/compat-oai/openai";
import { enableFirebaseTelemetry } from "@genkit-ai/firebase";
import { logger } from "firebase-functions";
import { 
  qloo, 
  culturalGoalArchitect, 
  smartProjectComponentGenerator, 
  crossDomainDiscoveryEngine,
  createUserTasteProfile,
  createProjectContext,
  UserTasteProfile,
  ProjectContext,
  QlooEntity,
  ENTITY_TYPES
} from "./qloo-client";

enableFirebaseTelemetry();

const ai = genkit({
  model: openAI.model("o3-mini"),
});

// Enhanced Goal Generation with Qloo Integration
export const enhanceGoalWithCulturalInsights = ai.defineTool({
  name: "enhance_goal_with_cultural_insights",
  description: "Use Qloo's Taste AI to enhance goal generation with cultural insights and personalized recommendations",
  inputSchema: z.object({
    goal: z.string().describe("The user's stated goal"),
    userInterests: z.array(z.string()).describe("User's stated interests, hobbies, or preferences"),
    demographics: z.object({
      age: z.string().optional(),
      gender: z.string().optional()
    }).optional(),
    location: z.string().optional().describe("User's location for location-based recommendations"),
    goalCategory: z.string().describe("Category of the goal (fitness, business, travel, learning, creative, social)")
  }),
  outputSchema: z.object({
    culturalEnhancement: z.object({
      personalizedProjects: z.array(z.object({
        projectName: z.string(),
        culturalAlignment: z.array(z.object({
          name: z.string(),
          type: z.string(),
          affinity: z.number().optional()
        })),
        affinityScore: z.number()
      })),
      crossDomainConnections: z.array(z.object({
        from: z.string(),
        to: z.string(),
        strength: z.number(),
        insights: z.array(z.string())
      })),
      culturalRecommendations: z.array(z.object({
        name: z.string(),
        type: z.string(),
        affinity: z.number().optional(),
        relevance: z.string()
      }))
    }),
    enhancedGoalDescription: z.string().describe("Goal description enhanced with cultural context"),
    culturalFitScore: z.number().describe("Overall cultural fit score (0-100)")
  })
}, async (input) => {
  try {
    logger.info("🎨 Enhancing goal with cultural insights:", input.goal);

    // Create user taste profile
    const userProfile = createUserTasteProfile({
      interests: input.userInterests,
      age: input.demographics?.age,
      gender: input.demographics?.gender,
      location: input.location
    });

    // Create project context
    const context = createProjectContext({
      projectType: "goal_enhancement",
      goalCategory: input.goalCategory,
      userLocation: input.location
    });

    // Get cultural insights
    const insights = await culturalGoalArchitect.enhanceGoalWithCulturalInsights(
      input.goal,
      userProfile,
      context
    );

    // Calculate cultural fit score
    const culturalFitScore = calculateCulturalFitScore(insights);

    // Generate enhanced goal description
    const enhancedGoalDescription = generateEnhancedGoalDescription(
      input.goal,
      insights,
      input.userInterests
    );

    return {
      culturalEnhancement: {
        personalizedProjects: insights.personalizedProjects.map(project => ({
          projectName: project.projectName,
          culturalAlignment: project.culturalAlignment.map(entity => ({
            name: entity.name,
            type: entity.type,
            affinity: entity.affinity
          })),
          affinityScore: project.affinityScore
        })),
        crossDomainConnections: insights.crossDomainConnections.map(conn => ({
          from: conn.from,
          to: conn.to,
          strength: conn.strength,
          insights: [`Strong cultural alignment between ${conn.from} and ${conn.to}`]
        })),
        culturalRecommendations: insights.culturalRecommendations.map(rec => ({
          name: rec.name,
          type: rec.type,
          affinity: rec.affinity,
          relevance: "Aligns with your cultural preferences and goal objectives"
        }))
      },
      enhancedGoalDescription,
      culturalFitScore
    };
  } catch (error) {
    logger.error("🔴 Error enhancing goal with cultural insights:", error);
    throw error;
  }
});

// Smart Project Component Generation with Qloo
export const generateSmartProjectComponents = ai.defineTool({
  name: "generate_smart_project_components",
  description: "Generate culturally-aware project components using Qloo's recommendations",
  inputSchema: z.object({
    projectName: z.string(),
    projectDescription: z.string(),
    projectType: z.string(),
    userInterests: z.array(z.string()),
    demographics: z.object({
      age: z.string().optional(),
      gender: z.string().optional()
    }).optional(),
    location: z.string().optional(),
    preferences: z.object({
      priceRange: z.object({
        min: z.number().optional(),
        max: z.number().optional()
      }).optional(),
      popularityLevel: z.object({
        min: z.number().optional(),
        max: z.number().optional()
      }).optional()
    }).optional()
  }),
  outputSchema: z.object({
    smartComponents: z.object({
      venues: z.array(z.object({
        name: z.string(),
        type: z.string(),
        affinity: z.number().optional(),
        relevance: z.string()
      })),
      content: z.array(z.object({
        name: z.string(),
        type: z.string(),
        affinity: z.number().optional(),
        category: z.string()
      })),
      tools: z.array(z.object({
        name: z.string(),
        type: z.string(),
        affinity: z.number().optional(),
        useCase: z.string()
      })),
      communities: z.array(z.object({
        name: z.string(),
        type: z.string(),
        affinity: z.number().optional(),
        connectionType: z.string()
      }))
    }),
    componentSuggestions: z.array(z.object({
      componentName: z.string(),
      componentType: z.enum(["workspace", "task_group", "file_repository", "app_factory"]),
      culturalData: z.any(),
      primingPrompt: z.string()
    }))
  })
}, async (input) => {
  try {
    logger.info("🏗️ Generating smart project components for:", input.projectName);

    // Create user taste profile
    const userProfile = createUserTasteProfile({
      interests: input.userInterests,
      age: input.demographics?.age,
      gender: input.demographics?.gender,
      location: input.location,
      priceRange: input.preferences?.priceRange
    });

    // Create project context
    const context = createProjectContext({
      projectType: input.projectType,
      goalCategory: categorizeProject(input.projectType),
      userLocation: input.location
    });

    // Generate component recommendations
    const recommendations = await smartProjectComponentGenerator.generateComponentRecommendations(
      input.projectType,
      userProfile,
      context
    );

    // Generate component suggestions based on recommendations
    const componentSuggestions = generateComponentSuggestions(
      input.projectName,
      input.projectDescription,
      recommendations
    );

    return {
      smartComponents: {
        venues: recommendations.venues.map(venue => ({
          name: venue.name,
          type: venue.type,
          affinity: venue.affinity,
          relevance: "Culturally aligned venue for your project activities"
        })),
        content: recommendations.content.map(content => ({
          name: content.name,
          type: content.type,
          affinity: content.affinity,
          category: mapEntityTypeToCategory(content.type)
        })),
        tools: recommendations.tools.map(tool => ({
          name: tool.name,
          type: tool.type,
          affinity: tool.affinity,
          useCase: "Recommended based on your taste profile"
        })),
        communities: recommendations.communities.map(community => ({
          name: community.name,
          type: community.type,
          affinity: community.affinity,
          connectionType: "Cultural alignment"
        }))
      },
      componentSuggestions
    };
  } catch (error) {
    logger.error("🔴 Error generating smart project components:", error);
    throw error;
  }
});

// Cross-Domain Discovery Engine
export const discoverCrossDomainConnections = ai.defineTool({
  name: "discover_cross_domain_connections",
  description: "Find unexpected connections between user interests and target domains using Qloo",
  inputSchema: z.object({
    userInterests: z.array(z.string()),
    targetDomain: z.string(),
    goalContext: z.string().optional(),
    location: z.string().optional()
  }),
  outputSchema: z.object({
    discoveries: z.object({
      surpriseConnections: z.array(z.object({
        fromInterest: z.string(),
        toRecommendation: z.string(),
        connectionStrength: z.number(),
        explanation: z.string()
      })),
      domainBridges: z.array(z.object({
        domain1: z.string(),
        domain2: z.string(),
        bridgeEntities: z.array(z.string()),
        insights: z.array(z.string())
      })),
      trendingCrossOvers: z.array(z.object({
        name: z.string(),
        type: z.string(),
        trendingScore: z.number().optional()
      }))
    }),
    actionableInsights: z.array(z.string()),
    innovationOpportunities: z.array(z.object({
      opportunity: z.string(),
      potential: z.string(),
      culturalBasis: z.string()
    }))
  })
}, async (input) => {
  try {
    logger.info("🔍 Discovering cross-domain connections for:", input.targetDomain);

    // Create project context
    const context = createProjectContext({
      projectType: "discovery",
      goalCategory: input.targetDomain,
      userLocation: input.location
    });

    // Discover connections
    const discoveries = await crossDomainDiscoveryEngine.discoverUnexpectedConnections(
      input.userInterests,
      input.targetDomain,
      context
    );

    // Generate actionable insights
    const actionableInsights = generateActionableInsights(discoveries, input.targetDomain);

    // Identify innovation opportunities
    const innovationOpportunities = identifyInnovationOpportunities(discoveries, input);

    return {
      discoveries: {
        surpriseConnections: discoveries.surpriseConnections.map(conn => ({
          fromInterest: conn.fromInterest,
          toRecommendation: conn.toRecommendation.name,
          connectionStrength: conn.connectionStrength,
          explanation: conn.explanation
        })),
        domainBridges: discoveries.domainBridges.map(bridge => ({
          domain1: bridge.domain1,
          domain2: bridge.domain2,
          bridgeEntities: bridge.bridgeEntities.map(e => e.name),
          insights: bridge.insights
        })),
        trendingCrossOvers: discoveries.trendingCrossOvers.map(trend => ({
          name: trend.name,
          type: trend.type,
          trendingScore: trend.affinity
        }))
      },
      actionableInsights,
      innovationOpportunities
    };
  } catch (error) {
    logger.error("🔴 Error discovering cross-domain connections:", error);
    throw error;
  }
});

// Utility Functions
function calculateCulturalFitScore(insights: any): number {
  // Calculate based on affinity scores and connections
  const personalizedProjects = insights.personalizedProjects || [];
  const crossDomainConnections = insights.crossDomainConnections || [];
  
  let totalScore = 0;
  let count = 0;

  personalizedProjects.forEach((project: any) => {
    totalScore += project.affinityScore * 100;
    count++;
  });

  crossDomainConnections.forEach((connection: any) => {
    totalScore += connection.strength * 100;
    count++;
  });

  return count > 0 ? Math.round(totalScore / count) : 70; // Default score
}

function generateEnhancedGoalDescription(
  originalGoal: string,
  insights: any,
  userInterests: string[]
): string {
  const culturalElements = insights.culturalRecommendations?.slice(0, 3).map((rec: any) => rec.name) || [];
  
  return `${originalGoal} - Enhanced with cultural intelligence: Leveraging your interests in ${userInterests.join(', ')}, this goal incorporates culturally-aligned elements like ${culturalElements.join(', ')} to make your journey more personally meaningful and sustainable.`;
}

function categorizeProject(projectType: string): string {
  const categoryMap: Record<string, string> = {
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

  return categoryMap[projectType.toLowerCase()] || 'general';
}

function mapEntityTypeToCategory(entityType: string): string {
  const typeMap: Record<string, string> = {
    [ENTITY_TYPES.BOOK]: 'Learning Resource',
    [ENTITY_TYPES.PODCAST]: 'Audio Content',
    [ENTITY_TYPES.MOVIE]: 'Visual Content',
    [ENTITY_TYPES.ARTIST]: 'Music & Art',
    [ENTITY_TYPES.BRAND]: 'Tools & Services',
    [ENTITY_TYPES.PLACE]: 'Venues & Locations',
    [ENTITY_TYPES.DESTINATION]: 'Travel & Exploration'
  };

  return typeMap[entityType] || 'General';
}

function generateComponentSuggestions(
  projectName: string,
  projectDescription: string,
  recommendations: any
): Array<{
  componentName: string;
  componentType: "workspace" | "task_group" | "file_repository" | "app_factory";
  culturalData: any;
  primingPrompt: string;
}> {
  const suggestions: Array<{
    componentName: string;
    componentType: "workspace" | "task_group" | "file_repository" | "app_factory";
    culturalData: any;
    primingPrompt: string;
  }> = [];

  // Venue-based component
  if (recommendations.venues?.length > 0) {
    suggestions.push({
      componentName: "Cultural Venues & Locations",
      componentType: "task_group",
      culturalData: {
        recommendedVenues: recommendations.venues.slice(0, 5),
        defaultView: "database",
        supportedViews: ["database", "list", "board"]
      },
      primingPrompt: `Welcome to your culturally-curated venue guide for ${projectName}! I've identified ${recommendations.venues.length} venues that align with your taste profile. These locations aren't just functional—they're places where you'll feel genuinely excited to spend time. Which type of venue activity would you like to prioritize first for your project?`
    });
  }

  // Content-based component
  if (recommendations.content?.length > 0) {
    suggestions.push({
      componentName: "Personalized Learning Library",
      componentType: "file_repository",
      culturalData: {
        recommendedContent: recommendations.content.slice(0, 10),
        contentTypes: ["books", "podcasts", "videos", "articles"]
      },
      primingPrompt: `This is your personalized content library for ${projectName}, curated based on your interests and learning style. I've found ${recommendations.content.length} resources that should resonate with your taste. What specific aspect of your project would you like to dive deeper into first?`
    });
  }

  // Tools/Brand component
  if (recommendations.tools?.length > 0) {
    suggestions.push({
      componentName: "Culturally-Aligned Tools & Brands",
      componentType: "task_group",
      culturalData: {
        recommendedBrands: recommendations.tools.slice(0, 8),
        defaultView: "list",
        supportedViews: ["list", "database"]
      },
      primingPrompt: `Here are tools and brands that align with your cultural preferences for ${projectName}. These aren't just functional recommendations—they're brands that people with similar tastes genuinely love using. Which category of tools is most critical for getting started with your project?`
    });
  }

  return suggestions;
}

function generateActionableInsights(discoveries: any, targetDomain: string): string[] {
  const insights: string[] = [];

  if (discoveries.surpriseConnections?.length > 0) {
    insights.push(`Your interests reveal ${discoveries.surpriseConnections.length} unexpected connections to ${targetDomain} - leverage these for unique approaches`);
  }

  if (discoveries.domainBridges?.length > 0) {
    insights.push(`${discoveries.domainBridges.length} bridge opportunities identified between your interests and ${targetDomain} domain`);
  }

  if (discoveries.trendingCrossOvers?.length > 0) {
    insights.push(`${discoveries.trendingCrossOvers.length} trending crossover opportunities in ${targetDomain} align with your profile`);
  }

  insights.push(`Consider approaching ${targetDomain} through the lens of your existing interests for better engagement`);
  insights.push(`Look for communities and brands that bridge your interests with ${targetDomain} objectives`);

  return insights;
}

function identifyInnovationOpportunities(discoveries: any, input: any): Array<{
  opportunity: string;
  potential: string;
  culturalBasis: string;
}> {
  const opportunities: Array<{
    opportunity: string;
    potential: string;
    culturalBasis: string;
  }> = [];

  // Base opportunities on surprise connections
  discoveries.surpriseConnections?.slice(0, 3).forEach((connection: any) => {
    opportunities.push({
      opportunity: `Create a ${input.targetDomain} solution that incorporates elements from ${connection.fromInterest}`,
      potential: `High - based on ${Math.round(connection.connectionStrength * 100)}% cultural affinity`,
      culturalBasis: connection.explanation
    });
  });

  // Add domain bridge opportunities
  if (discoveries.domainBridges?.length > 0) {
    opportunities.push({
      opportunity: `Develop cross-domain partnerships or products`,
      potential: "Medium to High - untapped market potential",
      culturalBasis: "Strong cultural bridges exist between your interests and target domain"
    });
  }

  return opportunities;
}

// Export tools for use in other modules
export const qlooTools = [
  enhanceGoalWithCulturalInsights,
  generateSmartProjectComponents,
  discoverCrossDomainConnections
];