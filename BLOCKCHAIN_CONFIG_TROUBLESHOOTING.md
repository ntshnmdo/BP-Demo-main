# Blockchain Configuration Troubleshooting Guide

## Error: "Contract address not configured"

This error appears when trying to publish a passport on the blockchain if the required environment variables are not set.

## Quick Fix

### 1. Create Frontend Environment File

Create a file named `.env.local` in the `apps/frontend/` directory:

```bash
# Windows (PowerShell)
Copy-Item apps/frontend/.env.example apps/frontend/.env.local

# macOS/Linux
cp apps/frontend/.env.example apps/frontend/.env.local
```

### 2. Edit `.env.local`

Open `apps/frontend/.env.local` and configure the blockchain endpoints:

```env
# Ethereum RPC Endpoint (testnet recommended for development)
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Your deployed Battery Passport smart contract address
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

### 3. Get Your Values

#### Option A: Using Alchemy (Recommended for Testing)

1. Go to https://www.alchemy.com/
2. Sign up for free account
3. Create a new app for Ethereum Sepolia testnet
4. Copy your API key and RPC URL
5. Format: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

#### Option B: Using Infura

1. Go to https://infura.io/
2. Sign up for free account
3. Create new project for Ethereum
4. Select Sepolia testnet
5. Copy project ID
6. Format: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

#### Option C: Using Your Local Node

If you run your own Ethereum node:
```
NEXT_PUBLIC_RPC_URL=http://localhost:8545
```

### 4. Get Your Contract Address

Deploy your Battery Passport smart contract:

```solidity
// BatteryPassport.sol
pragma solidity ^0.8.0;

contract BatteryPassport {
    function anchorPassport(
        address to, 
        string memory adi, 
        string memory dbHash, 
        string memory cid
    ) external returns (uint256) {
        // Implementation
        return 1;
    }

    event PassportAnchored(
        uint256 indexed tokenId,
        address indexed to,
        string adi,
        string dbSha256Hash,
        string ipfsCid,
        uint256 timestamp
    );
}
```

After deployment, copy the contract address to `NEXT_PUBLIC_CONTRACT_ADDRESS`

### 5. Restart Your App

```bash
# Kill the running dev server (Ctrl+C)
# Then restart
npm run dev
```

## Verification

Run the configuration checker:

### Windows
```bash
.\check-blockchain-config.bat
```

### macOS/Linux
```bash
bash check-blockchain-config.sh
```

## Testing the Configuration

1. Open http://localhost:3000 in your browser
2. Login with admin credentials
3. Create or find an APPROVED passport
4. Click "Publish on Blockchain" button
5. Should see wallet connection dialog (not configuration error)

## Common Issues

### Issue: Still seeing "Contract address not configured"

**Solution:**
- Check that file is named exactly `.env.local` (not `.env`)
- Make sure it's in `apps/frontend/` directory
- Verify no extra spaces in the values
- Restart dev server after creating .env.local

```bash
# Check file exists
ls apps/frontend/.env.local  # macOS/Linux
dir apps\frontend\.env.local # Windows

# Check content
cat apps/frontend/.env.local  # macOS/Linux
type apps\frontend\.env.local # Windows
```

### Issue: "MetaMask not available"

**Solution:**
- Install MetaMask: https://metamask.io
- Refresh the page
- Make sure MetaMask extension is enabled in your browser

### Issue: "Network mismatch"

**Solution:**
- Open MetaMask
- Switch to the same network as your RPC_URL
- For Sepolia testnet, select "Sepolia" network in MetaMask
- For Mainnet, select "Ethereum Mainnet"

### Issue: "Transaction reverted"

**Solution:**
- Make sure wallet has enough test ETH
- For Sepolia: Get test ETH from https://sepoliafaucet.com
- Check contract address is correct
- Verify contract has `anchorPassport` function

## Environment Variables Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NEXT_PUBLIC_RPC_URL` | Yes | `https://eth-sepolia.g.alchemy.com/v2/...` | Ethereum node endpoint |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Yes | `0x1234...` | Smart contract address |

## Next Steps

Once configured, see [METAMASK_INTEGRATION.md](../METAMASK_INTEGRATION.md) for:
- Complete user workflow
- Smart contract details
- Backend configuration (optional)
- Production deployment

## Support

For more help:
- Check [METAMASK_INTEGRATION.md](../METAMASK_INTEGRATION.md)
- See [SETUP.md](../SETUP.md) for general setup
- Create an issue on GitHub
