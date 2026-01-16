# MongoDB Atlas Connection Test Script
# PowerShell version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MongoDB Atlas Connection Diagnostic" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. DNS Resolution
Write-Host "1. Testing DNS Resolution..." -ForegroundColor Yellow
Write-Host "----------------------------------------"
try {
    $dns = Resolve-DnsName -Name "masterbe.xjftrtj.mongodb.net" -ErrorAction Stop
    Write-Host "✅ DNS Resolution: SUCCESS" -ForegroundColor Green
    $dns | Format-Table Name, Type, IPAddress
} catch {
    Write-Host "❌ DNS Resolution: FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
Write-Host ""

# 2. Network Connectivity
Write-Host "2. Testing Network Connectivity..." -ForegroundColor Yellow
Write-Host "----------------------------------------"
$ping = Test-Connection -ComputerName "masterbe.xjftrtj.mongodb.net" -Count 4 -Quiet
if ($ping) {
    Write-Host "✅ Ping: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "❌ Ping: FAILED" -ForegroundColor Red
}
Write-Host ""

# 3. MongoDB Port Test
Write-Host "3. Testing MongoDB Port 27017..." -ForegroundColor Yellow
Write-Host "----------------------------------------"
$port = Test-NetConnection -ComputerName "masterbe.xjftrtj.mongodb.net" -Port 27017 -WarningAction SilentlyContinue
if ($port.TcpTestSucceeded) {
    Write-Host "✅ Port 27017: OPEN" -ForegroundColor Green
} else {
    Write-Host "❌ Port 27017: BLOCKED" -ForegroundColor Red
    Write-Host "   This usually means IP is not whitelisted in MongoDB Atlas" -ForegroundColor Yellow
}
Write-Host ""

# 4. Get Public IP
Write-Host "4. Your Public IP Address..." -ForegroundColor Yellow
Write-Host "----------------------------------------"
$publicIP = "unknown"
try {
    $publicIP = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing -ErrorAction Stop).Content
    Write-Host "📍 Your IP: $publicIP" -ForegroundColor Cyan
    Write-Host "   Add this IP to MongoDB Atlas Network Access" -ForegroundColor Yellow
} catch {
    Write-Host "⚠️  Could not get public IP" -ForegroundColor Yellow
}
Write-Host ""

# 5. Node.js Version
Write-Host "5. Node.js Version..." -ForegroundColor Yellow
Write-Host "----------------------------------------"
$nodeVersion = node --version
Write-Host "Node.js: $nodeVersion" -ForegroundColor Cyan
Write-Host ""

# 6. MongoDB Driver Version
Write-Host "6. MongoDB Driver Version..." -ForegroundColor Yellow
Write-Host "----------------------------------------"
Push-Location -Path "api"
$mongoVersion = npm list mongodb 2>$null | Select-String "mongodb@"
if ($mongoVersion) {
    Write-Host $mongoVersion -ForegroundColor Cyan
} else {
    Write-Host "MongoDB driver not found or not installed" -ForegroundColor Red
}
Pop-Location
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Diagnostic Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (!$ping -or !$port.TcpTestSucceeded) {
    Write-Host "⚠️  ISSUES DETECTED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Common Solutions:" -ForegroundColor Yellow
    Write-Host "1. Whitelist your IP in MongoDB Atlas:" -ForegroundColor White
    Write-Host "   → https://cloud.mongodb.com/" -ForegroundColor Gray
    Write-Host "   → Network Access → Add IP Address" -ForegroundColor Gray
    Write-Host "   → Add: $publicIP or 0.0.0.0/0 (all IPs)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Check if cluster is paused:" -ForegroundColor White
    Write-Host "   → MongoDB Atlas → Clusters" -ForegroundColor Gray
    Write-Host "   → Resume cluster if paused" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Check firewall/antivirus settings" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Try VPN if on restricted network" -ForegroundColor White
} else {
    Write-Host "✅ All network tests passed!" -ForegroundColor Green
    Write-Host "   Connection issues may be due to:" -ForegroundColor Yellow
    Write-Host "   • Wrong username/password" -ForegroundColor White
    Write-Host "   • Database user permissions" -ForegroundColor White
    Write-Host "   • SSL/TLS configuration" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
