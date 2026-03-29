import { CacheEntry, SimilarityResult } from '../types/index.js';
import config from '../config/config.js';

/**
 * In-memory cache layer for similarity search results
 */
class CacheManager {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private enabled: boolean;

  constructor() {
    this.cache = new Map();
    this.maxSize = config.cache.maxSize;
    this.enabled = config.cache.enabled;
  }

  /**
   * Generate cache key from query parameters
   */
  private generateKey(query: string, strategy: string, k: number): string {
    return `${query}:${strategy}:${k}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry): boolean {
    const now = Date.now();
    return now - entry.timestamp < entry.ttl;
  }

  /**
   * Get cache entry
   */
  get(
    query: string,
    strategy: string,
    k: number
  ): SimilarityResult[] | null {
    if (!this.enabled) return null;

    const key = this.generateKey(query, strategy, k);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (!this.isValid(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.results;
  }

  /**
   * Set cache entry
   */
  set(
    query: string,
    strategy: string,
    k: number,
    results: SimilarityResult[]
  ): void {
    if (!this.enabled) return;

    const key = this.generateKey(query, strategy, k);

    // Implement simple LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const entry: CacheEntry = {
      query,
      strategy,
      k,
      results,
      timestamp: Date.now(),
      ttl: config.cache.ttl,
    };

    this.cache.set(key, entry);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; enabled: boolean } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      enabled: this.enabled,
    };
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
