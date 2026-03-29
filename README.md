# Token Similarity Engine

A scalable token similarity engine built with proper layered architecture, even though the initial data is small. Designed to be extensible and production-ready with caching, multiple similarity algorithms, and comprehensive logging.

## Architecture

```
src/
├── controllers/        # HTTP request handlers
├── services/          # Business logic
├── repositories/      # Data persistence layer
├── strategies/        # Similarity algorithm implementations
├── cache/            # Caching layer
├── middleware/       # Express middleware (logging, error handling)
├── config/           # Configuration management
├── utils/            # Helper functions and validators
├── types/            # TypeScript interfaces
└── app.ts            # Express application setup

data/
└── tokens.json       # JSON file storage for tokens
```

## Features

- **Multiple Similarity Strategies**:
  - Levenshtein Distance (edit distance)
  - Prefix Matching
  - Jaccard Similarity (bigram-based)
  - Extensible strategy pattern for adding custom algorithms

- **Configuration-Driven Approach**:
  - Environment variables for strategy selection, cache settings, and storage location
  - Pluggable configuration system

- **Caching Layer**:
  - In-memory LRU cache for search results
  - Configurable TTL and max cache size
  - Cache hit/miss logging

- **Comprehensive Logging**:
  - Structured JSON logging
  - Request/response logging
  - Error tracking

- **Modular Architecture**:
  - Clear separation of concerns
  - Easy to test individual layers
  - Extensible for future enhancements

## Installation

```bash
npm install
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production Mode
```bash
npm start
```

The server will start on port 3000 by default.

## Configuration

Configure via environment variables:

```bash
# Server
PORT=3000
NODE_ENV=development

# Similarity Strategy
DEFAULT_STRATEGY=levenshtein  # options: levenshtein, prefix, jaccard

# Cache Settings
CACHE_ENABLED=true
CACHE_TTL=300000              # 5 minutes in milliseconds
CACHE_MAX_SIZE=1000

# Data Storage
DATA_DIR=./data
TOKENS_FILE=tokens.json

# Logging
LOG_LEVEL=info                # debug, info, warn, error
LOG_FORMAT=simple
```

## API Endpoints

### Health Check
```bash
GET /api/health
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-03-29T10:00:00.000Z"
  },
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

### Get System Statistics
```bash
GET /api/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "tokens": {
      "count": 42
    },
    "cache": {
      "size": 5,
      "maxSize": 1000,
      "enabled": true
    },
    "strategies": ["levenshtein", "prefix", "jaccard"],
    "config": {
      "defaultStrategy": "levenshtein",
      "nodeEnv": "development"
    }
  },
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

### Add a Token
```bash
POST /api/tokens
Content-Type: application/json

{
  "value": "apple",
  "metadata": {
    "category": "fruit",
    "color": "red"
  }
}
```

Response (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "value": "apple",
    "metadata": {
      "category": "fruit",
      "color": "red"
    },
    "createdAt": "2026-03-29T10:00:00.000Z"
  },
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

### Find Similar Tokens
```bash
POST /api/tokens/search
Content-Type: application/json

{
  "query": "aple",
  "k": 5,
  "strategy": "levenshtein",
  "threshold": 0.6
}
```

Response:
```json
{
  "success": true,
  "data": {
    "query": "aple",
    "strategy": "levenshtein",
    "k": 5,
    "threshold": 0.6,
    "count": 2,
    "results": [
      {
        "tokenId": "550e8400-e29b-41d4-a716-446655440000",
        "tokenValue": "apple",
        "score": 0.8,
        "metadata": {
          "category": "fruit"
        }
      },
      {
        "tokenId": "550e8400-e29b-41d4-a716-446655440001",
        "tokenValue": "ample",
        "score": 0.7,
        "metadata": null
      }
    ]
  },
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

### Get All Tokens
```bash
GET /api/tokens
```

Response:
```json
{
  "success": true,
  "data": {
    "tokens": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "value": "apple",
        "metadata": { "category": "fruit" },
        "createdAt": "2026-03-29T10:00:00.000Z"
      }
    ],
    "count": 1
  },
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

## Usage Examples

### Using cURL

Add multiple tokens:
```bash
curl -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{"value": "apple"}'

curl -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{"value": "application"}'

curl -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{"value": "banana"}'
```

Search for similar tokens using Levenshtein:
```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "aple",
    "k": 3,
    "strategy": "levenshtein"
  }'
```

Search using Jaccard similarity:
```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "test",
    "k": 5,
    "strategy": "jaccard",
    "threshold": 0.1
  }'
```

## Similarity Strategies

### Levenshtein Distance
- **Best for**: General typo detection and approximate string matching
- **Score**: 0-1 (1 = identical, 0 = completely different)
- **Cost**: O(n*m) where n and m are string lengths

### Prefix Matching
- **Best for**: Autocomplete and prefix-based search
- **Score**: 0-1 (based on common prefix length)
- **Cost**: O(min(n, m))

### Jaccard Similarity
- **Best for**: Identifying similar content with reordered characters
- **Score**: 0-1 (0 = no common bigrams, 1 = identical)
- **Cost**: O(n + m)

## Extending the System

### Adding a Custom Similarity Strategy

1. Create a new strategy class implementing `ISimilarityStrategy`:

```typescript
import { ISimilarityStrategy } from '../types/index.js';

export class CustomSimilarityStrategy implements ISimilarityStrategy {
  name = 'custom';

  calculate(source: string, target: string): number {
    // Your algorithm here
    return score;
  }

  normalize(score: number): number {
    return score;
  }
}
```

2. Register it in the strategy factory (`src/strategies/index.ts`):

```typescript
private registerDefaultStrategies(): void {
  // ... existing strategies
  this.register(new CustomSimilarityStrategy());
}
```

3. Use it via the API:

```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "test",
    "k": 5,
    "strategy": "custom"
  }'
```

## Future Optimizations

- **Database Integration**: Replace JSON file storage with a database (PostgreSQL, MongoDB)
- **Batch Processing**: Support bulk token uploads
- **Indexing**: Implement inverted indices or other structures for faster searches
- **Distributed Caching**: Use Redis for distributed cache in multi-instance setup
- **Async Processing**: Queue-based processing for large similarity searches
- **GraphQL API**: Add GraphQL endpoint option
- **Authentication**: Add JWT-based authentication
- **Rate Limiting**: Implement request rate limiting
- **Performance Monitoring**: Add APM integration

## Project Structure Rationale

This project uses a scalable backend architecture even though the initial data is small because:

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Each layer can be tested independently
3. **Extensibility**: Easy to add new features without touching existing code
4. **Maintainability**: Clear structure makes the codebase easier to understand
5. **Scalability**: Architecture supports migration to database, caching systems, etc.
6. **Production Ready**: Proper error handling, logging, and configuration management

## License

ISC
