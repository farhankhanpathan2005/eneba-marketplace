# Eneba Marketplace — Complete Prompt Sequence
## Eneba Intern Assignment 2027

This document contains the step-by-step prompts used to build the Eneba-style digital marketplace web application for the 2027 intern assignment.

---

## Phase 1: Project Initialization & Architecture

### Prompt 1.1 — Initial Setup
```
Create a full-stack marketplace web application inspired by Eneba.com 
for buying and selling digital game keys, gift cards, and software.

Tech Stack Requirements:
- Frontend: React 18 + TypeScript + Vite
- Backend: Go (Gin Framework)
- Database: PostgreSQL
- Deployment: Docker Compose for local development

Project Structure:
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
│   ├── cmd/server/           # Main entry point
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
├── docker-compose.yml        # Development environment
├── Dockerfile.backend        # Backend container
├── Dockerfile.frontend       # Frontend build container
└── README.md

Requirements:
1. Initialize Go module in backend with Gin, GORM, PostgreSQL driver
2. Initialize React + TypeScript project using Vite in frontend
3. Create docker-compose.yml with Postgres service
4. Write comprehensive README with setup instructions
5. Create .gitignore for both frontend and backend
```

---

### Prompt 1.2 — Database Schema Design
```
Design and implement the database schema for a multi-seller digital marketplace:

Tables needed:
1. users - Customer accounts with authentication
2. products - Digital items (game keys, gift cards, software)
3. sellers - Seller profiles linked to users
4. cart_items - Shopping cart entries
5. orders - Purchase transactions
6. order_items - Individual items within orders
7. seller_offers - Multiple price offers per product from different sellers

Key relationships:
- One user can be a customer OR seller (or both)
- One product can have multiple seller offers
- Each order contains multiple order items
- Orders are created by one user

Write SQL migration file (migrations/001_init.sql) with:
- Proper foreign key constraints
- Indexes for performance (category, seller_id, user_id, product_id)
- Timestamps with timezone support
- Sample seed data (10-15 realistic products)
```

---

### Prompt 1.3 — Core Models (Go)
```
Create GORM models for the marketplace in backend/internal/models/models.go:

Models to implement:
1. User - id, email, password_hash, username, role (customer/seller), created_at, updated_at
2. Product - id, title, description, category, platform, image_url, rating, review_count, created_at
3. SellerOffer - id, product_id, seller_id, price, region, delivery_method, stock, seller_rating
4. CartItem - id, user_id, seller_offer_id, quantity
5. Order - id, user_id, status, total_amount, payment_method, created_at
6. OrderItem - id, order_id, seller_offer_id, product_id, quantity, price_per_unit

Include proper JSON tags for API serialization.
Add GORM tags for constraints and indexes.
Create separate model files or keep in models.go as appropriate.
```

---

## Phase 2: Backend Implementation

### Prompt 2.1 — Repository Layer
```
Implement the repository/data access layer in backend/internal/repositories/:

Files to create:
1. user_repository.go - CRUD operations for users, find by email/username
2. product_repository.go - Get all products, get by ID, search, filter by category/platform
3. seller_offer_repository.go - Get offers by product, create/update/delete
4. cart_repository.go - Add/remove/update cart items, get user's cart with totals
5. order_repository.go - Create orders with items, get user orders, update status

Each repository should:
- Accept *gorm.DB in constructor
- Return appropriate errors
- Use prepared statements where possible
- Handle concurrent access safely
```

---

### Prompt 2.2 — Authentication Handlers
```
Create auth handler in backend/internal/handlers/auth_handler.go:

Endpoints:
POST /api/v1/auth/register
- Request: email, username, password
- Validate email format, username length (3-50 chars), password min 6 chars
- Check if email/username already exists
- Hash password with bcrypt (cost 12)
- Create user with role "customer"
- Return user ID and email (not password hash)
- Status 201 Created or 409 Conflict

POST /api/v1/auth/login
- Request: email, password
- Find user by email
- Verify password with bcrypt.CompareHashAndPassword
- Generate JWT token (use github.com/golang-jwt/jwt/v5)
- Return {token, user_id, username, role}
- Status 200 OK or 401 Unauthorized

Auth middleware in backend/internal/middleware/auth.go:
- Extract Bearer token from Authorization header
- Parse and validate JWT
- Set user claims in gin.Context
- Protect routes that require authentication
```

