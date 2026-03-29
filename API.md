# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, no authentication is required. This can be added in the future using JWT tokens.

## Response Format

All responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Endpoint-specific data
  },
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (for POST that creates resources) |
| 400 | Bad Request (invalid parameters) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Endpoints

### 1. Health Check

Check if the server is running and healthy.

**Request:**
```
GET /health
```

**cURL:**
```bash
curl http://localhost:3000/api/health
```

**Response (200 OK):**
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

---

### 2. Get System Statistics

Retrieve information about tokens, cache, available strategies, and configuration.

**Request:**
```
GET /stats
```

**cURL:**
```bash
curl http://localhost:3000/api/stats
```

**Response (200 OK):**
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
    "strategies": [
      "levenshtein",
      "prefix",
      "jaccard"
    ],
    "config": {
      "defaultStrategy": "levenshtein",
      "nodeEnv": "development"
    }
  },
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

**Fields:**
- `tokens.count` - Total number of tokens in storage
- `cache.size` - Current number of cached results
- `cache.maxSize` - Maximum cache size before LRU eviction
- `cache.enabled` - Whether caching is enabled
- `strategies` - List of available similarity strategies
- `config.defaultStrategy` - Default strategy used when none specified
- `config.nodeEnv` - Node environment (development/production)

---

### 3. Add Token

Add a new token to the system.

**Request:**
```
POST /tokens
Content-Type: application/json

{
  "value": "string (required)",
  "metadata": {
    // Optional: any JSON object
  }
}
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| value | string | Yes | The token value (non-empty string) |
| metadata | object | No | Optional metadata associated with token |

**cURL:**
```bash
# Simple token
curl -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{"value": "apple"}'

# Token with metadata
curl -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{
    "value": "javascript",
    "metadata": {
      "category": "programming language",
      "ecosystem": "web",
      "year": 1995
    }
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "value": "apple",
    "metadata": null,
    "createdAt": "2026-03-29T10:00:00.000Z"
  },
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Token value must be a non-empty string",
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

**Error Cases:**
- Missing `value` field
- Empty or whitespace-only value
- Invalid data type

---

### 4. List All Tokens

Retrieve all tokens from the system.

**Request:**
```
GET /tokens
```

**cURL:**
```bash
curl http://localhost:3000/api/tokens

# Pretty print with jq
curl http://localhost:3000/api/tokens | jq .
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tokens": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "value": "apple",
        "metadata": {
          "category": "fruit"
        },
        "createdAt": "2026-03-29T10:00:00.000Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "value": "application",
        "metadata": null,
        "createdAt": "2026-03-29T10:00:01.000Z"
      }
    ],
    "count": 2
  },
  "timestamp": "2026-03-29T10:00:02.000Z"
}
```

**Fields:**
- `tokens` - Array of all tokens
- `count` - Total number of tokens

---

### 5. Find Similar Tokens

Search for tokens similar to a query string using specified strategy.

**Request:**
```
POST /tokens/search
Content-Type: application/json

{
  "query": "string (required)",
  "k": "number (required)",
  "strategy": "string (optional)",
  "threshold": "number (optional)"
}
```

**Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| query | string | Yes | - | Search query (non-empty string) |
| k | number | Yes | - | Number of results to return (1-1000) |
| strategy | string | No | levenshtein | Similarity strategy: `levenshtein`, `prefix`, or `jaccard` |
| threshold | number | No | 0 | Minimum similarity score (0-1) |

**cURL Examples:**

Basic search using default strategy:
```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "aple",
    "k": 5
  }'
```

Using Levenshtein strategy with threshold:
```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "aple",
    "k": 3,
    "strategy": "levenshtein",
    "threshold": 0.5
  }'
```

Using Prefix strategy for autocomplete:
```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "app",
    "k": 5,
    "strategy": "prefix"
  }'
```

Using Jaccard strategy for bigram similarity:
```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "script",
    "k": 5,
    "strategy": "jaccard"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "query": "aple",
    "strategy": "levenshtein",
    "k": 5,
    "threshold": null,
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
        "tokenValue": "apply",
        "score": 0.75,
        "metadata": null
      }
    ]
  },
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

**Response Fields:**
- `query` - The search query
- `strategy` - Strategy used for search
- `k` - Number of results requested
- `threshold` - Threshold applied (if any)
- `count` - Number of results returned
- `results` - Array of similar tokens with:
  - `tokenId` - Unique identifier
  - `tokenValue` - Token value
  - `score` - Similarity score (0-1, higher = more similar)
  - `metadata` - Associated metadata

**Error Responses:**

Missing required field:
```json
{
  "success": false,
  "error": "Field 'query' is required",
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

Invalid k value:
```json
{
  "success": false,
  "error": "k must be a positive integer between 1 and 1000",
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

Invalid strategy:
```json
{
  "success": false,
  "error": "Strategy 'unknown' not found. Available: levenshtein, prefix, jaccard",
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

Invalid threshold:
```json
{
  "success": false,
  "error": "Threshold must be a number between 0 and 1",
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

**Caching:**
- Search results are cached automatically
- Cache key: `query:strategy:k`
- Cache expiration: 5 minutes (configurable)
- Cache is cleared when new tokens are added

---

## Similarity Strategies

### Levenshtein Distance

Calculates minimum edits (insert, delete, replace) needed to transform one string to another.

**Best for:**
- Typo detection
- Approximate string matching
- Text similarity

**Score:** 0-1 (1 = identical, 0 = completely different)

**Complexity:** O(n*m) where n and m are string lengths

**Example:**
```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "aple",
    "k": 5,
    "strategy": "levenshtein"
  }'
```

### Prefix Matching

Measures similarity based on common prefix length.

**Best for:**
- Autocomplete suggestions
- Prefix-based search
- Fast approximate matching

**Score:** 0-1 (based on common prefix length)

**Complexity:** O(min(n, m))

**Example:**
```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "app",
    "k": 5,
    "strategy": "prefix"
  }'
