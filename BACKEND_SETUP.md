# Eneba Marketplace - Backend Setup Guide

## Prerequisites Installation

### Option 1: Install Go (Recommended)
```bash
# Using Homebrew
brew install go

# Or download from https://go.dev/dl/
curl -OL https://go.dev/dl/go1.23.0.darwin-arm64.tar.gz
sudo tar -C /usr/local -xzf go1.23.0.darwin-arm64.tar.gz
export PATH=$PATH:/usr/local/go/bin
```

### Option 2: Use Docker (Already configured)
```bash
cd /Users/fap/eneba-marketplace
docker-compose up -d
```

## Backend Implementation Status

### ✅ Completed Files:

1. **`internal/config/config.go`**
   - Environment variable loading with Viper
   - Database connection string builder
   - Default values for local development

2. **`internal/middleware/auth.go`**
   - JWT token generation (`GenerateToken`)
   - JWT token parsing and validation (`ParseToken`)
   - Auth middleware (`AuthMiddleware`) - requires valid token
   - Optional auth middleware (`OptionalAuth`) - sets user if token present

3. **`internal/repositories/product_repository.go`**
   - Enhanced `ProductQuery` struct for filtering
   - `GetAll()` with pagination, sorting, search, category/platform filters
   - Full-text search using PostgreSQL ILIKE

4. **`internal/repositories/cart_repository.go`**
   - Upsert logic for adding to cart
   - Update quantity endpoint
   - Clear cart by user ID
   - Preload product details

5. **`internal/handlers/auth_handler.go`**
   - Complete registration with email/username uniqueness checks
   - Login with JWT token return
   - Product listing with all query parameters
   - Cart management (add, get, update, remove)
   - Order creation with mock key generation
   - Order history retrieval

6. **`internal/routes/routes.go`**
   - Proper dependency injection
   - All endpoints mapped correctly
   - Protected routes marked with auth middleware

7. **`cmd/server/main.go`**
   - Database connection using config
   - Auto-migration for all models
   - Sample data seeding (10 realistic products)
   - Health check endpoint
   - CORS properly configured

## Running the Backend

### Method 1: Direct Go Execution
```bash
cd /Users/fap/eneba-marketplace/backend

# Ensure dependencies are downloaded
go mod download

# Run the server
go run ./cmd/server
```

### Method 2: Docker Compose (Recommended)
```bash
cd /Users/fap/eneba-marketplace

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

## API Endpoints Available

### Authentication (Public)
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Get JWT token

### Products (Public with optional auth)
- `GET /api/v1/products?page=1&limit=20&category=Games&platform=PC&sort_by=price&sort_order=asc&search=cyberpunk`
- `GET /api/v1/products/:id`

### Cart (Requires Auth)
- `GET /api/v1/cart`
- `POST /api/v1/cart` - Body: `{product_id: 1, quantity: 1}`
- `PUT /api/v1/cart/:id` - Body: `{quantity: 2}`
- `DELETE /api/v1/cart/:id`

### Orders (Requires Auth)
- `GET /api/v1/orders`
- `GET /api/v1/orders/:id`
- `POST /api/v1/orders` - Body: `{payment_method: "card"}`

### Health Check
- `GET /health`

## Environment Variables

Create a `.env` file or set these in docker-compose.yml:

```env
PORT=8080
JWT_SECRET=your-secret-key-here
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=marketplace
POSTGRES_SSLMODE=disable
```

## Testing the API

### Test Registration
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'
```

### Test Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Products (with token from login)
```bash
TOKEN="your-jwt-token-here"
curl http://localhost:8080/api/v1/products?limit=5 \
  -H "Authorization: Bearer $TOKEN"
```

## Frontend Integration

The frontend is already configured to call these endpoints:
- Base URL: `/api/v1` (proxied through Vite dev server)
- Auth tokens stored in localStorage as `eneba_token`

Update frontend if needed:
```typescript
// src/services/api.ts
const API = import.meta.env.VITE_API_URL || '/api/v1'
```

## Next Steps

1. Install Go (if not already installed)
2. Run `cd backend && go mod tidy` to resolve dependencies
3. Start PostgreSQL (via Docker or local installation)
4. Run `go run ./cmd/server` to start backend
5. Verify frontend connects at http://localhost:3000
