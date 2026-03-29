# Quick Start Guide

## Setup

1. **Clone/Navigate to project directory**
   ```bash
   cd /Users/shabanadude/Desktop/modals-test/ev-charge-a/KNN
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **(Optional) Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env as needed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`

## Quick Test

### 1. Check if server is running
```bash
curl http://localhost:3000/api/health
```

### 2. Add some tokens (sample data is already in `data/tokens.json`)
```bash
curl -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{"value": "javascript"}'

curl -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{"value": "typescript"}'

curl -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{"value": "java"}'
```

### 3. Search for similar tokens
```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "script",
    "k": 3,
    "strategy": "levenshtein"
  }'
```

### 4. View system statistics
```bash
curl http://localhost:3000/api/stats
```

### 5. List all tokens
```bash
curl http://localhost:3000/api/tokens
```

## Available Strategies

Try different similarity strategies:

### Levenshtein (default)
Best for typo detection
```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "aple",
    "k": 3,
    "strategy": "levenshtein"
  }'
```

### Prefix
Best for autocomplete
```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "java",
    "k": 3,
    "strategy": "prefix"
  }'
```

### Jaccard
Best for bigram-based similarity
```bash
curl -X POST http://localhost:3000/api/tokens/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "script",
    "k": 3,
    "strategy": "jaccard"
  }'
```

## Build for Production

```bash
npm run build
npm start
```

This will:
1. Compile TypeScript to JavaScript in `dist/`
2. Start the server from compiled code

## Project Structure Overview

```
KNN/
├── src/                    # Source code
│   ├── controllers/       # HTTP request handlers
│   ├── services/          # Business logic
│   ├── repositories/      # Data layer
│   ├── strategies/        # Similarity algorithms
│   ├── cache/            # Caching
│   ├── middleware/       # Express middleware
│   ├── config/           # Configuration
│   ├── utils/            # Utilities
│   ├── types/            # TypeScript interfaces
│   └── app.ts            # Main Express app
├── data/                  # Local JSON storage
│   └── tokens.json       # Token data
├── dist/                  # Compiled JavaScript (after build)
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── README.md             # Full documentation
├── .env.example          # Environment variables template
└── LICENSE               # License
```

## Key Features

✅ **Layered Architecture**: Controllers → Services → Repositories  
✅ **Multiple Algorithms**: Levenshtein, Prefix, Jaccard  
✅ **Caching**: In-memory LRU cache for search results  
✅ **Logging**: Structured JSON logging  
✅ **Config Driven**: Environment-based configuration  
✅ **Error Handling**: Comprehensive error responses  
✅ **Extensible**: Easy to add new strategies  

## Troubleshooting

### Port already in use
```bash
# Use a different port
PORT=3001 npm run dev
```

### Data file not found
The system will automatically create the `data/` directory and `tokens.json` file on first write.

### Module not found errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Read [README.md](./README.md) for comprehensive documentation
2. Check out the API endpoints reference
3. Try different similarity strategies
4. Experiment with metadata
5. Consider the optimization suggestions in the README

Enjoy your token similarity engine! 🚀
