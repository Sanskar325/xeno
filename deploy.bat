@echo off
echo 🚀 Starting deployment to Vercel...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if user is logged in to Vercel
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo 🔐 Please log in to Vercel:
    vercel login
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm run install:all

REM Build the application
echo 🔨 Building application...
call npm run build

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete!
echo 📝 Don't forget to:
echo    1. Set up environment variables in Vercel dashboard
echo    2. Run database migrations
echo    3. Test the deployed application
echo    4. Update Firebase authorized domains

pause

