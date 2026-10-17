@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"
echo =====================================================================
echo  The BC Cargo ^& Courier — Production Build ^& Validation Pipeline
echo =====================================================================

if not exist node_modules (
    echo [STEP 1/5] Installing dependencies with npm ci / install...
    call npm install
    if errorlevel 1 (
        echo [FAILED] Dependency installation failed.
        exit /b 1
    )
) else (
    echo [STEP 1/5] Verified node_modules present.
)

echo.
echo [STEP 2/5] Running TypeScript Typecheck (tsc --noEmit)...
call npm run typecheck
if errorlevel 1 (
    echo [FAILED] TypeScript typecheck failed with compilation errors.
    exit /b 1
)
echo [PASSED] TypeScript typecheck clean.

echo.
echo [STEP 3/5] Running Automated Unit Tests...
call npm run test
if errorlevel 1 (
    echo [FAILED] One or more unit tests failed.
    exit /b 1
)
echo [PASSED] All tests passed.

echo.
echo [STEP 4/5] Building Production Frontend (vite build)...
call npm run build
if errorlevel 1 (
    echo [FAILED] Vite production build failed.
    exit /b 1
)
echo [PASSED] Production build succeeded in ./dist

echo.
echo [STEP 5/5] Validating Output Assets...
if not exist "dist\index.html" (
    echo [FAILED] dist\index.html not generated!
    exit /b 1
)
echo [PASSED] dist\index.html and assets verified.

echo.
echo =====================================================================
echo  SUCCESS: Production build completed successfully!
echo  Run 'npm start' or 'node server.js' to start the production server.
echo =====================================================================
exit /b 0
