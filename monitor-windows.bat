@echo off
title Sintesa Backend Monitor

:MENU
cls
echo ====================================
echo    Sintesa Backend Monitor
echo ====================================
echo.
echo 1. Show PM2 Status
echo 2. View Real-time Logs
echo 3. Monitor CPU/Memory Usage
echo 4. Restart Application
echo 5. Reload Application (Zero Downtime)
echo 6. Stop Application
echo 7. View Error Logs
echo 8. Performance Dashboard
echo 9. Database Health Check
echo 0. Exit
echo.
set /p choice=Select option (0-9): 

if "%choice%"=="1" goto STATUS
if "%choice%"=="2" goto LOGS
if "%choice%"=="3" goto MONITOR
if "%choice%"=="4" goto RESTART
if "%choice%"=="5" goto RELOAD
if "%choice%"=="6" goto STOP
if "%choice%"=="7" goto ERRORS
if "%choice%"=="8" goto DASHBOARD
if "%choice%"=="9" goto HEALTH
if "%choice%"=="0" goto EXIT
goto MENU

:STATUS
cls
echo ====================================
echo    Application Status
echo ====================================
pm2 status
echo.
echo Press any key to return to menu...
pause >nul
goto MENU

:LOGS
cls
echo ====================================
echo    Real-time Logs (Ctrl+C to stop)
echo ====================================
pm2 logs sintesa-backend
goto MENU

:MONITOR
cls
echo ====================================
echo    Resource Monitor (Ctrl+C to stop)
echo ====================================
pm2 monit
goto MENU

:RESTART
cls
echo ====================================
echo    Restarting Application
echo ====================================
pm2 restart sintesa-backend
echo Application restarted successfully!
timeout /t 3 >nul
goto MENU

:RELOAD
cls
echo ====================================
echo    Reloading Application (Zero Downtime)
echo ====================================
pm2 reload sintesa-backend
echo Application reloaded successfully!
timeout /t 3 >nul
goto MENU

:STOP
cls
echo ====================================
echo    Stopping Application
echo ====================================
pm2 stop sintesa-backend
echo Application stopped!
timeout /t 3 >nul
goto MENU

:ERRORS
cls
echo ====================================
echo    Error Logs (Last 50 lines)
echo ====================================
pm2 logs sintesa-backend --err --lines 50
echo.
echo Press any key to return to menu...
pause >nul
goto MENU

:DASHBOARD
cls
echo ====================================
echo    Performance Dashboard
echo ====================================
echo.
echo CPU and Memory Usage:
wmic cpu get loadpercentage /value | find "LoadPercentage"
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value | find "="
echo.
echo Disk Usage:
wmic logicaldisk get size,freespace,caption | find ":"
echo.
echo Network Connections:
netstat -an | find ":8080" | find "LISTENING"
echo.
echo PM2 Process Info:
pm2 show sintesa-backend
echo.
echo Press any key to return to menu...
pause >nul
goto MENU

:HEALTH
cls
echo ====================================
echo    Database Health Check
echo ====================================
echo Checking database connectivity...
curl -s http://localhost:8080/api/database/health
echo.
echo.
echo API Health Check:
curl -s http://localhost:8080/api/health
echo.
echo.
echo Press any key to return to menu...
pause >nul
goto MENU

:EXIT
echo.
echo Thank you for using Sintesa Backend Monitor!
timeout /t 2 >nul
exit
