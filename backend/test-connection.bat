@echo off
echo ========================================
echo MongoDB Atlas Connection Diagnostic
echo ========================================
echo.

echo 1. Testing DNS Resolution...
echo ----------------------------------------
nslookup masterbe.xjftrtj.mongodb.net
echo.

echo 2. Testing Network Connectivity...
echo ----------------------------------------
ping -n 4 masterbe.xjftrtj.mongodb.net
echo.

echo 3. Testing Port 27017 (MongoDB)...
echo ----------------------------------------
powershell -Command "Test-NetConnection -ComputerName masterbe.xjftrtj.mongodb.net -Port 27017"
echo.

echo 4. Checking Node.js Version...
echo ----------------------------------------
node --version
echo.

echo 5. Checking MongoDB Driver Version...
echo ----------------------------------------
cd api
npm list mongodb
cd ..
echo.

echo ========================================
echo Diagnostic Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. If DNS fails: Check internet connection
echo 2. If ping fails: Check firewall/VPN
echo 3. If port test fails: MongoDB Atlas may be blocking your IP
echo    - Go to https://cloud.mongodb.com
echo    - Network Access ^> Add IP Address ^> 0.0.0.0/0
echo.
pause
