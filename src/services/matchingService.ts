import type { FormData } from "@/types/form";
import { getApiBaseUrl, getAIModel } from "@/utils/envConfig";
import { getAllOpportunities, simulateMongoDBAccess } from "./mongoDBService";

// Maximum number of opportunities to display
const MAX_RESULTS = 3;

// Base URL for API requests
const API_BASE_URL = getApiBaseUrl();

// Get AI model from environment variables for display purposes only
const AI_MODEL = getAIModel();

// Initialize simulation when in development mode
if (import.meta.env.DEV) {
  console.log("Development mode detected, simulating MongoDB access");
  simulateMongoDBAccess().catch(err => console.error("Failed to simulate MongoDB access:", err));
}

// Type for match result
export interface MatchOpportunity {
  noticeId: string;
  title: string;
  agency: string;
  description: string;
  postedDate: string;
  responseDeadline: string;
  awardAmount?: number;
  naicsCode?: string;
  setAside?: string;
  placeOfPerformance?: string;
  techFocus: string[];
  eligibleStages: string[];
  timeline: string;
  url?: string;
  pointOfContact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface MatchResult {
  opportunity: MatchOpportunity;
  score: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  matchDetails: {
    techFocusMatch: number;
    stageMatch: number;
    timelineMatch: number;
    budgetMatch: number;
    keywordMatch: number;
    matchedKeywords?: string[];
    aiRecommendation?: string; // AI-generated explanation for the match
  };
}

export interface MatchResponse {
  success: boolean;
  matchCount: number;
  matches: MatchResult[];
}

/**
 * Create demo opportunities for testing
 * @returns Array of demo opportunities
 */
function createDemoOpportunities(): MatchOpportunity[] {
  const now = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(now.getMonth() + 1);
  
  return [
    {
      noticeId: 'DEMO-001',
      title: 'Advanced Satellite Communication Systems',
      agency: 'NASA',
      description: 'Development of advanced satellite communication systems for deep space missions. Looking for innovative approaches to improve data transmission rates and reduce latency in communications with spacecraft beyond Mars orbit.',
      postedDate: now.toISOString(),
      responseDeadline: oneMonthLater.toISOString(),
      awardAmount: 750000,
      techFocus: ['Communications', 'Satellites', 'Signal Processing'],
      eligibleStages: ['Growth Stage', 'Established'],
      timeline: '12-18 months',
      setAside: 'Small Business',
      placeOfPerformance: 'Contractor Site'
    },
    {
      noticeId: 'DEMO-002',
      title: 'Next-Generation Propulsion Technology',
      agency: 'Space Force',
      description: 'Research and development of efficient propulsion systems for small satellites and CubeSats. Looking for green propellant alternatives and innovative miniaturized propulsion solutions.',
      postedDate: now.toISOString(),
      responseDeadline: oneMonthLater.toISOString(),
      awardAmount: 500000,
      techFocus: ['Propulsion', 'CubeSats', 'Green Technology'],
      eligibleStages: ['Early Stage', 'Seed', 'Growth Stage'],
      timeline: '6-12 months',
      setAside: 'SBIR Eligible',
      placeOfPerformance: 'Multiple Locations'
    },
    {
      noticeId: 'DEMO-003',
      title: 'AI/ML Applications for Space Situational Awareness',
      agency: 'DARPA',
      description: 'Developing artificial intelligence and machine learning solutions for improved space situational awareness. Seeking algorithms capable of predicting orbital debris trajectories and potential collision scenarios with higher accuracy.',
      postedDate: now.toISOString(),
      responseDeadline: oneMonthLater.toISOString(),
      awardAmount: 1200000,
      techFocus: ['AI/ML', 'Space Situational Awareness', 'Orbital Mechanics'],
      eligibleStages: ['Any'],
      timeline: '24-36 months',
      setAside: 'None',
      placeOfPerformance: 'Contractor Site'
    },
    {
      noticeId: 'DEMO-004',
      title: 'Advanced Materials for Space Environment',
      agency: 'NASA',
      description: 'Development of novel materials capable of withstanding extreme space environments. Seeking innovations in radiation-resistant, thermal-adaptive, and lightweight materials for spacecraft construction and habitat development.',
      postedDate: now.toISOString(),
      responseDeadline: oneMonthLater.toISOString(),
      awardAmount: 850000,
      techFocus: ['Materials Science', 'Spacecraft Design', 'Radiation Protection'],
      eligibleStages: ['Growth Stage', 'Established'],
      timeline: '18-24 months',
      setAside: 'Small Business',
      placeOfPerformance: 'Multiple Locations'
    },
    {
      noticeId: 'DEMO-005',
      title: 'Small Satellite Constellation Management',
      agency: 'Space Force',
      description: 'Software solutions for managing and coordinating small satellite constellations. Looking for advanced algorithms for constellation maintenance, collision avoidance, and distributed data processing capabilities.',
      postedDate: now.toISOString(),
      responseDeadline: oneMonthLater.toISOString(),
      awardAmount: 650000,
      techFocus: ['Small Satellites', 'Software Systems', 'Orbital Dynamics'],
      eligibleStages: ['Seed', 'Early Stage', 'Growth Stage'],
      timeline: '12-18 months',
      setAside: 'SBIR Eligible',
      placeOfPerformance: 'Contractor Site'
    },
    {
      noticeId: 'DEMO-006',
      title: 'In-Space Manufacturing Solutions',
      agency: 'NASA',
      description: 'Technologies enabling manufacturing capabilities in space environments. Seeking innovations in 3D printing, assembly robotics, and recycling systems adapted for microgravity and lunar surface operations.',
      postedDate: now.toISOString(),
      responseDeadline: oneMonthLater.toISOString(),
      awardAmount: 950000,
      techFocus: ['Manufacturing', 'Robotics', '3D Printing', 'Lunar Operations'],
      eligibleStages: ['Early Stage', 'Growth Stage'],
      timeline: '24-36 months',
      setAside: 'None',
      placeOfPerformance: 'Multiple Locations'
    }
  ];
}

/**
 * Determine confidence level based on score
 * @param score Match score between 0 and 1
 * @returns Confidence level category
 */
function determineConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.75) {
    return 'high';
  } else if (score >= 0.5) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Get demo matching opportunities for development and fallback
 * @param formData Form data with company and project information
 * @returns Promise with match results
 */
