import { Token, SimilarityResult, SimilaritySearchConfig } from '../types/index.js';
import { tokenRepository } from '../repositories/tokenRepository.js';
import { strategyFactory } from '../strategies/index.js';
import { cacheManager } from '../cache/cacheManager.js';
import { Logger } from '../middleware/index.js';
import config from '../config/config.js';

/**
 * Service layer for token similarity operations
 * Handles business logic, caching, and strategy coordination
 */
class TokenService {
  /**
   * Add a new token to the system
   */
  async addToken(
    value: string,
    metadata?: Record<string, unknown>
  ): Promise<Token> {
    Logger.info('Adding token', { value });

    try {
      // Validate input
      if (!value || value.trim().length === 0) {
        throw new Error('Token value cannot be empty');
      }

      // Save to repository
      const token = await tokenRepository.save(value, metadata);

      // Clear cache since we added new token
      cacheManager.clear();

      Logger.info('Token added successfully', { tokenId: token.id });
      return token;
    } catch (error) {
      Logger.error('Failed to add token', error);
      throw error;
    }
  }

  /**
   * Find top-K similar tokens using specified strategy
   */
  async findTopKSimilar(
    query: string,
    config: SimilaritySearchConfig
  ): Promise<SimilarityResult[]> {
    Logger.info('Finding top K similar tokens', {
      query,
      k: config.k,
      strategy: config.strategy,
    });

    try {
      // Validate inputs
      if (!query || query.trim().length === 0) {
        throw new Error('Query cannot be empty');
      }

      if (config.k < 1 || config.k > 1000) {
        throw new Error('k must be between 1 and 1000');
      }

      // Check cache first
      const cached = cacheManager.get(query, config.strategy, config.k);
      if (cached) {
        Logger.info('Cache hit', { query, strategy: config.strategy });
        return cached;
      }

      // Get strategy
      if (!strategyFactory.exists(config.strategy)) {
        throw new Error(
          `Strategy '${config.strategy}' not found. Available: ${strategyFactory
            .getAvailable()
            .join(', ')}`
        );
      }

      const strategy = strategyFactory.get(config.strategy);

      // Load all tokens
      const allTokens = await tokenRepository.getAll();

      if (allTokens.length === 0) {
        Logger.warn('No tokens found in storage');
        return [];
      }

      // Calculate similarity scores
      const scores = this.calculateSimilarityScores(
        query,
        allTokens,
        strategy
      );

      // Sort by score descending
      scores.sort((a, b) => b.score - a.score);

      // Apply threshold if provided
      let results = scores;
      if (
        config.threshold !== undefined &&
        config.threshold > 0
      ) {
        results = scores.filter((r) => r.score >= config.threshold!);
      }

      // Return top K
      results = results.slice(0, config.k);

      // Cache results
      cacheManager.set(query, config.strategy, config.k, results);

      Logger.info('Found similar tokens', {
        query,
        count: results.length,
        strategy: config.strategy,
      });

      return results;
    } catch (error) {
      Logger.error('Failed to find similar tokens', error);
      throw error;
    }
  }

  /**
   * Calculate similarity scores for all tokens against a query
   */
  private calculateSimilarityScores(
    query: string,
    tokens: Token[],
    strategy: any
  ): SimilarityResult[] {
    return tokens
      .map((token) => {
        let score: number;

        try {
          if (strategy.name === 'levenshtein') {
            // For Levenshtein, invert the distance
            const distance = strategy.calculate(
              query.toLowerCase(),
              token.value.toLowerCase()
            );
            // Normalize based on max possible distance
            const maxDistance = Math.max(query.length, token.value.length);
            score = 1 - distance / (maxDistance || 1);
          } else if (strategy.name === 'prefix') {
            // For prefix, normalize by query length
            const prefixMatch = strategy.calculate(
              query.toLowerCase(),
              token.value.toLowerCase()
            );
            score = prefixMatch / query.length;
          } else {
            // For others like Jaccard (already normalized)
            score = strategy.calculate(
              query.toLowerCase(),
              token.value.toLowerCase()
            );
          }

          // Ensure score is between 0 and 1
          score = Math.max(0, Math.min(1, score));
        } catch (error) {
          Logger.warn('Error calculating similarity', { error, tokenId: token.id });
          score = 0;
        }

        return {
          tokenId: token.id,
          tokenValue: token.value,
          score: parseFloat(score.toFixed(4)), // Round to 4 decimals
          metadata: token.metadata,
        };
      })
      .filter((result) => result.score > 0); // Filter out zero scores
  }

  /**
   * Get all tokens (for admin/debug purposes)
   */
  async getAllTokens(): Promise<Token[]> {
    try {
      return await tokenRepository.getAll();
    } catch (error) {
      Logger.error('Failed to get all tokens', error);
      throw error;
    }
  }

  /**
   * Get token count
   */
  async getTokenCount(): Promise<number> {
    try {
      return await tokenRepository.count();
    } catch (error) {
      Logger.error('Failed to get token count', error);
      throw error;
    }
  }

  /**
   * Get available strategies
   */
  getAvailableStrategies(): string[] {
    return strategyFactory.getAvailable();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cacheManager.getStats();
  }
}

// Export singleton instance
export const tokenService = new TokenService();
