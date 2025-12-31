@echo off
cd /d "%~dp0backend"
echo Starting RuraLens Backend Server...
echo.
node server.js
pause
