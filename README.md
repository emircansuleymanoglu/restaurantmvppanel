# Restaurant Digital Signage MVP

A multi-tenant real-time digital signage system for restaurants. Manage TV menus from an admin panel — price changes and layout updates broadcast instantly to all connected TV screens via WebSocket.

## Architecture

```
monorepo/
├── apps/
│   ├── api/        NestJS REST API + WebSocket gateway (port 3001)
│   ├── admin/      Next.js admin panel (port 3000)
│   └── tv/         Next.js TV screen client (port 3002)
├── docker-compose.yml
└── README.md
```

**Stack:** Next.js · NestJS · PostgreSQL · Redis · Socket.io · TailwindCSS · dnd-kit

## Quick Start (Local)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ running locally
- Redis running locally

### 1. Clone & Install

```bash
git clone git@github.com:emircansuleymanoglu/restaurantmvppanel.git
cd restaurantmvppanel
npm install
```

### 2. Configure Environment

```bash
# API
cp apps/api/.env.example apps/api/.env
# Edit DATABASE_URL, JWT_SECRET, REDIS_URL as needed

# Admin
cp apps/admin/.env.local.example apps/admin/.env.local

# TV
cp apps/tv/.env.local.example apps/tv/.env.local
```

### 3. Seed Database

```bash
cd apps/api
npm install
npm run seed
```

This creates:
- Demo restaurant: **Demo Burger House**
- Admin user: `admin@demo.com` / `admin123`
- 8 sample products with images
- Default layout

### 4. Run All Apps

```bash
# From monorepo root
npm run dev
```

Or individually:
```bash
npm run dev:api    # http://localhost:3001
npm run dev:admin  # http://localhost:3000
npm run dev:tv     # http://localhost:3002
```

## Quick Start (Docker)

```bash
cp .env.example .env
docker-compose up -d
# Wait ~10s for services to be ready, then seed:
docker-compose exec api npm run seed
```

## Usage

1. Open admin panel: http://localhost:3000
2. Login with `admin@demo.com` / `admin123`
3. Go to **Products** → edit any price → click Save
4. Open TV screen: http://localhost:3002?restaurantId=YOUR_RESTAURANT_ID
   - The restaurant ID is shown on the Overview dashboard
5. Watch the TV screen update **instantly**

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Login, returns JWT + restaurantId |
| GET | `/api/products` | JWT | List products for authenticated restaurant |
| POST | `/api/products` | JWT | Create product |
| PUT | `/api/products/:id` | JWT | Update product (triggers WS broadcast) |
| DELETE | `/api/products/:id` | JWT | Soft-delete product |
| GET | `/api/layout` | JWT | Get layout JSON |
| POST | `/api/layout` | JWT | Save layout JSON (triggers WS broadcast) |
| GET | `/api/public/:restaurantId/products` | — | Public product list for TV |
| GET | `/api/public/:restaurantId/layout` | — | Public layout for TV |

## WebSocket Events

```
Client → Server:  emit('subscribe', { restaurantId })
Server → Client:  emit('restaurant_{id}_update', { type, data })

Types: product_created | product_updated | product_deleted | layout_updated
```

## Multi-Tenant

Each restaurant has isolated data via `restaurant_id` foreign keys. JWT tokens encode `restaurantId` — all authenticated API calls are automatically scoped to the authenticated restaurant. No cross-tenant data leakage.
