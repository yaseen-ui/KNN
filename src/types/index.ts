/**
 * Token interface representing a single token in the system
 */
export interface Token {
  id: string;
  value: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Result of similarity comparison between two tokens
 */
export interface SimilarityResult {
  tokenId: string;
  tokenValue: string;
  score: number;
  metadata?: Record<string, unknown>;
}

/**
 * Configuration for similarity search
 */
export interface SimilaritySearchConfig {
  k: number; // top k results
  threshold?: number; // minimum similarity score
  strategy: string; // which strategy to use
}

/**
 * Response structure for API endpoints
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Similarity strategy interface
 */
export interface ISimilarityStrategy {
  name: string;
  calculate(source: string, target: string): number;
  normalize(score: number): number;
}

/**
 * Cache entry structure
 */
export interface CacheEntry {
  query: string;
  strategy: string;
  k: number;
  results: SimilarityResult[];
  timestamp: number;
  ttl: number; // time to live in milliseconds
}