---

### Prompt 2.3 — Product Handlers
```
Create product handlers in backend/internal/handlers/product_handler.go:

GET /api/v1/products
- Query params: page, limit, category, platform, min_price, max_price, sort_by, sort_order
- Support pagination with offset/limit
- Filter by category and platform
- Sort by: price (asc/desc), rating (desc), newest (desc)
- Full-text search on title and description (use ilike or postgres ts_vector)
- Return paginated response: {data: [], total: count, page: N, limit: M}

GET /api/v1/products/:id
- Get single product with its seller offers
- Include offer details in response
- Return 404 if not found

GET /api/v1/products/search?q=query
- Search endpoint with fuzzy matching
- Handle typos using levenshtein distance or pg_trgm
- Return top 20 matches ranked by relevance
- Also search by partial names

Include CORS middleware for frontend origin.
```

---

### Prompt 2.4 — Cart & Checkout Handlers
```
Create cart and order handlers in backend/internal/handlers/cart_order_handler.go:

Cart endpoints (require auth):
POST /api/v1/cart/add
- Request: seller_offer_id, quantity (default 1)
- Add to cart or update quantity if exists
- Return updated cart item

DELETE /api/v1/cart/:item_id
- Remove item from cart

PUT /api/v1/cart/:item_id
- Update quantity (min 1, max stock available)

GET /api/v1/cart
- Get authenticated user's cart
- Return items with product details and total price

Order endpoints (require auth):
POST /api/v1/orders
- Request: payment_method (string)
- Validate cart has items
- Calculate total from cart items
- Create order with status "pending"
- Create order_items from cart
- Clear cart after successful order
- Simulate payment processing (no real gateway required)
- Update order status to "completed"
- Generate mock digital key (format: XXXX-XXXX-XXXX-XXXX)
- Return order with generated keys

GET /api/v1/orders
- List user's orders with status and items

GET /api/v1/orders/:id
- Get single order with full details including digital keys
- Return 404 if not found or not belonging to user
```

---

### Prompt 2.5 — API Routes Setup
```
Configure all API routes in backend/internal/routes/routes.go:

Group all routes under /api/v1:

Public routes:
- /auth/register
- /auth/login
- /products (with search, filtering, sorting)
- /products/:id

Protected routes (require JWT):
- /cart/*
- /orders/*

Set up Gin engine with:
- CORS middleware allowing frontend origin
- Logger middleware
- Recovery middleware
- Rate limiting (optional but recommended)

Initialize database connection from config.
```

---

## Phase 3: Frontend Implementation

### Prompt 3.1 — Project Setup & Types
```
Set up the React + TypeScript frontend in frontend/src/:

Create types/index.ts with interfaces:
- Product (id, title, description, category, platform, imageUrl, rating, reviewCount)
- SellerOffer (id, productId, sellerId, price, region, deliveryMethod, sellerRating)
- CartItem (id, userId, productId, quantity, product?)
- Order (id, userId, status, total, createdAt, orderItems?)
- OrderItem (id, orderId, productId, quantity, price)
- User (id, email, username, role)
- ApiResponse<T> (data: T, message?: string)

Create services/api.ts with:
- axios instance with base URL from env
- Token management (get/set/remove token from localStorage)
- Request interceptor to add Authorization header
- Error handling wrapper
- Typed functions for each API endpoint

Update vite.config.ts with proxy to backend:
- /api/* → http://localhost:8080
```

---

