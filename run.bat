@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"
echo =====================================================================
echo  The BC Cargo ^& Courier — Starting Development Server
echo =====================================================================

if not exist node_modules (
    echo [INFO] node_modules not found. Running npm install...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed. Please check your network and node installation.
        exit /b 1
    )
)

if not exist .env (
    if exist .env.example (
        echo [NOTICE] .env not found. Creating from .env.example with placeholders...
        copy .env.example .env >nul
        echo [NOTICE] Created .env. Please configure real keys when available.
    )
)

echo [INFO] Starting Vite development server on http://localhost:3000...
call npm run dev
if errorlevel 1 (
    echo [ERROR] Development server stopped with an error code.
    exit /b %errorlevel%
)