const getDemoMatchingOpportunities = async (formData: FormData): Promise<MatchResponse> => {
  console.log("Using demo data for matching opportunities");
  
  // Get opportunities from our demo data
  const opportunities = createDemoOpportunities();
  console.log(`Processing ${opportunities.length} opportunities`);
  
  // Generate tailored matches based on the form data
  const matches = opportunities.map(opportunity => {
    // Calculate match scores based on form data and opportunity details
    let techFocusScore = 0.5;
    let stageScore = 0.5;
    let timelineScore = 0.5;
    let budgetScore = 0.5;
    let keywordScore = 0.5;
    
    // Simple keyword matching (this would be more sophisticated with real AI)
    const keywords = ["space", "satellite", "propulsion", "technology", "innovation"];
    if (formData.company.techCategory.some(cat => 
        opportunity.techFocus.includes(cat))) {
      techFocusScore = 0.8 + Math.random() * 0.2;
    }
    
    // Stage matching
    if (opportunity.eligibleStages.includes(formData.company.stage) || 
        opportunity.eligibleStages.includes("Any")) {
      stageScore = 0.7 + Math.random() * 0.3;
    }
    
    // Make the score with appropriate weights
    const totalScore = (
      techFocusScore * 0.35 + 
      stageScore * 0.25 + 
      timelineScore * 0.15 + 
      budgetScore * 0.15 + 
      keywordScore * 0.10
    );
    
    // Create a match result
    return {
      opportunity,
      score: Math.min(0.99, Math.max(0.4, totalScore)), // Ensure score is between 0.4 and 0.99
      confidenceLevel: determineConfidenceLevel(totalScore),
      matchDetails: {
        techFocusMatch: techFocusScore,
        stageMatch: stageScore,
        timelineMatch: timelineScore,
        budgetMatch: budgetScore,
        keywordMatch: keywordScore,
        matchedKeywords: keywords.slice(0, 2 + Math.floor(Math.random() * 3)), // 2-4 keywords
        aiRecommendation: `This opportunity from ${opportunity.agency} aligns with ${formData.company.name}'s focus areas${formData.company.techCategory.length ? ' in ' + formData.company.techCategory.slice(0, 2).join(', ') : ''}. The ${opportunity.title} project seeks innovations that could leverage your company's expertise${formData.company.stage ? ' at its current ' + formData.company.stage + ' stage' : ''}.`
      }
    };
  });
  
  // Sort matches by score (descending) and limit
  const sortedMatches = matches.sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS);
  
  // Add a small delay to simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return in expected format
  return {
    success: true,
    matchCount: sortedMatches.length,
    matches: sortedMatches
  };
};

