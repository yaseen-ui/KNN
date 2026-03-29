/**
 * API Test Examples
 * Save this as src/examples/apiExamples.ts for reference
 * 
 * Run examples:
 * 1. Start the server: npm run dev
 * 2. In another terminal, run these curl commands
 */

export const API_EXAMPLES = {
  // ============ HEALTH CHECK ============
  healthCheck: {
    method: 'GET',
    endpoint: '/api/health',
    curl: 'curl http://localhost:3000/api/health',
    response: {
      success: true,
      data: {
        status: 'healthy',
        timestamp: '2026-03-29T10:00:00.000Z',
      },
      timestamp: '2026-03-29T10:00:00.000Z',
    },
  },

  // ============ SYSTEM STATISTICS ============
  getStats: {
    method: 'GET',
    endpoint: '/api/stats',
    curl: 'curl http://localhost:3000/api/stats',
    response: {
      success: true,
      data: {
        tokens: { count: 5 },
        cache: { size: 2, maxSize: 1000, enabled: true },
        strategies: ['levenshtein', 'prefix', 'jaccard'],
        config: { defaultStrategy: 'levenshtein', nodeEnv: 'development' },
      },
      timestamp: '2026-03-29T10:00:00.000Z',
    },
  },

  // ============ ADD TOKEN ============
  addTokenSimple: {
    method: 'POST',
    endpoint: '/api/tokens',
    body: {
      value: 'apple',
    },
    curl: `curl -X POST http://localhost:3000/api/tokens \\
  -H "Content-Type: application/json" \\
  -d '{"value": "apple"}'`,
    response: {
      success: true,
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        value: 'apple',
        metadata: null,
        createdAt: '2026-03-29T10:00:00.000Z',
      },
      timestamp: '2026-03-29T10:00:00.000Z',
    },
  },

  addTokenWithMetadata: {
    method: 'POST',
    endpoint: '/api/tokens',
    body: {
      value: 'javascript',
      metadata: {
        category: 'programming language',
        ecosystem: 'web',
        yearCreated: 1995,
      },
    },
    curl: `curl -X POST http://localhost:3000/api/tokens \\
  -H "Content-Type: application/json" \\
  -d '{
    "value": "javascript",
    "metadata": {
      "category": "programming language",
      "ecosystem": "web"
    }
  }'`,
    response: {
      success: true,
      data: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        value: 'javascript',
        metadata: {
          category: 'programming language',
          ecosystem: 'web',
        },
        createdAt: '2026-03-29T10:00:01.000Z',
      },
      timestamp: '2026-03-29T10:00:01.000Z',
    },
  },

  // ============ LIST ALL TOKENS ============
  getAllTokens: {
    method: 'GET',
    endpoint: '/api/tokens',
    curl: 'curl http://localhost:3000/api/tokens',
    response: {
      success: true,
      data: {
        tokens: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            value: 'apple',
            metadata: null,
            createdAt: '2026-03-29T10:00:00.000Z',
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            value: 'javascript',
            metadata: { category: 'programming language' },
            createdAt: '2026-03-29T10:00:01.000Z',
          },
        ],
        count: 2,
      },
      timestamp: '2026-03-29T10:00:02.000Z',
    },
  },

  // ============ SEARCH - LEVENSHTEIN ============
  searchLevenshteinBasic: {
    description: 'Find similar tokens using Levenshtein distance (typo detection)',
    method: 'POST',
    endpoint: '/api/tokens/search',
    body: {
      query: 'aple',
      k: 3,
      strategy: 'levenshtein',
    },
    curl: `curl -X POST http://localhost:3000/api/tokens/search \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "aple",
    "k": 3,
    "strategy": "levenshtein"
  }'`,
    response: {
      success: true,
      data: {
        query: 'aple',
        strategy: 'levenshtein',
        k: 3,
        threshold: null,
        count: 1,
        results: [
          {
            tokenId: '550e8400-e29b-41d4-a716-446655440000',
            tokenValue: 'apple',
            score: 0.8,
            metadata: null,
          },
        ],
      },
      timestamp: '2026-03-29T10:00:03.000Z',
    },
  },

  searchLevenshteinWithThreshold: {
    description: 'Search with minimum similarity threshold',
    method: 'POST',
    endpoint: '/api/tokens/search',
    body: {
      query: 'java',
      k: 5,
      threshold: 0.4,
      strategy: 'levenshtein',
    },
    curl: `curl -X POST http://localhost:3000/api/tokens/search \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "java",
    "k": 5,
    "threshold": 0.4,
    "strategy": "levenshtein"
  }'`,
    response: {
      success: true,
      data: {
        query: 'java',
        strategy: 'levenshtein',
        k: 5,
        threshold: 0.4,
        count: 2,
        results: [
          {
            tokenId: '550e8400-e29b-41d4-a716-446655440002',
            tokenValue: 'javascript',
            score: 0.5625,
            metadata: { category: 'programming language' },
          },
          {
            tokenId: '550e8400-e29b-41d4-a716-446655440003',
            tokenValue: 'java',
            score: 1.0,
            metadata: { category: 'programming language' },
          },
        ],
      },
      timestamp: '2026-03-29T10:00:04.000Z',
    },
  },

  // ============ SEARCH - PREFIX ============
  searchPrefixAutocomplete: {
    description: 'Find tokens starting with a prefix (autocomplete use case)',
    method: 'POST',
    endpoint: '/api/tokens/search',
    body: {
      query: 'java',
      k: 5,
      strategy: 'prefix',
    },
    curl: `curl -X POST http://localhost:3000/api/tokens/search \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "java",
    "k": 5,
    "strategy": "prefix"
  }'`,
    response: {
      success: true,
      data: {
        query: 'java',
        strategy: 'prefix',
        k: 5,
        threshold: null,
        count: 1,
        results: [
          {
            tokenId: '550e8400-e29b-41d4-a716-446655440002',
            tokenValue: 'javascript',
            score: 1.0,
            metadata: { category: 'programming language' },
          },
        ],
      },
      timestamp: '2026-03-29T10:00:05.000Z',
    },
  },

  // ============ SEARCH - JACCARD ============
  searchJaccardBigram: {
    description: 'Find similar tokens using Jaccard similarity (bigram-based)',
    method: 'POST',
    endpoint: '/api/tokens/search',
    body: {
      query: 'script',
      k: 5,
      strategy: 'jaccard',
    },
    curl: `curl -X POST http://localhost:3000/api/tokens/search \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "script",
    "k": 5,
    "strategy": "jaccard"
  }'`,
    response: {
      success: true,
      data: {
        query: 'script',
        strategy: 'jaccard',
        k: 5,
        threshold: null,
        count: 2,
        results: [
          {
            tokenId: '550e8400-e29b-41d4-a716-446655440002',
            tokenValue: 'javascript',
            score: 0.4286,
            metadata: { category: 'programming language' },
          },
          {
            tokenId: '550e8400-e29b-41d4-a716-446655440004',
            tokenValue: 'typescript',
            score: 0.3333,
            metadata: { category: 'programming language' },
          },
        ],
      },
      timestamp: '2026-03-29T10:00:06.000Z',
    },
  },

  // ============ ERROR CASES ============
  errorMissingQuery: {
    description: 'Missing required query parameter',
    method: 'POST',
    endpoint: '/api/tokens/search',
    body: {
      k: 5,
      strategy: 'levenshtein',
    },
    response: {
      success: false,
      error: "Field 'query' is required",
      timestamp: '2026-03-29T10:00:07.000Z',
    },
  },

  errorInvalidK: {
    description: 'Invalid k parameter (must be 1-1000)',
    method: 'POST',
    endpoint: '/api/tokens/search',
    body: {
      query: 'test',
      k: -1,
      strategy: 'levenshtein',
    },
    response: {
      success: false,
      error: 'k must be a positive integer between 1 and 1000',
      timestamp: '2026-03-29T10:00:08.000Z',
    },
  },

  errorInvalidStrategy: {
    description: 'Strategy does not exist',
    method: 'POST',
    endpoint: '/api/tokens/search',
    body: {
      query: 'test',
      k: 5,
      strategy: 'invalid_strategy',
    },
    response: {
      success: false,
      error:
        "Strategy 'invalid_strategy' not found. Available: levenshtein, prefix, jaccard",
      timestamp: '2026-03-29T10:00:09.000Z',
    },
  },

  errorEmptyToken: {
    description: 'Empty token value',
    method: 'POST',
    endpoint: '/api/tokens',
    body: {
      value: '',
    },
    response: {
      success: false,
      error: 'Token value must be a non-empty string',
      timestamp: '2026-03-29T10:00:10.000Z',
    },
  },
};

