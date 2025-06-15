/**
 * MongoDB Service for accessing opportunities data
 * This service uses environment variables to connect to MongoDB
 * via a data API instead of direct connection
 */

import { 
  getMongoDBConnectionString, 
  getMongoDBDatabase, 
  getMongoDBCollection 
} from '@/utils/envConfig';
import type { MatchOpportunity } from './matchingService';

// Cache the data to avoid unnecessary API calls
let cachedOpportunities: MatchOpportunity[] | null = null;

/**
 * Get all opportunities from MongoDB via Data API
 * @returns Promise that resolves to an array of opportunities
 */
export async function getAllOpportunities(): Promise<MatchOpportunity[]> {
  try {
    // If we have cached opportunities, return them
    if (cachedOpportunities) {
      console.log('Using cached opportunities data');
      return cachedOpportunities;
    }

    console.log('Fetching opportunities...');
    
    let rawOpportunities;
    
    // In development mode, use the test data
    if (import.meta.env.DEV) {
      console.log('Development mode detected, using test data');
      rawOpportunities = await simulateMongoDBAccess();
    } else {
      // In production, fetch from the API through a CORS proxy
      console.log('Production mode, fetching from API via CORS proxy');
      // Using corsproxy.io to bypass CORS restrictions
      const corsProxy = 'https://corsproxy.io/?';
      const targetUrl = 'https://aero-ai-match-portal.netlify.app/.netlify/functions/get-opportunities';
      const apiUrl = `${corsProxy}${encodeURIComponent(targetUrl)}`;
      
      console.log('Requesting from:', apiUrl);
      const response = await fetch(apiUrl);
      rawOpportunities = await response.json();
    }

    if (!Array.isArray(rawOpportunities)) {
      console.error('Invalid data received:', rawOpportunities);
      return [];
    }
    
    // Map API response to our MatchOpportunity format
    const opportunities = rawOpportunities.map(doc => {
      // Calculate award amount based on available data
      let awardAmount: number | undefined;
      if (doc.fundingAmount?.amount) {
        awardAmount = doc.fundingAmount.amount;
      } else if (doc.fundingAmount?.range?.max) {
        awardAmount = doc.fundingAmount.range.max;
      } else if (doc.awardCeiling && typeof doc.awardCeiling === 'string' && doc.awardCeiling.includes('$')) {
        // Try to extract amount from the string
        const match = doc.awardCeiling.match(/\$\s*([\d,]+)/);
        if (match && match[1]) {
          awardAmount = parseInt(match[1].replace(/,/g, ''));
        }
      }
      
      // Map data fields to our MatchOpportunity interface
      return {
        noticeId: doc.opportunityId || doc._id?.toString() || 'unknown-id',
        title: doc.title || 'Untitled Opportunity',
        agency: doc.agency || 'Unknown Agency',
        description: doc.additionalInformation || doc.description || '',
        postedDate: doc.datePosted ? 
          (typeof doc.datePosted === 'string' ? doc.datePosted : new Date(parseInt(doc.datePosted)).toISOString()) 
          : new Date().toISOString(),
        responseDeadline: doc.closeDate ? 
          (typeof doc.closeDate === 'string' ? doc.closeDate : new Date(parseInt(doc.closeDate)).toISOString())
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        awardAmount: awardAmount,
        naicsCode: doc.naicsCode,
        setAside: doc.setAside,
        placeOfPerformance: doc.placeOfPerformance,
        // Map technologies to techFocus, or use default
        techFocus: doc.technologies || doc.techFocus || ['Technology'],
        // Default eligibleStages since this info may not be in the DB
        eligibleStages: doc.eligibleStages || ['Any'],
        // Default timeline if not available
        timeline: doc.timeline || 'Varies',
        url: doc.url || '',
        // Map point of contact info if available
        pointOfContact: doc.pointOfContact || {
          name: doc.contactName,
          email: doc.contactEmail,
          phone: doc.contactPhone
        }
      };
    });
    
    // Cache the opportunities
    cachedOpportunities = opportunities;
    
    return opportunities;
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return [];
  }
}

/**
 * Clear the opportunities cache
 */
export function clearCache(): void {
  cachedOpportunities = null;
}

/**
 * Simulate direct access to MongoDB for development
 * This will be replaced by the serverless function in production
 */
export async function simulateMongoDBAccess(): Promise<any[]> {
  try {
    const connectionString = getMongoDBConnectionString();
    const dbName = getMongoDBDatabase();
    const collectionName = getMongoDBCollection();
    
    console.log('MongoDB Connection Info:', {
      connectionString: connectionString ? 'Set' : 'Not set',
      dbName,
      collectionName
    });

    // Instead of using require, we'll use fetch to load the JSON data
    // This works better in the browser environment
    const testData = [
      {
        "_id": "684e09e8ff2f6b44dd872d4d",
        "source": "grants.gov",
        "opportunityId": "PD-24-7789",
        "title": "Geospace Cluster",
        "agency": "NSF",
        "status": "posted",
        "datePosted": "1727323200000",
        "closeDate": null,
        "url": "https://www.grants.gov/search-results-detail/356536",
        "active": true,
        "fundingAmount": {
          "amount": null,
          "range": {
            "min": null,
            "max": null
          },
          "match_required": false,
          "raw": "Award Ceiling: $"
        },
        "awardCeiling": "$",
        "awardFloor": "$",
        "additionalInformation": "General Information about the Geospace Cluster program and funding opportunity",
        "technologies": ["geo"],
        "lastUpdated": "2025-06-14T23:46:48.595Z"
      },
      {
        "_id": "684e09e8ff2f6b44dd872d4e",
        "source": "grants.gov",
        "opportunityId": "PD-24-7790",
        "title": "Advanced Satellite Communications",
        "agency": "NASA",
        "status": "posted",
        "datePosted": "1727323200000",
        "closeDate": "1737323200000",
        "url": "https://www.grants.gov/search-results-detail/356537",
        "active": true,
        "fundingAmount": {
          "amount": 750000,
          "range": {
            "min": 500000,
            "max": 1000000
          },
          "match_required": false,
          "raw": "Award Ceiling: $1,000,000"
        },
        "awardCeiling": "$1,000,000",
        "awardFloor": "$500,000",
        "additionalInformation": "Development of advanced satellite communication systems for deep space missions.",
        "technologies": ["Communications", "Satellites", "Signal Processing"],
        "lastUpdated": "2025-06-14T23:46:48.595Z"
      },
      {
        "_id": "684e09e8ff2f6b44dd872d4f",
        "source": "grants.gov",
        "opportunityId": "PD-24-7791",
        "title": "Next-Generation Propulsion Technology",
        "agency": "Space Force",
        "status": "posted",
        "datePosted": "1727323200000",
        "closeDate": "1737323200000",
        "url": "https://www.grants.gov/search-results-detail/356538",
        "active": true,
        "fundingAmount": {
          "amount": 500000,
          "range": {
            "min": 300000,
            "max": 700000
          },
          "match_required": false,
          "raw": "Award Ceiling: $700,000"
        },
        "awardCeiling": "$700,000",
        "awardFloor": "$300,000",
        "additionalInformation": "Research and development of efficient propulsion systems for small satellites and CubeSats.",
        "technologies": ["Propulsion", "CubeSats", "Green Technology"],
        "lastUpdated": "2025-06-14T23:46:48.595Z"
      }
    ];
    
    return testData;
  } catch (error) {
    console.error('Failed to simulate MongoDB access:', error);
    return [];
  }
}
