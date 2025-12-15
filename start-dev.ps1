Write-Host "Starting dev server with cache disabled..." -ForegroundColor Green
npx http-server -p 8000 -c-1 --cors
