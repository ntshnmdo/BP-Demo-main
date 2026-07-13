#!/bin/bash
# Battery Passport Blockchain Configuration Checker
# This script verifies that your blockchain environment is properly configured

echo "🔍 Battery Passport Blockchain Configuration Checker"
echo "=================================================="
echo ""

# Check frontend environment variables
echo "📋 Checking Frontend Configuration (.env.local)..."
echo ""

if [ -f "apps/frontend/.env.local" ]; then
  CONTRACT_ADDR=$(grep NEXT_PUBLIC_CONTRACT_ADDRESS "apps/frontend/.env.local" | cut -d'=' -f2 | tr -d ' ')
  RPC_URL=$(grep NEXT_PUBLIC_RPC_URL "apps/frontend/.env.local" | cut -d'=' -f2 | tr -d ' ')
  
  if [ -z "$CONTRACT_ADDR" ] || [ "$CONTRACT_ADDR" = "0x" ]; then
    echo "❌ NEXT_PUBLIC_CONTRACT_ADDRESS not set or invalid"
  else
    echo "✅ NEXT_PUBLIC_CONTRACT_ADDRESS: ${CONTRACT_ADDR:0:10}...${CONTRACT_ADDR: -4}"
  fi
  
  if [ -z "$RPC_URL" ]; then
    echo "❌ NEXT_PUBLIC_RPC_URL not set"
  else
    echo "✅ NEXT_PUBLIC_RPC_URL: $(echo $RPC_URL | head -c 30)..."
  fi
else
  echo "❌ .env.local not found in apps/frontend/"
  echo "   Create one based on .env.example:"
  echo "   cp apps/frontend/.env.example apps/frontend/.env.local"
fi

echo ""
echo "📋 Checking Backend Configuration (.env)..."
echo ""

if [ -f ".env" ]; then
  BLOCKCHAIN_PROVIDER=$(grep BLOCKCHAIN_PROVIDER ".env" | cut -d'=' -f2 | tr -d ' ')
  
  if [ "$BLOCKCHAIN_PROVIDER" = "mock" ]; then
    echo "⚠️  BLOCKCHAIN_PROVIDER: mock (using simulated blockchain)"
  else
    echo "✅ BLOCKCHAIN_PROVIDER: $BLOCKCHAIN_PROVIDER"
  fi
  
  ANCHOR_KEY=$(grep ANCHOR_PRIVATE_KEY ".env" | cut -d'=' -f2 | tr -d ' ')
  if [ ! -z "$ANCHOR_KEY" ] && [ "$ANCHOR_KEY" != "0x" ]; then
    echo "✅ ANCHOR_PRIVATE_KEY: configured (${ANCHOR_KEY:0:6}...)"
  else
    echo "ℹ️  ANCHOR_PRIVATE_KEY: not configured (optional, for server-side signing)"
  fi
else
  echo "⚠️  .env not found (using defaults)"
fi

echo ""
echo "=================================================="
echo ""
echo "Next Steps:"
echo "1. Frontend users can connect MetaMask to publish passports"
echo "2. Make sure MetaMask is installed: https://metamask.io"
echo "3. Set correct network in MetaMask (should match RPC_URL)"
echo "4. Have test ETH for gas fees"
echo ""
echo "For detailed setup, see: METAMASK_INTEGRATION.md"
