# NEXUS — Premium Full-Stack E-Commerce Platform

A production-ready, premium e-commerce product catalog built with React, TypeScript, Express, Prisma, and SQLite (PostgreSQL-ready). Features a futuristic UI with 3D effects, animations, glassmorphism, dark/light mode, and a full admin dashboard.

## Features

### Customer-Facing
- **Product Discovery** — Search, filter by category/price/rating, sort, pagination
- **Product Detail** — Image gallery, specifications, reviews, related products
- **Shopping Cart** — Slide-in drawer, quantity controls, real-time totals
- **Multi-Step Checkout** — Shipping, review, payment, order confirmation
- **Wishlist** — Add/remove products, animated heart interactions
- **Authentication** — Register, login, JWT-based session, profile management
- **Order History** — View past orders with status tracking
- **Product Reviews** — Rate and comment on products

### Admin Dashboard
- **Analytics Overview** — Revenue, orders, customers, products with animated charts
- **Product Management** — Full CRUD with image URLs, categories, stock, featured toggle
- **Order Management** — View all orders, update status, expand for details
- **User Management** — View all users with roles
- **Category Management** — CRUD operations with product counts

### UI/UX
- **3D Hero Scene** — React Three Fiber floating product visualization
- **Glassmorphism** — Frosted glass cards and navigation
- **Dark/Light Mode** — System preference detection, persistent toggle
- **Framer Motion** — Page transitions, scroll animations, hover effects, toasts
- **Responsive Design** — Mobile-first, works on all screen sizes
- **Accessibility** — Keyboard navigation, ARIA labels, reduced-motion support
- **Custom Design System** — Consistent colors, typography, spacing, shadows

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Animation | Framer Motion |
| 3D | Three.js, React Three Fiber, Drei |
| Icons | Lucide React |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (Prisma ORM, PostgreSQL-ready) |
| Auth | JWT (bcrypt password hashing) |
| Validation | Express Validator |

## Architecture

```
ecommerce/
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI, layout, product, cart, admin, 3D
│   │   ├── pages/         # Route pages + admin pages
│   │   ├── layouts/       # MainLayout, AdminLayout
│   │   ├── context/       # Auth, Cart, Wishlist, Theme, Toast
│   │   ├── hooks/         # useDebounce, useIntersection, useScrollToTop
│   │   ├── services/      # (API client in utils/api.ts)
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # API client, helpers
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # (routes handle logic directly)
│   │   ├── routes/        # auth, products, categories, cart, orders, reviews, wishlist, admin
│   │   ├── middleware/     # auth, errorHandler, validate
│   │   ├── utils/         # prisma client, JWT helpers
│   │   ├── index.ts       # Server entry point
│   │   └── seed.ts        # Database seeder
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
├── .gitignore
├── .env.example
├── package.json           # Root scripts
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Setup

```bash
cd ecommerce
npm run setup
```

This will:
1. Install server dependencies
2. Generate Prisma client
3. Run database migrations
4. Seed sample data
5. Install client dependencies

### Development

```bash
npm run dev
```

This starts both:
- **Server** at `http://localhost:3001`
- **Client** at `http://localhost:5173`

### Manual Setup

```bash
# Server
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npx tsx src/seed.ts

# Client
cd ../client
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `server/.env`:

```bash
cp .env.example server/.env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `JWT_SECRET` | Secret for JWT tokens | (required) |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `PORT` | Server port | `3001` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| User | john@example.com | password123 |
| User | jane@example.com | password123 |

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user
- `PUT /api/auth/me` — Update profile

### Products
- `GET /api/products` — List (with search, filter, sort, pagination)
- `GET /api/products/featured` — Featured products
- `GET /api/products/:id` — Product detail
- `POST /api/products` — Create (admin)
- `PUT /api/products/:id` — Update (admin)
- `DELETE /api/products/:id` — Delete (admin)

### Categories
- `GET /api/categories` — List all
- `GET /api/categories/:slug` — By slug
- `POST /api/categories` — Create (admin)
- `PUT /api/categories/:id` — Update (admin)
- `DELETE /api/categories/:id` — Delete (admin)

### Cart (authenticated)
- `GET /api/cart` — Get cart
- `POST /api/cart` — Add item
- `PUT /api/cart/:id` — Update quantity
- `DELETE /api/cart/:id` — Remove item
- `DELETE /api/cart` — Clear cart

### Orders (authenticated)
- `GET /api/orders` — List orders
- `GET /api/orders/:id` — Order detail
- `POST /api/orders` — Place order
- `PUT /api/orders/:id/status` — Update status (admin)

### Reviews
- `GET /api/reviews/product/:productId` — Product reviews
- `POST /api/reviews` — Create review (authenticated)
- `DELETE /api/reviews/:id` — Delete review (owner)

### Wishlist (authenticated)
- `GET /api/wishlist` — Get wishlist
- `POST /api/wishlist` — Add item
- `DELETE /api/wishlist/:productId` — Remove item

### Admin
- `GET /api/admin/stats` — Dashboard statistics
- `GET /api/admin/users` — All users

## Database Schema

8 models: User, Category, Product, Cart, CartItem, Order, OrderItem, Review, WishlistItem

Switch to PostgreSQL for production:
1. Install PostgreSQL
2. Update `DATABASE_URL` in `.env`
3. Change provider in `prisma/schema.prisma` from `sqlite` to `postgresql`
4. Run `npx prisma migrate dev`

## Production Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the dist/ folder
```

### Backend (Render/Railway)
```bash
cd server
npm run build
# Deploy with start: node dist/index.js
# Run migrations: npx prisma migrate deploy
```

### Database
- Use a managed PostgreSQL provider (Neon, Supabase, Railway)
- Update `DATABASE_URL` environment variable

## License

MIT