/**
 * Quick Test Sequence
 * Run these commands in order to test the complete API
 */
export const QUICK_TEST_SEQUENCE = `
# 1. Health check
curl http://localhost:3000/api/health

# 2. Get initial stats
curl http://localhost:3000/api/stats

# 3. Add some tokens
curl -X POST http://localhost:3000/api/tokens \\
  -H "Content-Type: application/json" \\
  -d '{"value": "apple", "metadata": {"type": "fruit"}}'

curl -X POST http://localhost:3000/api/tokens \\
  -H "Content-Type: application/json" \\
  -d '{"value": "application", "metadata": {"type": "software"}}'

curl -X POST http://localhost:3000/api/tokens \\
  -H "Content-Type: application/json" \\
  -d '{"value": "apply", "metadata": {"type": "verb"}}'

curl -X POST http://localhost:3000/api/tokens \\
  -H "Content-Type: application/json" \\
  -d '{"value": "JavaScript", "metadata": {"type": "language"}}'

curl -X POST http://localhost:3000/api/tokens \\
  -H "Content-Type: application/json" \\
  -d '{"value": "TypeScript", "metadata": {"type": "language"}}'

# 4. List all tokens
curl http://localhost:3000/api/tokens

# 5. Search with different strategies
curl -X POST http://localhost:3000/api/tokens/search \\
  -H "Content-Type: application/json" \\
  -d '{"query": "aple", "k": 3, "strategy": "levenshtein"}'

curl -X POST http://localhost:3000/api/tokens/search \\
  -H "Content-Type: application/json" \\
  -d '{"query": "app", "k": 3, "strategy": "prefix"}'

curl -X POST http://localhost:3000/api/tokens/search \\
  -H "Content-Type: application/json" \\
  -d '{"query": "script", "k": 3, "strategy": "jaccard"}'

# 6. Get stats to see cache usage
curl http://localhost:3000/api/stats
`;
