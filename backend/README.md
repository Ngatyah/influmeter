# 🧠 Influmeter Backend

Modern NestJS backend for the Influmeter influencer marketing platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Setup
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run prisma:migrate
npm run prisma:generate

# Seed initial data
npm run seed

# Start development server
npm run start:dev
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/oauth/google` - Google OAuth
- `POST /api/auth/refresh-token` - Refresh JWT token

### Onboarding
- `POST /api/onboarding/influencer/personal` - Step 1: Personal info
- `POST /api/onboarding/influencer/categories` - Step 2: Categories
- `POST /api/onboarding/influencer/social` - Step 3: Social accounts
- `POST /api/onboarding/influencer/rates` - Step 4: Rates & preferences

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign details
- `GET /api/campaigns/:campaignId/influencer/:influencerId` - Influencer content & payments

### Payments
- `POST /api/payments/process` - Process payment
- `POST /api/payments/bulk` - Bulk payments
- `PUT /api/content/:id/mark-completed` - Mark content completed

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `WS /api/notifications/live` - Real-time notifications

## 🔧 Development

```bash
# Watch mode
npm run start:dev

# Build
npm run build

# Tests
npm run test
npm run test:e2e

# Database
npm run prisma:studio  # Database GUI
npm run prisma:migrate # Apply migrations
```

## 📚 Documentation

- API Docs: http://localhost:3001/api/docs
- Database Schema: `prisma/schema.prisma`
- Architecture: `../Theme/Docs/Backend_architecture.md`

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma
- **Cache**: Redis
- **Queue**: BullMQ
- **Auth**: JWT + Passport
- **Files**: Cloudinary
- **Payments**: Stripe + M-Pesa
- **WebSocket**: Socket.io
- **Docs**: Swagger/OpenAPI
