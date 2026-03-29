import { ISimilarityStrategy } from '../types/index.js';

/**
 * Prefix similarity strategy
 * Measures similarity based on common prefix length
 */
export class PrefixSimilarityStrategy implements ISimilarityStrategy {
  name = 'prefix';

  calculate(source: string, target: string): number {
    const minLength = Math.min(source.length, target.length);
    let commonLength = 0;

    for (let i = 0; i < minLength; i++) {
      if (source[i] === target[i]) {
        commonLength++;
      } else {
        break;
      }
    }

    return commonLength;
  }

  normalize(score: number): number {
    // Return as is, will be normalized in service based on max
    return score;
  }
}
