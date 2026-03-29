import { ISimilarityStrategy } from '../types/index.js';
import { PrefixSimilarityStrategy } from './prefixSimilarity.js';
import { LevenshteinSimilarityStrategy } from './levenshteinSimilarity.js';
import { JaccardSimilarityStrategy } from './jaccardSimilarity.js';

/**
 * Strategy factory for managing and retrieving similarity algorithms
 */
class StrategyFactory {
  private strategies: Map<string, ISimilarityStrategy>;

  constructor() {
    this.strategies = new Map();
    this.registerDefaultStrategies();
  }

  /**
   * Register default strategies
   */
  private registerDefaultStrategies(): void {
    this.register(new PrefixSimilarityStrategy());
    this.register(new LevenshteinSimilarityStrategy());
    this.register(new JaccardSimilarityStrategy());
  }

  /**
   * Register a new strategy
   */
  register(strategy: ISimilarityStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  /**
   * Get a strategy by name
   */
  get(name: string): ISimilarityStrategy {
    const strategy = this.strategies.get(name);
    if (!strategy) {
      throw new Error(
        `Strategy '${name}' not found. Available strategies: ${Array.from(
          this.strategies.keys()
        ).join(', ')}`
      );
    }
    return strategy;
  }

  /**
   * Get all available strategy names
   */
  getAvailable(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Check if strategy exists
   */
  exists(name: string): boolean {
    return this.strategies.has(name);
  }
}

// Export singleton instance
export const strategyFactory = new StrategyFactory();