### Prompt 3.2 — Layout Components
```
Create layout components for consistent site structure:

components/layout/Header.tsx:
- Logo (ENEBA style - orange/white)
- Search bar (links to /products?search=query)
- Navigation links: Home, Products, My Orders
- Auth section: Login/Register buttons or User menu with avatar
- Cart icon with item count badge
- Responsive: hamburger menu on mobile

components/layout/Footer.tsx:
- Company info column
- Quick links (About, Support, Terms)
- Categories popular links
- Social media icons
- Copyright notice
- Dark background (#1a1a2e)

Apply Eneba color scheme:
- Primary: #ff6b00 (orange)
- Secondary: #1a1a2e (dark navy)
- Accent: #4ade80 (green for prices/deals)
- Background: #f8f9fa
- Text: #1a1a2e
```

---

### Prompt 3.3 — Homepage
```
Create homepage at pages/HomePage.tsx assembled from dynamic blocks:

The homepage should display these sections, ALL fetched from the API:

1. Hero Banner
   - Large promotional banner
   - Dynamic content from a "featured" endpoint
   - Call-to-action button linking to products

2. Featured Categories
   - Grid of category cards (Games, Gift Cards, Software, etc.)
   - Each card shows category name and icon
   - Links to filtered products page

3. Best Sellers
   - Section title "Best Sellers"
   - Horizontal scroll or grid of 8 products
   - Fetch from GET /api/v1/products?sort_by=rating&sort_order=desc&limit=8
   - Render as ProductCard components

4. Current Deals
   - Section title "Today's Deals"
   - Products with original_price > price showing discount
   - Show discount badge (e.g., "-25%")
   - Fetch from API filtering by original_price field

5. New Arrivals
   - Recently added products
   - Fetch with sort_by=newest&limit=6

IMPORTANT: No hardcoded product data. All content comes from API responses.
If API fails, show loading states or empty states gracefully.
```

---

### Prompt 3.4 — Products Page with Filters
```
Create products listing page at pages/ProductsPage.tsx:

Features required:
1. Search bar at top
   - Debounced input (300ms delay)
   - Trigger redirect to /products?search=query
   
2. Filter sidebar (collapsible on mobile)
   - Category dropdown (Games, Gift Cards, Software, Streaming, etc.)
   - Platform filter (PC, Xbox, PlayStation, Nintendo, Mobile)
   - Price range slider (min/max inputs)
   - Region filter (EU, NA, ROW, etc.)
   
3. Sort controls
   - Dropdown: Price Low-High, Price High-Low, Rating, Newest
   
4. Product grid
   - 3 columns desktop, 2 tablet, 1 mobile
   - Responsive grid using CSS Grid
   - Loading skeleton while fetching
   
5. Pagination
   - Page numbers with Prev/Next buttons
   - Display X of Y results
   
6. URL sync
   - Filters reflected in URL query params
   - Restore filters on page reload
   
Fetch products from GET /api/v1/products with all query params.
Show empty state when no products match filters.
```

---

### Prompt 3.5 — Product Detail Page (Multi-Seller)
```
Create product detail page at pages/ProductDetailPage.tsx:

Layout:
- Two-column layout on desktop, stacked on mobile

Left column:
- Large product image (from imageUrl)
- Back to products link

Right column:
- Product title (H1)
- Category and platform badges
- Average rating with stars
- Review count

Price comparison table - SHOW MULTIPLE SELLERS:
| Seller | Price | Region | Delivery | Rating | Action |
|--------|-------|--------|----------|--------|--------|
| Seller A | $12.99 | EU | Instant | ⭐ 4.8 | Add to Cart |
| Seller B | $11.50 | ROW | < 1h | ⭐ 4.5 | Add to Cart |
| Seller C | $14.00 | NA | Instant | ⭐ 4.9 | Add to Cart |

Fetch seller offers from GET /api/v1/products/:id (includes offers array)
Sort offers by price ascending by default
Allow user to select offer before adding to cart

Product details section below:
- Description
- Key features list
- System requirements (if applicable)
- Related products (4 items from same category)

Quantity selector for personal purchases
"Add to Cart" button triggers API call to POST /api/v1/cart/add
Display success toast on add
```

---

