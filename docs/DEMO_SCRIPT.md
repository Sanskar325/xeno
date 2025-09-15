# Demo Video Script (7 minutes)

## Introduction (30 seconds)

**[Screen: Project overview slide]**

"Hi! I'm going to demonstrate a multi-tenant Shopify Data Ingestion and Insights Service I built for a Forward Deployed Engineer internship assignment. This is a complete full-stack application that allows businesses to sync their Shopify store data and gain valuable insights through interactive dashboards."

**[Screen: Architecture diagram]**

"The system uses Next.js for the frontend, Express.js with Prisma for the backend, PostgreSQL for data storage, and Firebase for authentication - all deployed on Railway and Vercel."

## Authentication Demo (1 minute)

**[Screen: Login page]**

"Let's start by creating an account. The application uses Firebase Authentication with email and password."

**[Action: Register new account]**
- Enter email: demo@example.com
- Enter password: demo123456
- Click "Sign up"

"Firebase handles the authentication securely, and our backend automatically creates a tenant record for multi-tenancy support."

**[Screen: Dashboard loads]**

"Once authenticated, users are redirected to the main dashboard. Notice the clean, professional interface built with Tailwind CSS."

## Data Sync Demo (2 minutes)

**[Screen: Dashboard sync form]**

"The core feature is syncing Shopify store data. In a production environment, this would connect to the actual Shopify API using store credentials. For this demo, I've implemented a mock data generator that creates realistic sample data."

**[Action: Sync data]**
- Enter store URL: "demo-store.myshopify.com"
- Click "Sync Data"
- Show loading state

"The sync process ingests customers, products, and orders. The backend processes this data and stores it in our multi-tenant PostgreSQL database using Prisma ORM."

**[Screen: Sync completion]**

"Great! We've successfully synced 50 customers, 30 products, and 100 orders. The data is now available for analysis."

## Dashboard Analytics (2.5 minutes)

**[Screen: Metrics cards]**

"The dashboard immediately shows key business metrics. We can see total customers, revenue, and order count at a glance. These metrics are calculated in real-time from our database."

**[Screen: Orders chart]**

"This interactive chart shows orders and revenue over time using Chart.js. It displays both order volume and revenue trends, helping businesses understand their performance patterns."

**[Action: Hover over chart points]**

"The chart is fully interactive - you can see specific values for each date point."

**[Screen: Top customers table]**

"Below, we have the top 5 customers by total spend. This helps businesses identify their most valuable customers for targeted marketing and retention efforts."

**[Action: Scroll through customer list]**

"Each customer shows their total spend and order count, providing immediate insights into customer value."

## Technical Architecture (1.5 minutes)

**[Screen: Code editor - backend structure]**

"Let me show you the technical implementation. The backend is built with Express.js and follows a clean architecture pattern."

**[Action: Show key files]**
- Routes for authentication, sync, and metrics
- Middleware for JWT verification
- Services for business logic
- Prisma schema for database modeling

**[Screen: Database schema]**

"The database uses a multi-tenant design where each tenant can have multiple stores, and all data is properly isolated. This ensures scalability and data security."

**[Screen: Frontend code]**

"The frontend uses Next.js with React hooks for state management, protected routes for security, and reusable components for maintainability."

## Multi-Tenancy Demo (30 seconds)

**[Action: Log out and create second account]**

"Let me demonstrate the multi-tenant capability by creating a second account."

**[Action: Quick registration with different email]**

"Notice that this new user has a completely clean dashboard - they can't see the previous user's data. This demonstrates proper tenant isolation."

## Deployment and Scalability (30 seconds)

**[Screen: Deployment documentation]**

"The application is designed for production deployment. The backend deploys to Railway with automatic database migrations, while the frontend deploys to Vercel with optimized builds and CDN distribution."

**[Screen: Environment variables example]**

"All configuration is handled through environment variables, making it easy to deploy across different environments."

## Conclusion (30 seconds)

**[Screen: Feature summary]**

"To summarize, I've built a complete multi-tenant SaaS application with:
- Secure Firebase authentication
- Real-time data synchronization
- Interactive analytics dashboard  
- Multi-tenant architecture
- Production-ready deployment

The application demonstrates full-stack development skills, modern web technologies, and enterprise-level architecture patterns."

**[Screen: GitHub repository]**

"All code is available on GitHub with comprehensive documentation, setup instructions, and deployment guides. Thank you for watching!"

---

## Demo Preparation Checklist

### Before Recording:
- [ ] Clear browser cache and cookies
- [ ] Prepare demo email accounts
- [ ] Ensure backend is running locally
- [ ] Verify all features work correctly
- [ ] Prepare slides for architecture overview
- [ ] Test screen recording software
- [ ] Close unnecessary applications

### Demo Data:
- [ ] Reset database to clean state
- [ ] Prepare consistent demo store URLs
- [ ] Verify mock data generation works
- [ ] Test all chart interactions

### Backup Plans:
- [ ] Have screenshots ready if live demo fails
- [ ] Prepare recorded segments for complex operations
- [ ] Have alternative demo accounts ready
- [ ] Keep deployment URLs handy

### Post-Demo:
- [ ] Upload to appropriate platform
- [ ] Add captions/subtitles
- [ ] Include relevant links in description
- [ ] Share with stakeholders