import { ISimilarityStrategy } from '../types/index.js';

/**
 * Levenshtein distance strategy
 * Calculates minimum edits (insert, delete, replace) needed to transform one string to another
 * Normalized to 0-1 range where 1 is identical
 */
export class LevenshteinSimilarityStrategy implements ISimilarityStrategy {
  name = 'levenshtein';

  calculate(source: string, target: string): number {
    const sourceLen = source.length;
    const targetLen = target.length;

    // Create a 2D array for dynamic programming
    const dp: number[][] = Array(sourceLen + 1)
      .fill(null)
      .map(() => Array(targetLen + 1).fill(0));

    // Initialize first column and row
    for (let i = 0; i <= sourceLen; i++) {
      dp[i][0] = i;
    }
    for (let j = 0; j <= targetLen; j++) {
      dp[0][j] = j;
    }

    // Fill the dp table
    for (let i = 1; i <= sourceLen; i++) {
      for (let j = 1; j <= targetLen; j++) {
        const cost = source[i - 1] === target[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return dp[sourceLen][targetLen];
  }

  normalize(score: number): number {
    // score is the distance, so invert it
    // This will be called with max possible distance
    // We normalize in the service layer based on string lengths
    return score;
  }
}