### Prompt 3.6 — Cart & Checkout Flow
```
Create cart page at pages/CartPage.tsx:

Cart contents:
- List of items with product image, title, selected seller offer
- Quantity controls (+/- buttons)
- Remove item button
- Price per item and line total
- Discount calculation if applicable

Cart summary sidebar:
- Subtotal
- Estimated tax (simulate 0% or configurable rate)
- Total amount
- "Proceed to Checkout" button

Checkout modal/form:
1. Shipping/Billing info (simulate - no real shipping needed)
2. Payment method selection:
   - Credit Card (mock form)
   - PayPal (redirect simulation)
   - Crypto (Bitcoin/Ethereum option)
3. Review order summary
4. Confirm purchase button

On checkout:
- Call POST /api/v1/orders
- Show loading state during processing
- On success: redirect to order confirmation page
- Show digital keys received
- "Continue Shopping" button

Order confirmation page:
- Order ID and date
- List of purchased digital keys (with copy buttons)
- Download receipt option
- Link back to order history
```

---

### Prompt 3.7 — Authentication Pages
```
Create login and register pages:

pages/LoginPage.tsx:
- Email and password fields
- "Remember me" checkbox
- Login button
- Link to register page
- Error display for invalid credentials
- Redirect to previous page or home after success
- Store JWT token in localStorage

pages/RegisterPage.tsx:
- Username, email, password fields
- Password confirmation field
- Terms of service checkbox
- Register button
- Link to login page
- Validation: email format, password strength, username availability
- Success message with redirect to login

pages/ProfilePage.tsx (bonus):
- User information display
- Order history tab
- Settings tab
- Logout button

Use protected route wrapper for auth-required pages:
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" />
  return children
}
```

---

## Phase 4: UI/Styling — Eneba Style

### Prompt 4.1 — Global Styles
```
Create global styles in frontend/src/styles/global.css following Eneba design:

Eneba Design Guidelines:
- Orange primary color (#ff6b00) for CTAs and highlights
- Dark navy (#1a1a2e) for headers and footer
- Green (#4ade80) for prices and deals
- Clean white/light gray backgrounds
- Rounded corners (8px radius)
- Shadow elevation for cards
- Modern sans-serif font (Inter or similar from Google Fonts)

CSS Variables:
:root {
  --primary: #ff6b00;
  --primary-dark: #e55d00;
  --secondary: #1a1a2e;
  --accent: #4ade80;
  --bg-light: #f8f9fa;
  --text-dark: #1a1a2e;
  --text-muted: #6c757d;
  --border: #dee2e6;
  --radius: 8px;
  --shadow: 0 2px 8px rgba(0,0,0,0.1);
}

Components to style:
- Buttons (primary, secondary, outline variants)
- Input fields with focus states
- Cards with hover effects
- Badges (discount, new, sale)
- Navbar with sticky positioning
- Modal overlays
- Toast notifications
- Loading spinners and skeletons
- Empty states
- Pagination controls
- Star ratings display
```

---

### Prompt 4.2 — Product Card Component
```
Create reusable product card component at components/products/ProductCard.tsx:

Props interface:
interface ProductCardProps {
  product: Product;
  offer?: SellerOffer; // If showing specific seller offer
  showSeller?: boolean; // Whether to show seller info
}

Display:
- Product image (placeholder if missing)
- Product title (truncate after 2 lines)
- Category badge
- Price display:
  - Current price in large green text
  - Original price crossed out if discount exists
  - Discount percentage badge
- Rating stars (if available)
- Platform icon/badge
- "Add to Cart" quick action button

Hover effects:
- Lift animation
- Shadow increase
- Button reveal animation

Click behavior:
- Navigate to /products/:id
- Pass product ID in URL
```

---

## Phase 5: Advanced Features

### Prompt 5.1 — Search Functionality
```
Implement comprehensive search across the app:

Backend improvements:
- Add pg_trgm extension for fuzzy matching
- Create full-text search index on products
- Implement similarity search using trigram similarity
- Support phrase searching with wildcards

Frontend improvements:
- Global search in header (accessible from any page)
- Search suggestions dropdown as user types
- Highlight matching terms in results
- Search history (store last 5 searches locally)
- "Search results" page reusing ProductsPage with search param

Search logic:
1. Exact match first
2. Then partial matches
3. Then typo-tolerant (levenshtein distance <= 2)
4. Rank by relevance score

Query examples handled:
- "cyberpunk" → finds Cyberpunk 2077
- "cyperpunk" → still finds Cyberpunk 2077
- "witcher 3" → finds The Witcher 3
- "ps5 game" → filters by platform PS5 + category Games
```

