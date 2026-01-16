@echo off
title Reset Admin Password - API Test Tool
color 0A
echo.
echo ============================================
echo   RESET ADMIN PASSWORD - API TEST TOOL
echo ============================================
echo.
echo Cong cu nay se mo trang web de xoa mat khau admin
echo.
echo Nhan phim bat ky de tiep tuc...
pause > nul

echo.
echo Dang mo trang reset mat khau...
start "" "reset-admin-password.html"

echo.
echo Da mo trang reset mat khau trong trinh duyet!
echo Ban co the dong cua so nay.
echo.
timeout /t 3 > nul
