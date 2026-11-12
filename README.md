# Eneba-Style Digital Marketplace

A full-stack digital marketplace web application for buying and selling game keys, gift cards, and other digital goods — inspired by Eneba.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Go (Gin Framework) |
| Database | PostgreSQL |

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
│   │   ├── routes/           # Route definitions
│   │   └── services/         # Business logic
│   ├── migrations/           # Database migration SQL files
│   ├── config/               # Configuration files
│   ├── go.mod
│   └── go.sum
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Go 1.21+
- PostgreSQL 14+

### Backend Setup

```bash
cd backend
go mod download
cp config/config.example.yaml config/config.yaml
# Edit config.yaml with your database credentials
go run ./cmd/server
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Database Migration

```bash
psql -U postgres -d marketplacetwo -f backend/migrations/001_init.sql
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/products` | List products |
| GET | `/api/v1/products/:id` | Get product details |
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/cart` | Add item to cart |
| POST | `/api/v1/orders` | Create order |

## Scripts

```bash
# Run everything with Docker Compose
docker-compose up -d

# Build backend
cd backend && go build ./cmd/server

# Lint frontend
cd frontend && npx eslint src/

# Type-check frontend
cd frontend && npx tsc --noEmit
```

## License

Private — Eneba Marketplace
