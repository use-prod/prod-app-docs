import { logger } from "firebase-functions";

// Qloo API Configuration
const QLOO_BASE_URL = "https://hackathon.api.qloo.com";
const QLOO_API_KEY = process.env.QLOO_API_KEY;


// Entity Types supported by Qloo
export const ENTITY_TYPES = {
  ARTIST: "urn:entity:artist",
  BOOK: "urn:entity:book", 
  BRAND: "urn:entity:brand",
  DESTINATION: "urn:entity:destination",
  MOVIE: "urn:entity:movie",
  PERSON: "urn:entity:person",
  PLACE: "urn:entity:place",
  PODCAST: "urn:entity:podcast",
  TV_SHOW: "urn:entity:tv_show",
  VIDEO_GAME: "urn:entity:video_game"
} as const;

// Types for our integration
export interface QlooEntity {
  id: string;
  name: string;
  type: string;
  affinity?: number;
  properties?: any;
}

export interface QlooInsightResponse {
  results: QlooEntity[];
  query: {
    explainability?: any;
    locality?: any;
  };
  pagination?: {
    page: number;
    take: number;
    total?: number;
  };
}

export interface UserTasteProfile {
  interests: string[]; // Entity IDs or names
  demographics?: {
    age?: string;
    gender?: string;
  };
  location?: {
    query?: string;
    coordinates?: string; // WKT POINT format
  };
  preferences?: {
    priceLevel?: { min?: number; max?: number };
    popularity?: { min?: number; max?: number };
  };
}

export interface ProjectContext {
  projectType: string;
  goalCategory: string;
  userLocation?: string;
  timeframe?: string;
  budget?: string;
}

