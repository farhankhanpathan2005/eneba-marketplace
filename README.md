# Eneba-Style Digital Marketplace

A full-stack digital marketplace web application for buying and selling game keys, gift cards, and other digital goods — inspired by Eneba.

## Status: ✅ Ready for Deployment

This application is fully implemented and ready for deployment.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Go 1.23 (Gin Framework) |
| Database | PostgreSQL 16 |

## Project Structure

```
eneba-marketplace/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page-level components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service layer
│   │   ├── styles/           # Global styles & CSS modules
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Go backend
│   ├── cmd/
│   │   └── server/           # Main entry point
│   ├── internal/
│   │   ├── handlers/         # HTTP request handlers
│   │   ├── middleware/       # Authentication, logging, etc.
│   │   ├── models/           # Domain models
│   │   ├── repositories/     # Data access layer
│   │   └── services/         # Business logic
│   ├── migrations/           # Database migration SQL files
│   ├── config/               # Configuration files
│   ├── go.mod
│   └── go.sum
├── docker-compose.yml        # Docker Compose for local dev
├── Dockerfile.frontend       # Frontend production build
├── Dockerfile.backend        # Backend production build
├── .gitignore
└── README.md
```

## Features Implemented

### Frontend
- Eneba-style purple theme (#7c4ddb) design
- Hero banner with promotional content
- Category navigation (Games, Gift Cards, Software, Streaming)
- Product grid with hover effects and quick view overlay
- Advanced filtering (category, platform, price range, sort)
- Multi-seller comparison table on product detail pages
- Cart management with quantity controls
- Checkout flow with payment simulation
- Digital key delivery with copy-to-clipboard
- Order history page
- JWT authentication (login/register)
- Toast notifications system
- Responsive mobile-friendly design

### Backend
- JWT authentication with bcrypt password hashing
- RESTful API with proper error handling
- Product catalog with full-text search and filtering
- Shopping cart with upsert logic
- Order processing with mock key generation
- Auto-migration and sample data seeding
- Health check endpoint
- CORS properly configured

## API Endpoints

### Public Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/products` | List products (paginated, filterable) |
| GET | `/api/v1/products/:id` | Get single product |
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | User login (returns JWT) |

### Protected Endpoints (Require Bearer Token)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/cart` | Get user's cart |
| POST | `/api/v1/cart` | Add item to cart |
| PUT | `/api/v1/cart/:id` | Update cart item quantity |
| DELETE | `/api/v1/cart/:id` | Remove from cart |
| GET | `/api/v1/orders` | List user orders |
| GET | `/api/v1/orders/:id` | Get order details |
| POST | `/api/v1/orders` | Create order (checkout) |

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Go 1.23+
- PostgreSQL 16+

### Quick Start (Docker Compose)

```bash
# Run all services together
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Manual Setup

#### Backend

```bash
cd backend
go mod download
export JWT_SECRET="your-secret-key-here"
go run ./cmd/server
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000 and proxies API calls to http://localhost:8080

## Database Schema

The database schema includes:
- `users` - User accounts with email, username, password hash, role
- `products` - Marketplace products with category, platform, price, rating, seller
- `carts` - User cart items
- `orders` - User orders with status and total
- `order_items` - Individual items within orders

## Sample Products

The database comes pre-seeded with 10 products:
1. Grand Theft Auto VI - $59.99 (was $79.99)
2. Cyberpunk 2077: Ultimate Edition - $29.99
3. The Witcher 3: Complete Edition - $19.99
4. Steam $50 Gift Card - $47.99
5. PlayStation Network $25 Card - $23.99
6. Xbox Game Pass Ultimate - $14.99
7. Microsoft Office 365 - $39.99
8. Fortnite V-Bucks 2800 - $22.99
9. FIFA 24 Standard Edition - $39.99
10. Netflix Gift Card $25 - $23.99

## Environment Variables

### Backend (.env)
```bash
PORT=8080
JWT_SECRET=your-secret-key-here
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=marketplace
POSTGRES_SSLMODE=disable
```

## Deployment

### Frontend: Vercel (Recommended)
1. Push code to GitHub
2. Connect Vercel to your GitHub repo
3. Set output directory: `/frontend`
4. Build command: `cd frontend && npm run build`
5. Vite will auto-detect the frontend framework

### Backend: Render
1. Create a new Web Service
2. Build command: `cd backend && go build -o server ./cmd/server`
3. Start command: `./server`
4. Set environment variables (see above)

### Database: Supabase or Neon.tech
- Create PostgreSQL database
- Update connection string in environment variables

### Alternative: Railway.app
1. Create project from GitHub
2. Railway auto-detects Docker configurations
3. Add PostgreSQL plugin
4. Configure environment variables

## Testing the Application

1. **Browse Products**: Visit the homepage and explore products
2. **Search & Filter**: Use the search bar or go to /products
3. **Product Detail**: Click any product to see seller comparison
4. **Register/Login**: Create an account or login
5. **Add to Cart**: Click "Add to Cart" on any product
6. **Checkout**: Go to cart and complete purchase
7. **View Keys**: Receive digital keys after purchase
8. **Order History**: View past orders

## Git Repository

The project is committed to Git at:
```
git init
git add .
git commit -m "Complete Eneba marketplace assignment implementation"
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## License

Private — Eneba Marketplace Assignment
