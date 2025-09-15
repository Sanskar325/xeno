# Setup Instructions

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Firebase project
- Git

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd shopify-insights-service
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Environment Configuration

Copy the environment template:
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/shopify_insights"
PORT=3001

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

#### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npm run db:seed
```

#### Start Backend Server

```bash
npm run dev
```

The backend will be available at `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

#### Environment Configuration

Copy the environment template:
```bash
cp .env.local.example .env.local
```

Configure your `.env.local` file:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Start Frontend Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Email/Password

### 2. Get Configuration

#### Frontend Configuration
1. Go to Project Settings > General
2. Scroll to "Your apps" section
3. Add a web app
4. Copy the configuration object

#### Backend Configuration
1. Go to Project Settings > Service Accounts
2. Generate new private key
3. Download the JSON file
4. Extract the required fields for your `.env` file

## Database Setup

### PostgreSQL Installation

#### macOS (Homebrew)
```bash
brew install postgresql
brew services start postgresql
createdb shopify_insights
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb shopify_insights
```

#### Windows
1. Download PostgreSQL from official website
2. Install and start the service
3. Create database using pgAdmin or command line

### Database Configuration

Update your `DATABASE_URL` in the backend `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/shopify_insights"
```

## Production Deployment

### Backend Deployment (Railway)

1. Create account at [Railway](https://railway.app/)
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy automatically on push

#### Required Environment Variables:
- `DATABASE_URL` (Railway will provide PostgreSQL)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `PORT` (Railway will set automatically)

### Frontend Deployment (Vercel)

1. Create account at [Vercel](https://vercel.com/)
2. Connect your GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

#### Required Environment Variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_API_URL` (Your Railway backend URL)

## Testing the Application

### 1. Create Test Account

1. Navigate to `http://localhost:3000`
2. Click "Sign up"
3. Enter email and password
4. Verify account creation

### 2. Sync Demo Data

1. On the dashboard, enter a store URL (e.g., "demo-store.myshopify.com")
2. Click "Sync Data"
3. Wait for sync completion
4. Verify data appears in dashboard

### 3. Verify Features

- [ ] Authentication works
- [ ] Data sync completes successfully
- [ ] Metrics cards show correct data
- [ ] Charts render properly
- [ ] Top customers table displays
- [ ] Logout functionality works

## Troubleshooting

### Common Issues

#### Backend won't start
- Check PostgreSQL is running
- Verify database connection string
- Ensure all environment variables are set
- Check Firebase service account configuration

#### Frontend won't start
- Verify Node.js version (18+)
- Check Firebase configuration
- Ensure API URL is correct
- Clear npm cache: `npm cache clean --force`

#### Authentication fails
- Verify Firebase project configuration
- Check API URL in frontend environment
- Ensure backend can reach Firebase
- Verify service account permissions

#### Database connection issues
- Check PostgreSQL service status
- Verify database exists
- Test connection string manually
- Check firewall settings

### Logs and Debugging

#### Backend Logs
```bash
cd backend
npm run dev
# Check console output for errors
```

#### Frontend Logs
```bash
cd frontend
npm run dev
# Check browser console for errors
```

#### Database Logs
```bash
# Check Prisma queries
cd backend
npx prisma studio
```

## Development Workflow

### Making Changes

1. Create feature branch
2. Make changes
3. Test locally
4. Commit and push
5. Deploy automatically

### Database Changes

1. Modify `prisma/schema.prisma`
2. Generate migration: `npx prisma migrate dev`
3. Update seed file if needed
4. Test migration locally

### Adding New Features

1. Update backend routes/services
2. Update frontend components
3. Update documentation
4. Add tests (future enhancement)

## Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Check Firebase/Railway/Vercel status pages
4. Create GitHub issue with de