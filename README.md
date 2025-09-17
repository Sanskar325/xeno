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

I’m adding these photos because I realized my backend code is breaking, which caused the backend deployment to fail.

Shopify Dashboard Page
<img width="1477" height="646" alt="image" src="https://github.com/user-attachments/assets/b4126c86-ebe6-4bfd-aa5a-d74d2f171ef8" />
<img width="1441" height="769" alt="image" src="https://github.com/user-attachments/assets/f64bc8c4-4375-4664-9c43-5b94860f61c6" />
<img width="1450" height="772" alt="image" src="https://github.com/user-attachments/assets/bbc625db-781a-4d59-a1ac-ef0302d9ffb5" />
<img width="1905" height="864" alt="image" src="https://github.com/user-attachments/assets/156a2722-dd6c-44b3-8e1d-cddb204640ed" />
My Website page 
<img width="1896" height="864" alt="image" src="https://github.com/user-attachments/assets/5152a082-211c-4355-9046-9b4219955124" />
<img width="1908" height="851" alt="image" src="https://github.com/user-attachments/assets/eb4da115-214c-478b-95fe-5fe121430ff0" />
<img width="1906" height="738" alt="image" src="https://github.com/user-attachments/assets/7cce9bba-0534-4c86-a752-5bbe70e33793" />
<img width="1855" height="867" alt="image" src="https://github.com/user-attachments/assets/ca88546c-8dea-4be3-96d3-ed812a16e9e8" />
<img width="1912" height="786" alt="image" src="https://github.com/user-attachments/assets/0c361a22-ece8-41ae-a7c6-54226983d271" />
<img width="1896" height="861" alt="image" src="https://github.com/user-attachments/assets/7db1cc6b-df88-4fa7-a5c8-7e3fb3ef9506" />
<img width="1384" height="808" alt="image" src="https://github.com/user-attachments/assets/4fadf2c8-4973-49d1-9a1f-5df5b03dac83" />








