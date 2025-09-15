# Clean Next.js cache and start development server
Write-Host "Cleaning Next.js cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "Starting development server..." -ForegroundColor Green
npm run dev