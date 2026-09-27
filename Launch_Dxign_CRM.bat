@echo off
title Dxign CRM - Localhost Server
echo ===================================================
echo   Dxign CRM (Minimal ^& Modern Omnichannel CRM)
echo   100%% Free Plan • WhatsApp ^& Instagram Connected
echo   Local Server: http://localhost:5000/
echo ===================================================
echo.

:: Start server in background if not already listening
netstat -ano | findstr :5000 >nul
if %errorlevel% neq 0 (
    echo Starting native background HTTP server on port 5000...
    start /b powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Port 5000
    timeout /t 1 >nul
)

:: Open the browser to localhost:5000
echo Opening http://localhost:5000/ in your browser...
start http://localhost:5000/

echo.
echo Server is running at: http://localhost:5000/
echo Keep this window open or close it when done.
pause
