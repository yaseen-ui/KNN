import { Request, Response } from 'express';
import { tokenService } from '../services/tokenService.js';
import {
  sendSuccess,
  sendError,
  validateRequired,
  isValidTokenValue,
  isValidK,
  isValidThreshold,
} from '../utils/helpers.js';
import { Logger } from '../middleware/index.js';
import config from '../config/config.js';

/**
 * Controller layer for token endpoints
 */
export class TokenController {
  /**
   * POST /api/tokens - Add a new token
   */
  static async addToken(req: Request, res: Response): Promise<void> {
    try {
      const { value, metadata } = req.body;

      // Validate required fields
      const validation = validateRequired(req.body, ['value']);
      if (!validation.valid) {
        sendError(res, validation.errors[0], 400);
        return;
      }

      // Validate token value
      if (!isValidTokenValue(value)) {
        sendError(res, 'Token value must be a non-empty string', 400);
        return;
      }

      // Add token via service
      const token = await tokenService.addToken(value, metadata);

      sendSuccess(res, token, 201);
    } catch (error: any) {
      Logger.error('Error in addToken', error);
      sendError(res, error.message || 'Failed to add token', 500);
    }
  }

  /**
   * POST /api/tokens/search - Find top K similar tokens
   */
  static async findSimilar(req: Request, res: Response): Promise<void> {
    try {
      const { query, k, threshold, strategy } = req.body;

      // Validate required fields
      const validation = validateRequired(req.body, ['query', 'k']);
      if (!validation.valid) {
        sendError(res, validation.errors[0], 400);
        return;
      }

      // Validate inputs
      if (!isValidTokenValue(query)) {
        sendError(res, 'Query must be a non-empty string', 400);
        return;
      }

      if (!isValidK(k)) {
        sendError(res, 'k must be a positive integer between 1 and 1000', 400);
        return;
      }

      if (threshold !== undefined && !isValidThreshold(threshold)) {
        sendError(
          res,
          'Threshold must be a number between 0 and 1',
          400
        );
        return;
      }

      // Use default strategy if not provided
      const selectedStrategy = strategy || config.defaultStrategy;

      // Check if strategy exists
      const availableStrategies = tokenService.getAvailableStrategies();
      if (!availableStrategies.includes(selectedStrategy)) {
        sendError(
          res,
          `Strategy '${selectedStrategy}' not found. Available: ${availableStrategies.join(
            ', '
          )}`,
          400
        );
        return;
      }

      // Find similar tokens
      const results = await tokenService.findTopKSimilar(query, {
        k,
        threshold,
        strategy: selectedStrategy,
      });

      sendSuccess(res, {
        query,
        strategy: selectedStrategy,
        k,
        threshold: threshold || null,
        results,
        count: results.length,
      });
    } catch (error: any) {
      Logger.error('Error in findSimilar', error);
      sendError(res, error.message || 'Failed to find similar tokens', 500);
    }
  }

  /**
   * GET /api/tokens - Get all tokens
   */
  static async getAllTokens(req: Request, res: Response): Promise<void> {
    try {
      const tokens = await tokenService.getAllTokens();
      sendSuccess(res, {
        tokens,
        count: tokens.length,
      });
    } catch (error: any) {
      Logger.error('Error in getAllTokens', error);
      sendError(res, 'Failed to retrieve tokens', 500);
    }
  }

  /**
   * GET /api/stats - Get system statistics
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const tokenCount = await tokenService.getTokenCount();
      const cacheStats = tokenService.getCacheStats();
      const availableStrategies = tokenService.getAvailableStrategies();

      sendSuccess(res, {
        tokens: {
          count: tokenCount,
        },
        cache: cacheStats,
        strategies: availableStrategies,
        config: {
          defaultStrategy: config.defaultStrategy,
          nodeEnv: config.nodeEnv,
        },
      });
    } catch (error: any) {
      Logger.error('Error in getStats', error);
      sendError(res, 'Failed to retrieve statistics', 500);
    }
  }

  /**
   * GET /api/health - Health check endpoint
   */
  static async health(req: Request, res: Response): Promise<void> {
    sendSuccess(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }
}