/**
 * Get matching opportunities from MongoDB
 * @param formData Form data with company and project information
 * @returns Promise with match results
 */
export const getMatchingOpportunities = async (formData: FormData): Promise<MatchResponse> => {
  try {
    console.log("Starting MongoDB matching process with:", formData);
    
    // Prepare normalized form data
    const normalizedFormData = {
      ...formData,
      company: {
        ...formData.company,
        techCategory: Array.isArray(formData.company.techCategory) ? formData.company.techCategory : [],
      },
      project: {
        ...formData.project,
        interests: Array.isArray(formData.project.interests) ? formData.project.interests : [],
      }
    };
    
    // Get opportunities from MongoDB
    console.log("Fetching opportunities from MongoDB...");
    const opportunities = await getAllOpportunities();
    
    if (!opportunities || opportunities.length === 0) {
      console.warn("No opportunities found in MongoDB, falling back to demo data");
      return getDemoMatchingOpportunities(formData);
    }
    
    console.log(`Processing ${opportunities.length} opportunities from MongoDB`);
    
    // Generate matches based on the form data
    const matches = opportunities.map(opportunity => {
      // Calculate match scores based on form data and opportunity details
      let techFocusScore = 0.5;
      let stageScore = 0.5;
      let timelineScore = 0.5;
      let budgetScore = 0.5;
      let keywordScore = 0.5;
      
      // Tech focus matching
      if (normalizedFormData.company.techCategory.some(cat => 
          opportunity.techFocus?.includes(cat))) {
        techFocusScore = 0.8 + Math.random() * 0.2;
      }
      
      // Stage matching
      if (opportunity.eligibleStages?.includes(normalizedFormData.company.stage) || 
          opportunity.eligibleStages?.includes("Any")) {
        stageScore = 0.7 + Math.random() * 0.3;
      }
      
      // Timeline matching
      if (normalizedFormData.project.timeline && opportunity.timeline) {
        // Simple string match for now
        if (normalizedFormData.project.timeline.includes(opportunity.timeline) || 
            opportunity.timeline.includes(normalizedFormData.project.timeline)) {
          timelineScore = 0.6 + Math.random() * 0.4;
        }
      }
      
      // Budget matching
      if (normalizedFormData.project.budget && opportunity.awardAmount) {
        // Extract numbers from the budget string for comparison
        const budgetStr = normalizedFormData.project.budget;
        const budgetNumMatch = budgetStr.match(/\d+/g);
        if (budgetNumMatch) {
          const budgetNum = parseInt(budgetNumMatch.join(''));
          const awardAmount = opportunity.awardAmount;
          
          // If the budget is within 20% of the award amount, consider it a good match
          if (Math.abs(budgetNum - awardAmount) / awardAmount < 0.2) {
            budgetScore = 0.7 + Math.random() * 0.3;
          }
        }
      }
      
      // Keyword matching
      const keywordList = ["space", "satellite", "propulsion", "technology", "innovation"];
      const matchedKeywords: string[] = [];
      
      // Check project description for keywords
      const description = normalizedFormData.project.description?.toLowerCase() || '';
      keywordList.forEach(keyword => {
        if (description.includes(keyword.toLowerCase()) && 
            opportunity.description?.toLowerCase().includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword);
        }
      });
      
      // Calculate keyword match score based on number of matched keywords
      if (matchedKeywords.length > 0) {
        keywordScore = 0.5 + (matchedKeywords.length / keywordList.length) * 0.5;
      }
      
      // Make the score with appropriate weights
      const totalScore = (
        techFocusScore * 0.35 + 
        stageScore * 0.25 + 
        timelineScore * 0.15 + 
        budgetScore * 0.15 + 
        keywordScore * 0.10
      );
      
      // Create a match result
      return {
        opportunity,
        score: Math.min(0.99, Math.max(0.4, totalScore)), // Ensure score is between 0.4 and 0.99
        confidenceLevel: determineConfidenceLevel(totalScore),
        matchDetails: {
          techFocusMatch: techFocusScore,
          stageMatch: stageScore,
          timelineMatch: timelineScore,
          budgetMatch: budgetScore,
          keywordMatch: keywordScore,
          matchedKeywords,
          aiRecommendation: `This opportunity from ${opportunity.agency || 'the government'} aligns with ${normalizedFormData.company.name}'s focus areas${normalizedFormData.company.techCategory.length ? ' in ' + normalizedFormData.company.techCategory.slice(0, 2).join(', ') : ''}. The ${opportunity.title} project seeks innovations that could leverage your company's expertise${normalizedFormData.company.stage ? ' at its current ' + normalizedFormData.company.stage + ' stage' : ''}.`
        }
      };
    });
    
    // Sort matches by score (descending) and limit
    const sortedMatches = matches.sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS);
    
    // Return in expected format
    return {
      success: true,
      matchCount: sortedMatches.length,
      matches: sortedMatches
    };
  } catch (error: any) {
    console.error("Error in MongoDB matching:", error);
    
    // If MongoDB fails, fall back to demo data
    console.warn("MongoDB matching failed, falling back to demo data");
    return getDemoMatchingOpportunities(formData);
  }
};

