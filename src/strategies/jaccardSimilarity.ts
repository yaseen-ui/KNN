import { ISimilarityStrategy } from '../types/index.js';

/**
 * Jaccard similarity strategy
 * Measures similarity between sets based on intersection over union
 * Uses character bigrams as sets
 */
export class JaccardSimilarityStrategy implements ISimilarityStrategy {
  name = 'jaccard';

  private getBigrams(text: string): Set<string> {
    const bigrams = new Set<string>();
    for (let i = 0; i < text.length - 1; i++) {
      bigrams.add(text.substring(i, i + 2));
    }
    return bigrams;
  }

  calculate(source: string, target: string): number {
    const sourceBigrams = this.getBigrams(source);
    const targetBigrams = this.getBigrams(target);

    // Calculate intersection
    let intersection = 0;
    sourceBigrams.forEach((bigram) => {
      if (targetBigrams.has(bigram)) {
        intersection++;
      }
    });

    // Calculate union
    const union = sourceBigrams.size + targetBigrams.size - intersection;

    // Avoid division by zero
    if (union === 0) {
      return source === target ? 1 : 0;
    }

    return intersection / union;
  }

  normalize(score: number): number {
    // Already normalized between 0-1
    return score;
  }
}
