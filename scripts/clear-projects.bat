@echo off
title Clear MongoDB Projects - API Test Tool
color 0C
echo.
echo ============================================
echo   XOA TAT CA DU AN TRONG MONGODB
echo ============================================
echo.
echo CANH BAO: Hanh dong nay se xoa tat ca du an!
echo.
set /p confirm="Ban co chac chan muon xoa? (Y/N): "

if /i "%confirm%" NEQ "Y" (
    echo.
    echo Da huy thao tac.
    timeout /t 2 > nul
    exit
)

echo.
echo Dang ket noi MongoDB va xoa du an...
cd api
node clear-projects.js

echo.
echo ============================================
echo   HOAN TAT!
echo ============================================
echo.
echo Vui long reload trang web de tao 15 du an mau moi!
echo.
pause