```

### Jaccard Similarity

Measures similarity between sets using intersection over union. Uses character bigrams as sets.

**Best for:**
- Content similarity
- Finding similar documents with reordered text
- Bigram-based matching

**Score:** 0-1 (0 = no common bigrams, 1 = identical)

**Complexity:** O(n + m)

**Example:**
```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "script",
    "k": 5,
    "strategy": "jaccard"
  }'
```

---

## Rate Limiting

Currently not implemented. Can be added with middleware in future versions.

## Pagination

Currently not supported. All GET endpoints return complete results. Can be added if needed.

## Sorting

Search results are sorted by similarity score in descending order (most similar first).

## Caching Behavior

- **Enabled by default** - Can be disabled via `CACHE_ENABLED=false`
- **TTL**: 5 minutes (configurable via `CACHE_TTL`)
- **Max entries**: 1000 (configurable via `CACHE_MAX_SIZE`)
- **Eviction policy**: LRU (Least Recently Used)
- **Cache key**: `{query}:{strategy}:{k}`

Cache is automatically cleared when:
- A new token is added
- Server restarts
- Max entries exceeded (LRU eviction)

---

## Logging

All requests and responses are logged in JSON format.

**Example log output:**
```json
{
  "timestamp": "2026-03-29T10:00:00.000Z",
  "level": "info",
  "message": "Incoming request",
  "data": {
    "requestId": "abc123",
    "method": "POST",
    "path": "/api/tokens/search"
  }
}
```

Control logging level with `LOG_LEVEL` environment variable:
- `debug` - Detailed debugging information
- `info` - General information (default)
- `warn` - Warning messages
- `error` - Error messages only

---

## Usage Examples

### Autocomplete

```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "jav",
    "k": 10,
    "strategy": "prefix"
  }'
```

### Typo Correction

```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "javascirpt",
    "k": 5,
    "strategy": "levenshtein",
    "threshold": 0.7
  }'
```

### Duplicate Detection

```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "exact_match",
    "k": 1,
    "strategy": "levenshtein",
    "threshold": 0.99
  }'
```

### Related Content Discovery

```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "search_term",
    "k": 10,
    "strategy": "jaccard",
    "threshold": 0.1
  }'
```

---

## Troubleshooting

### No results returned
- Check if query is too dissimilar to tokens
- Lower the threshold value
- Try a different strategy
- Verify tokens exist with `GET /tokens`

### Slow searches
- Results are cached - first search may be slow
- Subsequent searches with same parameters return instantly
- Consider using prefix strategy for faster matching

### Server not responding
- Check server is running: `curl http://localhost:3000/api/health`
- Check logs for errors
- Verify port is not blocked

---

## Performance Characteristics

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Add token | O(n) | Reads all tokens, adds one, writes back |
| List tokens | O(n) | Reads all tokens from file |
| Levenshtein search | O(n*m) | n = # tokens, m = avg token length |
| Prefix search | O(n*min(q,m)) | q = query length |
| Jaccard search | O(n*(q+m)) | Uses bigrams |
| Cache hit | O(1) | Instant lookup |

With 1000 tokens and average length 20:
- Levenshtein search: < 100ms (uncached)
- Prefix search: < 50ms (uncached)
- Cached search: < 1ms

---

## Future Enhancements

- [ ] Batch token import/export
- [ ] More similarity algorithms (Soundex, Metaphone)
- [ ] Database backend (PostgreSQL, MongoDB)
- [ ] Distributed caching (Redis)
- [ ] GraphQL API
- [ ] WebSocket for real-time search
- [ ] Authentication and authorization
- [ ] Rate limiting
- [ ] Bulk operations
- [ ] Search analytics

---

## Support

For issues or questions:
1. Check the [README.md](./README.md) for comprehensive documentation
2. Review [QUICKSTART.md](./QUICKSTART.md) for quick setup
3. Check [DEVELOPMENT.md](./DEVELOPMENT.md) for architectural details
4. Check logs: `LOG_LEVEL=debug npm run dev`
