@echo off
echo ========================================
echo  RuraLens Backend Server Restart
echo ========================================
echo.

echo [1/3] Stopping any process on port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    echo Killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Starting backend server...
echo.
node server.js

pause
