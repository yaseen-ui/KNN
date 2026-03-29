/**
 * Application configuration
 */

interface Config {
  // Server config
  port: number;
  nodeEnv: string;

  // Default similarity strategy
  defaultStrategy: string;

  // Cache settings
  cache: {
    enabled: boolean;
    ttl: number; // time to live in milliseconds
    maxSize: number; // maximum number of cache entries
  };

  // Data storage
  dataDir: string;
  tokensFile: string;

  // Logging
  logging: {
    level: string;
    format: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  defaultStrategy: process.env.DEFAULT_STRATEGY || 'levenshtein',

  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    ttl: parseInt(process.env.CACHE_TTL || '300000', 10), // 5 minutes default
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
  },

  dataDir: process.env.DATA_DIR || './data',
  tokensFile: process.env.TOKENS_FILE || 'tokens.json',

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'simple',
  },
};

export default config;
