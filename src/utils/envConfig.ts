// Configuration for frontend environment
// Using API endpoints instead of direct API keys

/**
 * Get the base API URL for backend services
 * In production, this would be configured properly with environment variables
 * For development, we default to localhost
 */
export function getApiBaseUrl(): string {
  // Try getting from Vite environment variables first (for development)
  // @ts-ignore - import.meta.env is a Vite feature
  if (import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    // @ts-ignore
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // For development without env var, rely on the backend service running
  // on the default port when doing local development
  return '';
}

/**
 * Get the default AI model name for UI display
 */
export function getAIModel(): string {
  // @ts-ignore - import.meta.env is a Vite feature
  if (import.meta.env && import.meta.env.VITE_AI_MODEL) {
    // @ts-ignore
    return import.meta.env.VITE_AI_MODEL;
  }
  
  // Default model name for display purposes only
  return 'gpt-4.1-nano';
}

/**
 * Get the MongoDB connection string (for reference only)
 */
export function getMongoDBConnectionString(): string {
  // @ts-ignore - import.meta.env is a Vite feature
  if (import.meta.env && import.meta.env.VITE_MONGODB_CONNECTION_STRING) {
    // @ts-ignore
    return import.meta.env.VITE_MONGODB_CONNECTION_STRING;
  }
  return '';
}

/**
 * Get the MongoDB database name
 */
export function getMongoDBDatabase(): string {
  // @ts-ignore - import.meta.env is a Vite feature
  if (import.meta.env && import.meta.env.VITE_MONGODB_DATABASE) {
    // @ts-ignore
    return import.meta.env.VITE_MONGODB_DATABASE;
  }
  return 'aero_match_db';
}

/**
 * Get the MongoDB collection name
 */
export function getMongoDBCollection(): string {
  // @ts-ignore - import.meta.env is a Vite feature
  if (import.meta.env && import.meta.env.VITE_MONGODB_COLLECTION) {
    // @ts-ignore
    return import.meta.env.VITE_MONGODB_COLLECTION;
  }
  return 'opportunities';
}

/**
 * Get the MongoDB Data API URL
 */
export function getMongoDBDataApiUrl(): string {
  // @ts-ignore - import.meta.env is a Vite feature
  if (import.meta.env && import.meta.env.VITE_MONGODB_DATA_API_URL) {
    // @ts-ignore
    return import.meta.env.VITE_MONGODB_DATA_API_URL;
  }
  return '';
}

/**
 * Get the MongoDB Data API Key
 */
export function getMongoDBDataApiKey(): string {
  // @ts-ignore - import.meta.env is a Vite feature
  if (import.meta.env && import.meta.env.VITE_MONGODB_DATA_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_MONGODB_DATA_API_KEY;
  }
  return '';
}

/**
 * Get the MongoDB Data Source (cluster name)
 */
export function getMongoDBDataSource(): string {
  // @ts-ignore - import.meta.env is a Vite feature
  if (import.meta.env && import.meta.env.VITE_MONGODB_DATA_SOURCE) {
    // @ts-ignore
    return import.meta.env.VITE_MONGODB_DATA_SOURCE;
  }
  return 'Cluster0';
}
