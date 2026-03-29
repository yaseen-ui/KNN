import express, { Router } from 'express';
import { Logger, loggingMiddleware, errorHandler } from './middleware/index.js';
import { asyncHandler } from './utils/helpers.js';
import { TokenController } from './controllers/tokenController.js';
import config from './config/config.js';

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(loggingMiddleware);

// Routes
const router = Router();

/**
 * Token endpoints
 */

// Add a new token
router.post('/tokens', asyncHandler(TokenController.addToken));

// Find similar tokens
router.post('/tokens/search', asyncHandler(TokenController.findSimilar));

// Get all tokens
router.get('/tokens', asyncHandler(TokenController.getAllTokens));

/**
 * System endpoints
 */

// Get system statistics
router.get('/stats', asyncHandler(TokenController.getStats));

// Health check
router.get('/health', asyncHandler(TokenController.health));

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Token Similarity Engine API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      stats: 'GET /stats',
      tokens: {
        add: 'POST /tokens',
        search: 'POST /tokens/search',
        list: 'GET /tokens',
      },
    },
  });
});

// Mount routes
app.use('/api', router);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

const server = app.listen(PORT, () => {
  Logger.info(`🚀 Server started`, {
    port: PORT,
    env: config.nodeEnv,
    defaultStrategy: config.defaultStrategy,
    cacheEnabled: config.cache.enabled,
    dataDir: config.dataDir,
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  Logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    Logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  Logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    Logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception', error);
  process.exit(1);
});

export default app;