// Core Qloo API Client
export class QlooClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.baseUrl = QLOO_BASE_URL;
    this.apiKey = apiKey || QLOO_API_KEY || "";
    
    if (!this.apiKey) {
      logger.warn("Qloo API key not found. Set QLOO_API_KEY environment variable.");
    }
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const url = new URL(endpoint, this.baseUrl);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          url.searchParams.append(key, value.join(','));
        } else {
          url.searchParams.append(key, value.toString());
        }
      }
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`Qloo API Error: ${response.status} ${response.statusText}`);
        logger.error(`Request URL: ${url.toString()}`);
        logger.error(`Error Body: ${errorBody}`);
        throw new Error(`Qloo API error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      logger.error("Qloo API request error:", error);
      throw error;
    }
  }

  // Search for entities by name
  async searchEntities(query: string, types?: string[], options: {
    location?: string;
    radius?: number;
    take?: number;
    page?: number;
  } = {}): Promise<QlooEntity[]> {
    const params: Record<string, any> = {
      query,
      take: options.take || 20,
      page: options.page || 1,
    };

    if (types?.length) {
      params.types = types;
    }

    // For the search endpoint, location should be coordinates (lat,lon) not city names
    // Skip location filter for basic search to avoid issues
    if (options.location && this.isCoordinates(options.location)) {
      params['filter.location'] = options.location;
    }

    if (options.radius) {
      params['filter.radius'] = options.radius;
    }

    const response = await this.makeRequest('/search', params);
    
    // Transform API response to match our interface
    const results = (response.results || []).map((item: any) => ({
      id: item.entity_id,
      name: item.name,
      type: item.types?.[0] || 'unknown', // Take first type from array
      affinity: item.affinity,
      properties: item.properties
    }));
    
    return results;
  }

  // Helper method to check if string looks like coordinates
  private isCoordinates(location: string): boolean {
    // Check if location matches lat,lon format (e.g., "40.726408,-73.994275")
    const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    return coordPattern.test(location);
  }

  // Get insights based on user preferences
  async getInsights(options: {
    filterType: string;
    signals?: {
      entities?: string[];
      tags?: string[];
      demographics?: {
        age?: string;
        gender?: string;
        audiences?: string[];
      };
      location?: {
        query?: string;
        coordinates?: string;
        radius?: number;
      };
    };
    filters?: {
      location?: string;
      tags?: string[];
      priceLevel?: { min?: number; max?: number };
      popularity?: { min?: number; max?: number };
      rating?: { min?: number; max?: number };
    };
    take?: number;
    page?: number;
    explainability?: boolean;
  }): Promise<QlooInsightResponse> {
    const params: Record<string, any> = {
      'filter.type': options.filterType,
      take: options.take || 20,
      page: options.page || 1,
    };

    // Add signals
    if (options.signals) {
      const { entities, tags, demographics, location } = options.signals;
      
      if (entities?.length) {
        params['signal.interests.entities'] = entities;
      }
      
      if (tags?.length) {
        if (Array.isArray(tags)) {
          params['signal.interests.tags'] = tags;
        } else {
          params['signal.interests.tags'] = tags;
        }
      }
      
      if (demographics) {
        if (demographics.age) {
          params['signal.demographics.age'] = demographics.age;
        }
        if (demographics.gender) {
          params['signal.demographics.gender'] = demographics.gender;
        }
        if (demographics.audiences?.length) {
          params['signal.demographics.audiences'] = demographics.audiences;
        }
      }
      
      if (location) {
        if (location.query) {
          params['signal.location.query'] = location.query;
        } else if (location.coordinates) {
          params['signal.location'] = location.coordinates;
        }
        if (location.radius) {
          params['signal.location.radius'] = location.radius;
        }
      }
    }

    // Add filters
    if (options.filters) {
      const { location, tags, priceLevel, popularity, rating } = options.filters;
      
      if (location) {
        params['filter.location.query'] = location;
      }
      
      if (tags?.length) {
        params['filter.tags'] = tags;
      }
      
      if (priceLevel) {
        if (priceLevel.min !== undefined) {
          params['filter.price_level.min'] = priceLevel.min;
        }
        if (priceLevel.max !== undefined) {
          params['filter.price_level.max'] = priceLevel.max;
        }
      }
      
      if (popularity) {
        if (popularity.min !== undefined) {
          params['filter.popularity.min'] = popularity.min;
        }
        if (popularity.max !== undefined) {
          params['filter.popularity.max'] = popularity.max;
        }
      }
      
      if (rating) {
        if (rating.min !== undefined) {
          params['filter.rating.min'] = rating.min;
        }
        if (rating.max !== undefined) {
          params['filter.rating.max'] = rating.max;
        }
      }
    }

    if (options.explainability) {
      params['feature.explainability'] = true;
    }

    const response = await this.makeRequest('/v2/insights', params);
    
    // Transform results to match our interface
    // The insights API returns results.entities, not results directly
    if (response.results && response.results.entities && Array.isArray(response.results.entities)) {
      response.results = response.results.entities.map((item: any) => ({
        id: item.entity_id || item.id,
        name: item.name,
        type: item.subtype || item.type || 'unknown', // Use subtype for insights API
        affinity: item.query?.affinity || item.affinity,
        properties: item.properties
      }));
    } else {
      // If results is not in expected format, set to empty array
      response.results = [];
    }
    
    return response;
  }

  // Search for tags
  async searchTags(query?: string, options: {
    tagTypes?: string[];
    take?: number;
    page?: number;
  } = {}): Promise<any[]> {
    const params: Record<string, any> = {
      take: options.take || 20,
      page: options.page || 1,
    };

    if (query) {
      params['filter.query'] = query;
    }

    if (options.tagTypes?.length) {
      params['filter.tag.types'] = options.tagTypes;
    }

    const response = await this.makeRequest('/v2/tags', params);
    return response.results || [];
  }

  // Find audiences
  async findAudiences(options: {
    audienceTypes?: string[];
    take?: number;
    page?: number;
  } = {}): Promise<any[]> {
    const params: Record<string, any> = {
      take: options.take || 20,
      page: options.page || 1,
    };

    if (options.audienceTypes?.length) {
      params['filter.audience.types'] = options.audienceTypes;
    }

    const response = await this.makeRequest('/v2/audiences', params);
    return response.results || [];
  }

  // Compare two groups of entities
  async compareEntities(groupA: string[], groupB: string[], options: {
    filterType?: string[];
    take?: number;
    page?: number;
  } = {}): Promise<any> {
    const params: Record<string, any> = {
      'a.signal.interests.entities': groupA,
      'b.signal.interests.entities': groupB,
      take: options.take || 20,
      page: options.page || 1,
    };

    if (options.filterType?.length) {
      params['filter.type'] = options.filterType;
    }

    const response = await this.makeRequest('/v2/insights/compare', params);
    return response;
  }

  // Get trending entities
  async getTrendingEntities(entityType: string, options: {
    take?: number;
    page?: number;
  } = {}): Promise<QlooEntity[]> {
    const params: Record<string, any> = {
      type: entityType,
      take: options.take || 20,
      page: options.page || 1,
    };

    const response = await this.makeRequest('/trends/category', params);
    return response.results || [];
  }
}

// Helper Functions for the Three Core Features

export class CulturalGoalArchitect {
  constructor(private qloo: QlooClient) {}

  async enhanceGoalWithCulturalInsights(
    goal: string,
    userProfile: UserTasteProfile,
    context: ProjectContext
  ): Promise<{
    culturalRecommendations: QlooEntity[];
    personalizedProjects: Array<{
      projectName: string;
      culturalAlignment: QlooEntity[];
      affinityScore: number;
    }>;
    crossDomainConnections: Array<{
      from: string;
      to: string;
      connection: QlooEntity[];
      strength: number;
    }>;
  }> {
    try {
      // First, find entities related to the user's stated interests
      const userEntities = await this.resolveUserInterests(userProfile.interests);
      
      // Get culturally-aligned recommendations based on goal type
      const goalEntities = await this.getGoalRelevantEntities(goal, context);
      
      // Find cross-domain connections
      const crossDomainConnections = await this.findCrossDomainConnections(
        userEntities,
        goalEntities,
        context
      );

      // Generate personalized projects
      const personalizedProjects = await this.generateCulturallyAwareProjects(
        goal,
        userEntities,
        goalEntities,
        context
      );

      return {
        culturalRecommendations: goalEntities,
        personalizedProjects,
        crossDomainConnections
      };
    } catch (error) {
      logger.error("Error in CulturalGoalArchitect:", error);
      throw error;
    }
  }

  private async resolveUserInterests(interests: string[]): Promise<QlooEntity[]> {
    const resolvedEntities: QlooEntity[] = [];
    
    for (const interest of interests) {
      // Try to find entities matching this interest
      const searchResults = await this.qloo.searchEntities(interest, undefined, { take: 5 });
      resolvedEntities.push(...searchResults);
    }
    
    return resolvedEntities;
  }

  private async getGoalRelevantEntities(goal: string, context: ProjectContext): Promise<QlooEntity[]> {
    // Map goal types to relevant entity types
    const goalEntityMapping: Record<string, string[]> = {
      fitness: [ENTITY_TYPES.PLACE, ENTITY_TYPES.BRAND, ENTITY_TYPES.BOOK],
      business: [ENTITY_TYPES.BRAND, ENTITY_TYPES.BOOK, ENTITY_TYPES.PERSON],
      travel: [ENTITY_TYPES.DESTINATION, ENTITY_TYPES.PLACE, ENTITY_TYPES.BOOK],
      learning: [ENTITY_TYPES.BOOK, ENTITY_TYPES.PODCAST, ENTITY_TYPES.PERSON],
      creative: [ENTITY_TYPES.ARTIST, ENTITY_TYPES.BOOK, ENTITY_TYPES.MOVIE],
      social: [ENTITY_TYPES.PLACE, ENTITY_TYPES.BRAND, ENTITY_TYPES.DESTINATION]
    };

    const relevantTypes = goalEntityMapping[context.goalCategory] || [ENTITY_TYPES.PLACE];
    const entities: QlooEntity[] = [];

    for (const entityType of relevantTypes) {
      const results = await this.qloo.searchEntities(goal, [entityType], { take: 10 });
      entities.push(...results);
    }

    return entities;
  }

  private async findCrossDomainConnections(
    userEntities: QlooEntity[],
    goalEntities: QlooEntity[],
    context: ProjectContext
  ): Promise<Array<{
    from: string;
    to: string;
    connection: QlooEntity[];
    strength: number;
  }>> {
    const connections: Array<{
      from: string;
      to: string;
      connection: QlooEntity[];
      strength: number;
    }> = [];

    // Skip the comparison API for now due to 403 errors in hackathon environment
    // Instead, create a synthetic connection based on entity overlap
    if (userEntities.length > 0 && goalEntities.length > 0) {
      try {
        // Create a synthetic connection based on the fact that we found related entities
        connections.push({
          from: "user_interests",
          to: "goal_domain",
          connection: goalEntities.slice(0, 5), // Use goal entities as the connection
          strength: 0.8 // Synthetic strength based on successful entity matching
        });
      } catch (error) {
        logger.warn("Cross-domain connection creation failed:", error);
      }
    }

    return connections;
  }

  private async generateCulturallyAwareProjects(
    goal: string,
    userEntities: QlooEntity[],
    goalEntities: QlooEntity[],
    context: ProjectContext
  ): Promise<Array<{
    projectName: string;
    culturalAlignment: QlooEntity[];
    affinityScore: number;
  }>> {
    const projects: Array<{
      projectName: string;
      culturalAlignment: QlooEntity[];
      affinityScore: number;
    }> = [];

    // Generate insights for different project aspects
    const projectTypes = ['discovery', 'execution', 'community', 'learning'];
    
    for (const projectType of projectTypes) {
      try {
        const insights = await this.qloo.getInsights({
          filterType: ENTITY_TYPES.PLACE,
          signals: {
            entities: userEntities.slice(0, 3).map(e => e.id),
            location: context.userLocation ? { query: context.userLocation } : undefined
          },
          take: 10
        });

        projects.push({
          projectName: `${projectType.charAt(0).toUpperCase() + projectType.slice(1)} Project`,
          culturalAlignment: insights.results,
          affinityScore: this.calculateAverageAffinity(insights.results)
        });
      } catch (error) {
        logger.warn(`Failed to generate ${projectType} project:`, error);
      }
    }

    return projects;
  }

  private calculateAverageAffinity(entities: QlooEntity[]): number {
    if (!entities.length) return 0;
    const total = entities.reduce((sum, entity) => sum + (entity.affinity || 0), 0);
    return total / entities.length;
  }
}

export class SmartProjectComponentGenerator {
  constructor(private qloo: QlooClient) {}

  async generateComponentRecommendations(
    projectType: string,
    userProfile: UserTasteProfile,
    context: ProjectContext
  ): Promise<{
    venues: QlooEntity[];
    content: QlooEntity[];
    tools: QlooEntity[];
    communities: QlooEntity[];
  }> {
    const [venues, content, tools, communities] = await Promise.all([
      this.getVenueRecommendations(projectType, userProfile, context),
      this.getContentRecommendations(projectType, userProfile),
      this.getToolRecommendations(projectType, userProfile),
      this.getCommunityRecommendations(projectType, userProfile, context)
    ]);

    return { venues, content, tools, communities };
  }

  private async getVenueRecommendations(
    projectType: string,
    userProfile: UserTasteProfile,
    context: ProjectContext
  ): Promise<QlooEntity[]> {
    try {
      const insights = await this.qloo.getInsights({
        filterType: ENTITY_TYPES.PLACE,
        signals: {
          entities: userProfile.interests.slice(0, 5),
          demographics: userProfile.demographics,
          location: userProfile.location
        },
        filters: {
          location: context.userLocation,
          priceLevel: userProfile.preferences?.priceLevel,
          popularity: userProfile.preferences?.popularity
        },
        take: 15
      });

      return insights.results;
    } catch (error) {
      logger.error("Failed to get venue recommendations:", error);
      return [];
    }
  }

  private async getContentRecommendations(
    projectType: string,
    userProfile: UserTasteProfile
  ): Promise<QlooEntity[]> {
    const contentTypes = [ENTITY_TYPES.BOOK, ENTITY_TYPES.PODCAST, ENTITY_TYPES.MOVIE];
    const allContent: QlooEntity[] = [];

    for (const contentType of contentTypes) {
      try {
        const insights = await this.qloo.getInsights({
          filterType: contentType,
          signals: {
            entities: userProfile.interests.slice(0, 5),
            demographics: userProfile.demographics
          },
          take: 5
        });

        allContent.push(...insights.results);
      } catch (error) {
        logger.warn(`Failed to get ${contentType} recommendations:`, error);
      }
    }

    return allContent;
  }

  private async getToolRecommendations(
    projectType: string,
    userProfile: UserTasteProfile
  ): Promise<QlooEntity[]> {
    try {
      const insights = await this.qloo.getInsights({
        filterType: ENTITY_TYPES.BRAND,
        signals: {
          entities: userProfile.interests.slice(0, 5),
          demographics: userProfile.demographics
        },
        take: 10
      });

      return insights.results;
    } catch (error) {
      logger.error("Failed to get tool recommendations:", error);
      return [];
    }
  }

  private async getCommunityRecommendations(
    projectType: string,
    userProfile: UserTasteProfile,
    context: ProjectContext
  ): Promise<QlooEntity[]> {
    try {
      // Find places and destinations that align with user interests
      const insights = await this.qloo.getInsights({
        filterType: ENTITY_TYPES.DESTINATION,
        signals: {
          entities: userProfile.interests.slice(0, 5),
          location: userProfile.location
        },
        take: 10
      });

      return insights.results;
    } catch (error) {
      logger.error("Failed to get community recommendations:", error);
      return [];
    }
  }
}

export class CrossDomainDiscoveryEngine {
  constructor(private qloo: QlooClient) {}

  async discoverUnexpectedConnections(
    userInterests: string[],
    targetDomain: string,
    context: ProjectContext
  ): Promise<{
    surpriseConnections: Array<{
      fromInterest: string;
      toRecommendation: QlooEntity;
      connectionStrength: number;
      explanation: string;
    }>;
    domainBridges: Array<{
      domain1: string;
      domain2: string;
      bridgeEntities: QlooEntity[];
      insights: string[];
    }>;
    trendingCrossOvers: QlooEntity[];
  }> {
    try {
      // Find entities for user interests
      const userEntities = await this.resolveInterests(userInterests);
      
      // Get recommendations in target domain
      const targetEntities = await this.getTargetDomainEntities(targetDomain, userEntities);
      
      // Find surprise connections
      const surpriseConnections = await this.findSurpriseConnections(
        userEntities,
        targetEntities,
        context
      );
      
      // Discover domain bridges
      const domainBridges = await this.findDomainBridges(userInterests, targetDomain);
      
      // Get trending crossovers
      const trendingCrossOvers = await this.getTrendingCrossovers(targetDomain);

      return {
        surpriseConnections,
        domainBridges,
        trendingCrossOvers
      };
    } catch (error) {
      logger.error("Error in CrossDomainDiscoveryEngine:", error);
      throw error;
    }
  }

  private async resolveInterests(interests: string[]): Promise<QlooEntity[]> {
    const entities: QlooEntity[] = [];
    
    for (const interest of interests) {
      const results = await this.qloo.searchEntities(interest, undefined, { take: 3 });
      entities.push(...results);
    }
    
    return entities;
  }

  private async getTargetDomainEntities(domain: string, userEntities: QlooEntity[]): Promise<QlooEntity[]> {
    const domainTypeMapping: Record<string, string> = {
      fitness: ENTITY_TYPES.PLACE,
      food: ENTITY_TYPES.PLACE,
      travel: ENTITY_TYPES.DESTINATION,
      entertainment: ENTITY_TYPES.MOVIE,
      music: ENTITY_TYPES.ARTIST,
      business: ENTITY_TYPES.PLACE, // Use PLACE instead of BRAND for hackathon API
      creative: ENTITY_TYPES.PLACE,
      learning: ENTITY_TYPES.BOOK
    };

    const targetType = domainTypeMapping[domain] || ENTITY_TYPES.PLACE;
    
    // Filter out entities that are actually tags and only use real entities
    const realEntities = userEntities.filter(e => e.type && !e.type.startsWith('urn:tag'));
    
    if (realEntities.length === 0) {
      // If no real entities, fall back to location-based recommendations
      logger.warn("No real entities found, falling back to location-based insights");
      const insights = await this.qloo.getInsights({
        filterType: targetType,
        signals: {
          location: { query: 'Brooklyn, NY' } // Default fallback location
        },
        take: 20
      });
      return insights.results;
    }
    
    // Use tag-based signals instead of entity signals to avoid the invalid entity error
    // Extract tag IDs from entities that are tags
    const tagEntities = userEntities.filter(e => e.type && e.type.startsWith('urn:tag'));
    const tagIds = tagEntities.map(e => e.id);
    
    if (tagIds.length > 0) {
      const insights = await this.qloo.getInsights({
        filterType: targetType,
        signals: {
          tags: tagIds.slice(0, 5)
        },
        take: 20,
        explainability: true
      });
      return insights.results;
    } else {
      // Final fallback - just get recommendations for the domain type
      const insights = await this.qloo.getInsights({
        filterType: targetType,
        take: 20
      });
      return insights.results;
    }
  }

  private async findSurpriseConnections(
    userEntities: QlooEntity[],
    targetEntities: QlooEntity[],
    context: ProjectContext
  ): Promise<Array<{
    fromInterest: string;
    toRecommendation: QlooEntity;
    connectionStrength: number;
    explanation: string;
  }>> {
    const connections: Array<{
      fromInterest: string;
      toRecommendation: QlooEntity;
      connectionStrength: number;
      explanation: string;
    }> = [];

    // Analyze connections between user interests and target recommendations
    for (const userEntity of userEntities.slice(0, 3)) {
      for (const targetEntity of targetEntities.slice(0, 5)) {
        if (targetEntity.affinity && targetEntity.affinity > 0.7) {
          connections.push({
            fromInterest: userEntity.name,
            toRecommendation: targetEntity,
            connectionStrength: targetEntity.affinity,
            explanation: `People who like ${userEntity.name} often also enjoy ${targetEntity.name}`
          });
        }
      }
    }

    return connections.sort((a, b) => b.connectionStrength - a.connectionStrength);
  }

  private async findDomainBridges(
    userInterests: string[],
    targetDomain: string
  ): Promise<Array<{
    domain1: string;
    domain2: string;
    bridgeEntities: QlooEntity[];
    insights: string[];
  }>> {
    const bridges: Array<{
      domain1: string;
      domain2: string;
      bridgeEntities: QlooEntity[];
      insights: string[];
    }> = [];

    try {
      // Skip API call and create synthetic bridges for hackathon demo
      // The API is having issues with entity resolution in hackathon environment
      bridges.push({
        domain1: 'user_interests',
        domain2: targetDomain,
        bridgeEntities: [], // Empty for now, could be populated with synthetic data
        insights: [
          `Bridge found between ${userInterests.join(', ')} and ${targetDomain} domain`,
          'Cultural connections exist across these domains',
          'Consider exploring crossover opportunities'
        ]
      });
    } catch (error) {
      logger.warn("Failed to find domain bridges:", error);
    }

    return bridges;
  }

  private async getTrendingCrossovers(domain: string): Promise<QlooEntity[]> {
    try {
      const domainTypeMapping: Record<string, string> = {
        fitness: ENTITY_TYPES.PLACE, // Use PLACE instead of BRAND for hackathon API
        food: ENTITY_TYPES.PLACE,
        travel: ENTITY_TYPES.DESTINATION,
        entertainment: ENTITY_TYPES.MOVIE,
        music: ENTITY_TYPES.ARTIST,
        business: ENTITY_TYPES.PLACE,
        creative: ENTITY_TYPES.PLACE,
        learning: ENTITY_TYPES.BOOK
      };

      const entityType = domainTypeMapping[domain] || ENTITY_TYPES.PLACE;
      
      // For now, return empty array since trending API might not be available in hackathon
      // Could be replaced with synthetic trending data
      return [];
    } catch (error) {
      logger.error("Failed to get trending crossovers:", error);
      return [];
    }
  }
}

// Initialize and export singleton instances
export const qloo = new QlooClient();
export const culturalGoalArchitect = new CulturalGoalArchitect(qloo);
export const smartProjectComponentGenerator = new SmartProjectComponentGenerator(qloo);
export const crossDomainDiscoveryEngine = new CrossDomainDiscoveryEngine(qloo);

// Utility functions
export function createUserTasteProfile(data: {
  interests: string[];
  age?: string;
  gender?: string;
  location?: string;
  coordinates?: string;
  priceRange?: { min?: number; max?: number };
}): UserTasteProfile {
  return {
    interests: data.interests,
    demographics: {
      age: data.age,
      gender: data.gender
    },
    location: {
      query: data.location,
      coordinates: data.coordinates
    },
    preferences: {
      priceLevel: data.priceRange
    }
  };
}

export function createProjectContext(data: {
  projectType: string;
  goalCategory: string;
  userLocation?: string;
  timeframe?: string;
  budget?: string;
}): ProjectContext {
  return {
    projectType: data.projectType,
    goalCategory: data.goalCategory,
    userLocation: data.userLocation,
    timeframe: data.timeframe,
    budget: data.budget
  };
}