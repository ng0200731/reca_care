@echo off
cd /d "%~dp0"
echo Starting WashCare Label Designer...
echo.

:: Stop any existing process using port 3000 to avoid Next.js falling back to another port
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Port 3000 is already in use by process %%a. Stopping it...
    taskkill /PID %%a /F >nul 2>&1
    timeout /t 2 /nobreak >nul
)

start "WashCare Dev Server" cmd /k "set NODE_OPTIONS=--max-old-space-size=4096 && npm run dev"
echo Waiting for dev server to start...
timeout /t 5 /nobreak >nul
start "" http://localhost:3000
echo Opening browser at http://localhost:3000
pause
