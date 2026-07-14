@echo off
REM Battery Passport Blockchain Configuration Checker (Windows)
REM This script verifies that your blockchain environment is properly configured

cls
echo.
echo 🔍 Battery Passport Blockchain Configuration Checker
echo ===================================================
echo.

REM Check frontend environment
echo 📋 Checking Frontend Configuration (.env.local)...
echo.

if exist "apps\frontend\.env.local" (
  echo Found apps\frontend\.env.local
  
  REM Check for CONTRACT_ADDRESS
  findstr /I "NEXT_PUBLIC_CONTRACT_ADDRESS" "apps\frontend\.env.local" >nul
  if errorlevel 1 (
    echo ❌ NEXT_PUBLIC_CONTRACT_ADDRESS not found
  ) else (
    for /f "delims==" %%a in ('findstr /I "NEXT_PUBLIC_CONTRACT_ADDRESS" "apps\frontend\.env.local"') do (
      echo ✅ NEXT_PUBLIC_CONTRACT_ADDRESS: configured
    )
  )
  
  REM Check for RPC_URL
  findstr /I "NEXT_PUBLIC_RPC_URL" "apps\frontend\.env.local" >nul
  if errorlevel 1 (
    echo ❌ NEXT_PUBLIC_RPC_URL not found
  ) else (
    echo ✅ NEXT_PUBLIC_RPC_URL: configured
  )
) else (
  echo ❌ .env.local not found in apps\frontend\
  echo    Copy from .env.example:
  echo    copy apps\frontend\.env.example apps\frontend\.env.local
)

echo.
echo 📋 Checking Backend Configuration (.env)...
echo.

if exist ".env" (
  findstr /I "BLOCKCHAIN_PROVIDER" ".env" >nul
  if errorlevel 1 (
    echo ⚠️  BLOCKCHAIN_PROVIDER not configured (using defaults)
  ) else (
    echo ✅ BLOCKCHAIN_PROVIDER: configured
  )
  
  findstr /I "ANCHOR_PRIVATE_KEY" ".env" >nul
  if errorlevel 1 (
    echo ℹ️  ANCHOR_PRIVATE_KEY: not configured (optional)
  ) else (
    echo ✅ ANCHOR_PRIVATE_KEY: configured
  )
) else (
  echo ⚠️  .env not found (using defaults)
)

echo.
echo ===================================================
echo.
echo Next Steps:
echo 1. Ensure .env.local is created in apps/frontend/
echo 2. Add NEXT_PUBLIC_CONTRACT_ADDRESS and NEXT_PUBLIC_RPC_URL
echo 3. Install MetaMask browser extension
echo 4. Make sure you have test ETH for gas fees
echo 5. See METAMASK_INTEGRATION.md for detailed setup
echo.
pause
