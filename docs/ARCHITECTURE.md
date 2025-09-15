# Architecture Documentation

## System Overview

The Shopify Data Ingestion and Insights Service is a multi-tenant SaaS application that allows businesses to sync their Shopify store data and gain insights through interactive dashboards.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Login Page    │  │   Dashboard     │  │   Components    │ │
│  │                 │  │                 │  │                 │ │
│  │ - Firebase Auth │  │ - Metrics Cards │  │ - Charts        │ │
│  │ - Email/Pass    │  │ - Data Sync     │  │ - Tables        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS/API Calls
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Express.js)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Auth Routes   │  │   Sync Routes   │  │  Metrics Routes │ │
│  │                 │  │                 │  │                 │ │
│  │ - Token Verify  │  │ - Shopify API   │  │ - Aggregations  │ │
│  │ - Middleware    │  │ - Data Ingest   │  │ - Analytics     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Database Queries
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │    Tenants      │  │     Stores      │  │   Shopify Data  │ │
│  │                 │  │                 │  │                 │ │
│  │ - Multi-tenant  │  │ - Store Config  │  │ - Customers     │ │
│  │ - User Mapping  │  │ - Access Tokens │  │ - Products      │ │
│  │                 │  │                 │  │ - Orders        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Authentication
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Firebase Auth                             │
│                                                                 │
│ - User Management                                               │
│ - JWT Token Generation                                          │
│ - Email/Password Authentication                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend (Next.js)

#### Pages
- `/login` - Authentication page with Firebase
- `/dashboard` - Main analytics dashboard
- `/` - Root redirect based on auth state

#### Components
- `Layout` - Navigation and user management
- `ProtectedRoute` - Route guard for authenticated users
- `MetricsCard` - Reusable metric display component
- `OrdersChart` - Line chart for orders and revenue
- `TopCustomers` - Customer ranking table

#### Context
- `AuthContext` - Global authentication state management

#### Services
- `api.js` - Axios configuration with auth interceptors
- `firebase.js` - Firebase client configuration

### Backend (Express.js)

#### Routes
- `/api/auth/verify` - Token verification endpoint
- `/api/sync-data` - Shopify data synchronization
- `/api/metrics` - Dashboard analytics data

#### Middleware
- `auth.js` - JWT token verification and user context
- Security middleware (helmet, cors, rate limiting)

#### Services
- `shopifyService.js` - Shopify API integration and data processing
- `metricsService.js` - Analytics calculations and aggregations

#### Configuration
- `firebase.js` - Firebase Admin SDK setup
- `database.js` - Prisma client configuration

### Database (PostgreSQL + Prisma)

#### Multi-Tenant Design
```sql
Tenant (1) -> (N) Store (1) -> (N) Customer/Product/Order
```

#### Key Tables
- `tenants` - Organization/user isolation
- `stores` - Shopify store configurations
- `customers` - Customer data with spend tracking
- `products` - Product catalog
- `orders` - Order history with line items
- `order_items` - Order line item details

## Data Flow

### Authentication Flow
1. User enters credentials on login page
2. Firebase authenticates and returns JWT token
3. Frontend stores token and includes in API requests
4. Backend verifies token with Firebase Admin SDK
5. Backend creates/finds tenant record for user
6. User context attached to all subsequent requests

### Data Sync Flow
1. User enters Shopify store URL on dashboard
2. Frontend calls `/api/sync-data` with store details
3. Backend creates/updates store record
4. Mock Shopify data generated (in production: API calls)
5. Data processed and stored with tenant/store isolation
6. Sync statistics returned to frontend
7. Dashboard refreshes with new data

### Metrics Flow
1. Dashboard requests metrics via `/api/metrics`
2. Backend queries database with tenant filtering
3. Aggregations calculated (revenue, top customers, etc.)
4. Time-series data formatted for charts
5. Structured response returned to frontend
6. Charts and cards updated with new data

## Security Considerations

### Authentication
- Firebase JWT tokens for stateless authentication
- Token verification on every API request
- Automatic token refresh handled by Firebase SDK

### Multi-Tenancy
- All database queries filtered by tenant ID
- Row-level security through application logic
- No cross-tenant data access possible

### API Security
- CORS configuration for frontend domain
- Rate limiting to prevent abuse
- Helmet.js for security headers
- Input validation and sanitization

## Scalability Considerations

### Database
- Indexed foreign keys for performance
- Tenant-based partitioning potential
- Connection pooling via Prisma

### Backend
- Stateless design for horizontal scaling
- Async processing for data sync operations
- Caching opportunities for metrics

### Frontend
- Static generation where possible
- Code splitting for optimal loading
- CDN deployment via Vercel

## Deployment Architecture

### Production Environment
```
Internet -> Vercel (Frontend) -> Railway (Backend) -> PostgreSQL
                              -> Firebase Auth
```

### Environment Variables
- Frontend: Firebase config, API URL
- Backend: Database URL, Firebase service account
- Secrets managed by deployment platforms

## Monitoring and Observability

### Logging
- Structured logging in backend services
- Error tracking and alerting
- Performance monitoring

### Metrics
- API response times
- Database query performance
- User engagement analytics

## Future Enhancements

### Technical
- Real-time data sync with webhooks
- Advanced caching layer (Redis)
- Background job processing
- API rate limiting per tenant

### Features
- Advanced analytics and reporting
- Custom dashboard configurations
- Data export capabilities
- Multi-store management per tenant