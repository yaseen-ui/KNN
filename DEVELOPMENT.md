# Development Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                          Express App                         │
│      (Request → Middleware → Controller → Response)          │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
         ┌──────▼──────┐      │             │
         │  Middleware │      │             │
         ├─────────────┤      │             │
         │  Logging    │      │             │
         │  Error      │      │             │
         │  Handlers   │      │             │
         └─────────────┘      │             │
                              │             │
                        ┌─────▼─────┐      │
                        │Controllers │      │
                        ├────────────┤      │
                        │  addToken  │      │
                        │findSimilar │      │
                        │getAllTokens│      │
                        │getStats    │      │
                        └─────┬──────┘      │
                              │             │
                        ┌─────▼─────────────┴─┐
                        │    Services          │
                        ├──────────────────────┤
                        │  TokenService        │
                        │  - Add tokens        │
                        │  - Find similar      │
                        │  - Calculate scores  │
                        │  - Manage cache      │
                        └─────┬────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
              ┌─────▼────┐    │         │
              │Repository │    │         │
              ├───────────┤    │         │
              │Load tokens│    │         │
              │Save token │    │         │
              │Update     │    │         │
              │Delete     │    │         │
              └─────┬─────┘    │         │
                    │          │         │
              ┌─────▼────┐     │         │
              │ JSON File │    │         │
              │  Storage  │    │         │
              └───────────┘    │         │
                               │         │
                         ┌─────▼─┐    ┌─▼───────────┐
                         │ Cache │    │ Strategies  │
                         ├───────┤    ├─────────────┤
                         │LRU    │    │Levenshtein  │
                         │Cache  │    │Prefix       │
                         │Mgr    │    │Jaccard      │
                         └───────┘    └─────────────┘
```

## Layer Responsibilities

### Controllers (`src/controllers/`)
- Parse HTTP requests
- Validate input parameters
- Call appropriate services
- Format and send responses

### Services (`src/services/`)
- Implement business logic
- Coordinate between repositories and strategies
- Manage caching decisions
- Handle data transformations

### Strategies (`src/strategies/`)
- Implement similarity algorithms
- Follow `ISimilarityStrategy` interface
- Are stateless and reusable
- Return normalized scores

### Repositories (`src/repositories/`)
- Handle all file I/O operations
- Load/save tokens to JSON
- Hide storage implementation details
- Provide queries to services

### Cache (`src/cache/`)
- Store search results
- Manage cache lifecycle (TTL, LRU eviction)
- Independent of storage mechanism

### Middleware (`src/middleware/`)
- Log requests/responses
- Handle global errors
- Authentication (future)
- Rate limiting (future)

### Config (`src/config/`)
- Centralize configuration
- Environment-based settings
- Accessible throughout app

## Adding a New Feature

### Example: Add a similarity scoring boost for exact matches

1. **Modify the Strategy** (`src/strategies/levenshteinSimilarity.ts`)
   ```typescript
   calculate(source: string, target: string): number {
     if (source.toLowerCase() === target.toLowerCase()) {
       return 0; // exact match
     }
     // ... rest of algorithm
   }
   ```

2. **Update Service Normalization** (`src/services/tokenService.ts`)
   ```typescript
   if (strategy.name === 'levenshtein') {
     const distance = strategy.calculate(...);
     const maxDistance = Math.max(...);
     score = 1 - (distance / (maxDistance || 1));
     
     // Boost exact matches
     if (score === 1) {
       score = 1.0; // already 1
     }
   }
   ```

3. **Test via API**
   ```bash
   curl -X POST http://localhost:3000/api/tokens/search \
     -H "Content-Type: application/json" \
     -d '{
       "query": "apple",
       "k": 5,
       "strategy": "levenshtein"
     }'
   ```

## Adding a Custom Strategy

### Step 1: Create Strategy Class
Create `src/strategies/customSimilarity.ts`:
```typescript
import { ISimilarityStrategy } from '../types/index.js';

export class CustomSimilarityStrategy implements ISimilarityStrategy {
  name = 'custom';

  calculate(source: string, target: string): number {
    // Your implementation
    return score;
  }

