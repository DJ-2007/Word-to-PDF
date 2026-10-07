@echo off
setlocal enabledelayedexpansion
title Convertly - Universal File Converter
color 0b

echo ==============================================================
echo           CONVERTLY - UNIVERSAL FILE CONVERTER
echo ==============================================================
echo.

:: 1. Free port 3000 if occupied by any previous session
echo   [1/3] Checking and clearing port 3000...
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo         Releasing previous process on port 3000 (PID: %%p)...
    taskkill /F /PID %%p >nul 2>&1
)

:: 2. Check dependencies
if not exist "node_modules\" (
    echo   [2/3] Installing dependencies, please wait...
    call npm install
) else (
    echo   [2/3] Project dependencies verified.
)

:: 3. Launch browser after a brief delay so server has time to bind
echo   [3/3] Starting web server at http://localhost:3000 ...
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

echo.
echo ==============================================================
echo   Website live at: http://localhost:3000
echo   Keep this window open while using Convertly.
echo   Press Ctrl+C to stop the server anytime.
echo ==============================================================
echo.

:: Run production server (serves all CSS & JS assets)
if exist ".next\" (
    call npm run start
) else (
    call npm run dev
)

pause
