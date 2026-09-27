@echo off
title Dxign WhatsApp Bot - Auto-Reply ^& 24h Follow-up
color 0A
set "PATH=C:\Program Files\nodejs;%PATH%"

echo ========================================================
echo   DXIGN WHATSAPP SMART AUTO-REPLY ^& 24H FOLLOW-UP BOT
echo   Connected Line: +91 7356413558
echo ========================================================
echo.
echo Starting WhatsApp Bot...
echo If this is your first time, a QR CODE will appear below.
echo Open WhatsApp on your phone (+91 7356413558):
echo Settings ^> Linked Devices ^> Link a Device ^> Scan QR Code
echo ========================================================
echo.

node whatsapp-bridge.js

pause