/**
 * Construct the prompt for the OpenAI API
 * @param formData Form data with company and project information
 * @param opportunities List of opportunities to match against
 * @returns Prompt string for OpenAI API
 */
function constructMatchingPrompt(
  formData: FormData,
  opportunities: MatchOpportunity[]
): string {
  // Format company data
  const companyData = `
COMPANY INFORMATION:
Name: ${formData.company.name}
Description: ${formData.company.description}
Technology Categories: ${formData.company.techCategory.join(', ')}
Company Stage: ${formData.company.stage}
Team Size: ${formData.company.teamSize}
Founded Year: ${formData.company.foundedYear}
${formData.company.website ? `Website: ${formData.company.website}` : ''}
${formData.company.patents ? `Patents: ${formData.company.patents}` : ''}

PROJECT INFORMATION:
Title: ${formData.project.title}
Description: ${formData.project.description}
Technical Specifications: ${formData.project.techSpecs}
Budget: ${formData.project.budget}
Timeline: ${formData.project.timeline}
Areas of Interest: ${formData.project.interests.join(', ')}
  `;

  // Format opportunities data
  const opportunitiesData = opportunities.map((opp, index) => `
OPPORTUNITY ${index + 1}:
Notice ID: ${opp.noticeId}
Title: ${opp.title}
Agency: ${opp.agency}
Description: ${opp.description}
Posted Date: ${new Date(opp.postedDate).toISOString().split('T')[0]}
Response Deadline: ${new Date(opp.responseDeadline).toISOString().split('T')[0]}
${opp.awardAmount ? `Award Amount: $${opp.awardAmount}` : 'Award Amount: Not specified'}
${opp.setAside ? `Set Aside: ${opp.setAside}` : ''}
${opp.placeOfPerformance ? `Place of Performance: ${opp.placeOfPerformance}` : ''}
Technology Focus: ${opp.techFocus.join(', ')}
Eligible Stages: ${opp.eligibleStages.join(', ')}
Timeline: ${opp.timeline}
${opp.url ? `URL: ${opp.url}` : ''}
  `).join('\n');

  // Construct the complete prompt
  return `
You are a matching algorithm for a space tech RFP matchmaking service. Your task is to analyze the company information and project requirements below, and determine how well they match with each of the government contract opportunities provided.

${companyData}

Here are the government contract opportunities to evaluate:

${opportunitiesData}

For each opportunity, assess the following match criteria:
1. Tech Focus Match: How well the company's technology categories and project interests align with the opportunity's technology focus (0-1 score)
2. Stage Match: How suitable the opportunity is for the company's current stage (0-1 score)
3. Timeline Match: Compatibility between the project timeline and opportunity timeline (0-1 score)
4. Budget Match: Alignment between the project budget and opportunity award amount (0-1 score)
5. Keyword Match: Relevant keywords that appear in both the project description and opportunity description (0-1 score)

Calculate a total score (0-1) for each opportunity based on these criteria. Weight them as follows:
- Tech Focus: 35%
- Stage: 25%
- Timeline: 15%
- Budget: 15%
- Keywords: 10%

Provide an explanation for each match, highlighting why it's a good fit or what challenges might exist.

Return your analysis in the following JSON format:
{
  "matches": [
    {
      "noticeId": "string",
      "score": number,
      "matchDetails": {
        "techFocusMatch": number,
        "stageMatch": number,
        "timelineMatch": number,
        "budgetMatch": number,
        "keywordMatch": number,
        "matchedKeywords": ["string"]
      },
      "explanation": "string"
    }
  ]
}
`;
}

// Format date strings
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format currency amounts
export const formatCurrency = (amount?: number): string => {
  if (!amount) return "Not specified";
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Get confidence level color
export const getConfidenceLevelColor = (level: string): string => {
  switch (level) {
    case "high":
      return "text-green-500";
    case "medium":
      return "text-yellow-500";
    case "low":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};
