@echo off
echo ====================================
echo    Sintesa Backend Deployment
echo    Optimized for Windows Production
echo ====================================

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

:: Check if PM2 is installed
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo Installing PM2 globally...
    npm install -g pm2
    if errorlevel 1 (
        echo ERROR: Failed to install PM2
        pause
        exit /b 1
    )
)

:: Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

:: Install dependencies
echo Installing dependencies...
npm install --production
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

:: Stop existing PM2 processes
echo Stopping existing processes...
pm2 stop sintesa-backend 2>nul
pm2 delete sintesa-backend 2>nul

:: Start with Windows configuration
echo Starting application with Windows optimization...
pm2 start ecosystem.config.windows.json --env windows

:: Save PM2 configuration
pm2 save

:: Setup PM2 startup (requires admin privileges)
echo Setting up PM2 startup...
pm2 startup
if errorlevel 1 (
    echo WARNING: Could not setup PM2 startup. You may need to run as Administrator.
)

:: Show status
pm2 status

echo.
echo ====================================
echo    Deployment Complete!
echo ====================================
echo.
echo Application is running on:
echo - Port: 8080
echo - URL: http://localhost:8080
echo.
echo Useful commands:
echo - pm2 status         : Check application status
echo - pm2 logs           : View logs
echo - pm2 monit          : Monitor resources
echo - pm2 restart all    : Restart all processes
echo - pm2 reload all     : Reload all processes (zero downtime)
echo.
pause