---

### Prompt 5.2 — Wishlist Feature
```
Add wishlist functionality:

New database tables:
- wishlists: id, user_id, product_id, created_at (unique constraint on user+product)

API endpoints:
- GET /api/v1/wishlist - Get user's wishlist
- POST /api/v1/wishlist - Add product to wishlist
- DELETE /api/v1/wishlist/:product_id - Remove from wishlist

UI additions:
- Heart icon on product cards (fill/unfill)
- Wishlist page accessible from user menu
- "Notify me when price drops" option
- Move from wishlist to cart button

Integrate into existing product pages.
```

---

### Prompt 5.3 — Reviews & Ratings
```
Implement review system:

Database tables:
- reviews: id, user_id, product_id, rating (1-5), title, body, created_at, helpful_count

API endpoints:
- GET /api/v1/products/:id/reviews - Get reviews for product
- POST /api/v1/products/:id/reviews - Submit review (verified purchase only)
- PUT /api/v1/reviews/:id - Update own review
- DELETE /api/v1/reviews/:id - Delete own review
- POST /api/v1/reviews/:id/helpful - Mark review as helpful

UI components:
- Star rating widget (click to rate)
- Review form (title + body)
- Review list with pagination
- Helpful/not helpful voting
- Review verification badge ("Verified Purchase")

Calculate and cache average rating per product.
Update rating and review_count on products table when reviews change.
```

---

## Phase 6: Testing & Polish

### Prompt 6.1 — Error Handling & UX
```
Add comprehensive error handling throughout the app:

Global error boundary component wrapping all routes.

Toast notification system for:
- Success messages (added to cart, order placed)
- Error messages (something went wrong)
- Info messages (price drop alert)
- Warning messages (low stock)

Loading states:
- Skeleton screens for product grids
- Spinner for async operations
- Optimistic UI updates where appropriate

Form validation:
- Client-side validation with helpful error messages
- Real-time field validation
- Prevent duplicate submissions

Accessibility:
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Color contrast compliance
```

---

### Prompt 6.2 — Final Integration
```
Complete the integration between all parts:

1. Connect all frontend pages to backend APIs
2. Ensure authentication flow works end-to-end
3. Test cart → checkout → order flow completely
4. Verify search works across all pages
5. Test responsive design on mobile/tablet/desktop
6. Add sample data seeding script
7. Create admin endpoints for product management (bonus)
8. Add health check endpoint GET /health
9. Document API with OpenAPI/Swagger spec (bonus)

Run full test suite:
- Start backend and frontend dev servers
- Verify all routes respond correctly
- Test authentication scenarios
- Test cart and checkout flow
- Test search and filtering
- Check for console errors
```

---

## Submission Checklist

Ensure you have completed all deliverables:

- [ ] GitHub repository with full source code
- [ ] Deployed application on free-tier service (Render/Vercel/Heroku)
- [ ] Public URL where app is accessible
- [ ] Agent chat history log (this document + conversation logs)
- [ ] README with setup and demo instructions
- [ ] Ability to explain every part of the code

Deployment options:
- Backend: Render.com (free tier) or Railway.app
- Frontend: Vercel or Netlify
- Database: Supabase (free tier) or Neon.tech
```

---

## Conversation Log Template

Save your AI conversation logs to `docs/conversation-log.md`:

```markdown
# Eneba Marketplace - AI Conversation Log
## Assignment: Eneba Intern 2027

### Session 1: Project Setup
**Prompt:** [paste prompt here]
**Response:** [paste response summary]

### Session 2: Database Design
**Prompt:** [paste prompt here]
**Response:** [paste response summary]

... continue for all sessions ...
```

---

*Generated for Eneba Intern Assignment 2027*