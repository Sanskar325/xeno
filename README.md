# Shopify Data Ingestion and Insights Service

A multi-tenant service for ingesting Shopify store data and providing business insights through interactive dashboards.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Express.js    │    │   PostgreSQL    │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│                 │    │                 │    │                 │
│ - Dashboard     │    │ - Auth Routes   │    │ - Multi-tenant  │
│ - Charts        │    │ - Data Sync     │    │ - Shopify Data  │
│ - Firebase Auth │    │ - Metrics API   │    │ - Prisma ORM    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────►│   Firebase      │
                        │   Auth          │
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Firebase project
- Shopify development store

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npx prisma migrate dev
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Configure your Firebase config
npm run dev
```

## 📊 Features

- **Multi-tenant Architecture**: Support multiple Shopify stores
- **Real-time Data Sync**: Ingest customers, products, orders
- **Interactive Dashboard**: Revenue metrics, customer insights
- **Secure Authentication**: Firebase-based auth with JWT verification
- **Data Visualization**: Charts for orders, revenue, top customers

## 🔧 Tech Stack

- **Backend**: Node.js, Express.js, Prisma, PostgreSQL
- **Frontend**: Next.js, Chart.js, Tailwind CSS
- **Auth**: Firebase Authentication
- **Deployment**: Railway (backend), Vercel (frontend)

## 📋 API Endpoints

- `POST /api/auth/verify` - Verify Firebase token
- `POST /api/sync-data` - Sync Shopify data
- `GET /api/metrics` - Get dashboard metrics

## 🏪 Database Schema

Multi-tenant design with:
- Tenants (organizations)
- Stores (Shopify stores per tenant)
- Customers, Products, Orders (scoped to stores)

## 🚀 Deployment

### Backend (Railway)
1. Connect GitHub repo to Railway
2. Set environment variables
3. Deploy automatically

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set environment variables
3. Deploy automatically

## �  Project Structure

```
shopify-insights-service/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── config/         # Database and Firebase config
│   │   ├── middleware/     # Authentication middleware
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   └── server.js       # Main server file
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── frontend/               # Next.js React application
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React context providers
│   ├── lib/               # Utility libraries
│   ├── pages/             # Next.js pages
│   ├── styles/            # CSS styles
│   └── package.json
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md    # System architecture
│   ├── API.md            # API documentation
│   ├── SETUP.md          # Setup instructions
│   └── DEMO_SCRIPT.md    # Demo video script
└── README.md
```

## 📝 Assumptions

- Development Shopify stores have dummy data
- Single tenant per user for simplicity
- Basic error handling and validation
- Mock Shopify API responses for demo
- Firebase project configured for authentication
- PostgreSQL database available for development