  normalize(score: number): number {
    // Ensure score is 0-1
    return Math.max(0, Math.min(1, score));
  }
}
```

### Step 2: Register in Factory
Update `src/strategies/index.ts`:
```typescript
import { CustomSimilarityStrategy } from './customSimilarity.js';

private registerDefaultStrategies(): void {
  this.register(new PrefixSimilarityStrategy());
  this.register(new LevenshteinSimilarityStrategy());
  this.register(new JaccardSimilarityStrategy());
  this.register(new CustomSimilarityStrategy()); // Add here
}
```

### Step 3: Update Service (if needed)
If your strategy needs special normalization in `src/services/tokenService.ts`:
```typescript
if (strategy.name === 'custom') {
  // Custom normalization logic
  score = strategy.calculate(...);
}
```

### Step 4: Use via API
```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "test",
    "k": 5,
    "strategy": "custom"
  }'
```

## Testing Strategies

### Unit Test Example Structure
```typescript
// src/strategies/__tests__/levenshteinSimilarity.test.ts
import { LevenshteinSimilarityStrategy } from '../levenshteinSimilarity';

describe('LevenshteinSimilarityStrategy', () => {
  const strategy = new LevenshteinSimilarityStrategy();

  it('should calculate distance for identical strings', () => {
    const distance = strategy.calculate('test', 'test');
    expect(distance).toBe(0);
  });

  it('should calculate distance for one character difference', () => {
    const distance = strategy.calculate('test', 'text');
    expect(distance).toBe(1);
  });
});
```

## Performance Optimization Roadmap

### Phase 1: Caching (✅ Implemented)
- In-memory LRU cache
- Configurable TTL

### Phase 2: Indexing
- Character n-gram indices
- Token value indices
- Weighted search

### Phase 3: Database
- Migrate from JSON to PostgreSQL
- Add query optimization
- Connection pooling

### Phase 4: Distributed Cache
- Redis integration
- Multi-instance support

### Phase 5: Async Processing
- Queue-based indexing
- Background similarity scoring

## Configuration Extension

Add new config in `src/config/config.ts`:
```typescript
interface Config {
  // ... existing
  newFeature: {
    enabled: boolean;
    value: string;
  };
}

const config: Config = {
  // ... existing
  newFeature: {
    enabled: process.env.NEW_FEATURE_ENABLED === 'true',
    value: process.env.NEW_FEATURE_VALUE || 'default',
  },
};
```

Then use in your code:
```typescript
import config from '../config/config.js';

if (config.newFeature.enabled) {
  // Use the feature
}
```

## Common Tasks

### Update Logging Output
Edit `src/middleware/index.ts` in the `Logger` class:
```typescript
static info(message: string, data?: unknown): void {
  // Customize format here
  this.log('info', message, data);
}
```

### Modify Response Format
Edit `src/utils/helpers.ts`:
```typescript
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200
): void => {
  // Customize response structure
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    // Add custom fields
  };
  res.status(statusCode).json(response);
};
```

### Add API Validation
Extend `src/utils/helpers.ts`:
```typescript
export const isValidCustomField = (value: unknown): boolean => {
  // Your validation logic
  return true;
};
```

Then use in controllers:
```typescript
if (!isValidCustomField(req.body.custom)) {
  sendError(res, 'Invalid custom field', 400);
  return;
}
```

## Debugging

### Enable debug logging
```bash
LOG_LEVEL=debug npm run dev
```

### Check cache statistics
```bash
curl http://localhost:3000/api/stats
```

### Inspect token data
```bash
curl http://localhost:3000/api/tokens | jq .
```

### Monitor request logs
Watch the console output while making requests. Each request logs its path, method, and response time.

## Best Practices

1. **Keep services stateless** - All state in cache or repository
2. **Validate early** - Check all inputs at controller level
3. **Log important operations** - Use Logger for tracking
4. **Use async/await** - All file operations are async
5. **Error boundaries** - Try/catch in services
6. **Type safety** - Use TypeScript interfaces
7. **Configuration** - Don't hardcode values
8. **Separation of concerns** - Each layer has one job

## Related Documentation

- [README.md](./README.md) - Complete API documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
