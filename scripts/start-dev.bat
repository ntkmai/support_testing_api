@echo off
cd /d "%~dp0.."
echo ========================================
echo   Stopping Previous Servers
echo ========================================
echo.
echo Killing existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo Done.
echo.
echo ========================================
echo   Starting All Servers (DEV MODE)
echo ========================================
echo.
echo [1] Starting Backend API Server (with auto-reload)...
start "Backend API" cmd /k "cd /d "%~dp0..\backend" && npm run dev"
timeout /t 2 /nobreak >nul

echo [2] Starting Frontend Static Server (with auto-reload)...
start "Frontend Static" cmd /k "cd /d "%~dp0.." && npm run dev"

echo.
echo ========================================
echo   All Servers Started! (DEV MODE)
echo ========================================
echo.
echo Backend API:  http://localhost:3939
echo Frontend:     http://localhost:8888
echo.
echo Auto-reload: Enabled
echo - Backend: Changes in backend/ will auto-restart
echo - Frontend: Refresh browser to see changes
echo.
echo Press any key to stop all servers...
pause >nul

echo.
echo Stopping servers...
taskkill /FI "WINDOWTITLE eq Backend API*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend Static*" /T /F >nul 2>&1
echo All servers stopped.
