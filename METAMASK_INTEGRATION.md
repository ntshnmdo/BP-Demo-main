# MetaMask Integration for Battery Passport Blockchain Publishing

This document explains the MetaMask integration for real blockchain transactions when publishing battery passports.

## Overview

When a battery passport is approved and ready for publication, admins can now publish it directly to the blockchain using their MetaMask wallet. This creates a permanent, cryptographic record of the passport on the blockchain.

## Features

✅ **Real Blockchain Transactions** - Sign and submit transactions via MetaMask  
✅ **Secure Signing** - User signs transactions with their own wallet  
✅ **Transaction Verification** - Backend stores and verifies blockchain transaction hashes  
✅ **Error Handling** - Comprehensive error messages and retry capability  
✅ **Multi-step Workflow** - Clear step-by-step process with visual feedback  

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env.local` (frontend) and `.env` (backend):

```bash
# Frontend (.env.local)
NEXT_PUBLIC_RPC_URL=https://your-ethereum-rpc-endpoint
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress

# Backend (.env)
RPC_URL=https://your-ethereum-rpc-endpoint
CONTRACT_ADDRESS=0xYourContractAddress
ANCHOR_PRIVATE_KEY=0xYourPrivateKey  # For backend-initiated transactions (optional)
ANCHOR_OWNER_ADDRESS=0xYourWalletAddress  # Default recipient for anchored passports
STORAGE_MODE=local  # or 'ipfs' for IPFS storage
```

### 2. Install Dependencies

Frontend dependencies have been added to `package.json`:

```json
{
  "ethers": "^6.10.0",
  "wagmi": "^2.0.0",
  "@web3modal/ethers": "^4.0.0",
  "@web3modal/react": "^4.0.0",
  "viem": "^2.0.0"
}
```

Run:
```bash
cd apps/frontend
npm install
```

### 3. Smart Contract Setup

Your smart contract should implement the following interface:

```solidity
function anchorPassport(
    address to, 
    string calldata adi, 
    string calldata dbHash, 
    string calldata cid
) external returns (uint256);

event PassportAnchored(
    uint256 indexed tokenId,
    address indexed to,
    string adi,
    string dbSha256Hash,
    string ipfsCid,
    uint256 timestamp
);
```

## User Workflow

### Step 1: Navigate to Approved Passport
1. Go to Passports list
2. Find and open a passport with status "APPROVED"

### Step 2: Click "Publish on Blockchain"
The admin will see a blue "Publish on Blockchain" button instead of the regular "Publish Passport" button.

### Step 3: Connect MetaMask Wallet
1. Click "Connect MetaMask Wallet" button
2. MetaMask popup appears
3. Select account and approve connection
4. Wait for confirmation

### Step 4: Confirm Publication Details
Review the passport details:
- Passport ID
- Current status (APPROVED → PUBLISHED)
- Storage mode (Local)
- Connected wallet address

### Step 5: Sign Transaction
1. Click "Sign & Publish"
2. MetaMask popup shows transaction details
3. Review and approve the transaction
4. Wait for blockchain confirmation

### Step 6: Success Confirmation
When transaction is confirmed:
- Transaction hash is displayed
- Passport status changes to PUBLISHED
- Blockchain transaction hash is stored in database

## Technical Architecture

### Frontend Components

#### 1. `useMetaMask` Hook ([src/lib/web3/useMetaMask.ts](../../apps/frontend/src/lib/web3/useMetaMask.ts))
Handles MetaMask connection logic:
```typescript
const { 
  account,           // Connected wallet info
  connectWallet,     // Connect function
  disconnectWallet,  // Disconnect function
  isMetaMaskAvailable,
  isConnecting,
  error
} = useMetaMask();
```

#### 2. `BlockchainTransactionService` ([src/lib/web3/blockchainTransactionService.ts](../../apps/frontend/src/lib/web3/blockchainTransactionService.ts))
Submits blockchain transactions:
```typescript
const service = new BlockchainTransactionService();
const { txHash, tokenId } = await service.submitPassportTransaction(
  passportId,
  dataHash,
  walletAddress,
  'local'  // storage mode
);
```

#### 3. `PublishWithBlockchainDialog` ([src/components/web3/PublishWithBlockchainDialog.tsx](../../apps/frontend/src/components/web3/PublishWithBlockchainDialog.tsx))
Multi-step dialog component managing the entire publish workflow.

#### 4. `walletStore` ([src/lib/store/walletStore.ts](../../apps/frontend/src/lib/store/walletStore.ts))
Zustand store for global wallet state management.

### Backend Changes

#### 1. DTO Updates
[src/passports/dto/publish-with-blockchain.dto.ts](../../apps/backend/src/passports/dto/publish-with-blockchain.dto.ts)
```typescript
export class PublishWithBlockchainDto {
  walletAddress?: string;
  blockchainTxHash?: string;
  isBlockchainPublish?: boolean;
}
```

#### 2. Controller Update
[src/passports/passports.controller.ts](../../apps/backend/src/passports/passports.controller.ts)
- Updated `/passports/:id/publish` endpoint to accept blockchain data

#### 3. Service Update
[src/passports/passports.service.ts](../../apps/backend/src/passports/passports.service.ts)
- Modified `publish()` method to store wallet address and transaction hash
- Stores blockchain transaction in `blockchainTx` field
- Stores wallet address in `publishedByWallet` field

## Data Flow

```
┌─────────────────────────────────────────┐
│  Passport Detail Page (APPROVED status) │
└────────────────────┬────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ PublishWithBlockchain  │
        │     Dialog Opens       │
        └────────┬───────────────┘
                 │
     ┌───────────┴───────────┐
     ▼                       ▼
Connect Wallet         Already Connected
     │                       │
     └───────────┬───────────┘
                 ▼
        ┌────────────────────┐
        │ User Confirms      │
        │ Publication        │
        └────────┬───────────┘
                 ▼
        ┌────────────────────────────┐
        │ BlockchainTransactionService│
        │ Submits anchorPassport()   │
        └────────┬───────────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │ User Signs with        │
        │ MetaMask Wallet        │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │ Transaction Confirmed  │
        │ Get Transaction Hash   │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────────┐
        │ Backend /publish endpoint  │
        │ Receives TX hash & wallet  │
        └────────┬───────────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │ Passport Status:       │
        │ APPROVED → PUBLISHED   │
        │ Store TX hash & wallet │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │ Success Notification   │
        │ Page Refreshes         │
        └────────────────────────┘
```

## Error Handling

### Common Errors

**"MetaMask not installed"**
- User needs to install MetaMask extension
- Link provided to install MetaMask

**"Failed to connect wallet"**
- User rejected connection in MetaMask
- Try connecting again

**"Transaction reverted"**
- Smart contract validation failed
- Check contract parameters and gas

**"Network mismatch"**
- User's MetaMask is on wrong chain
- Switch to correct network in MetaMask

## Testing

### Manual Testing Checklist

- [ ] MetaMask is installed and unlocked
- [ ] User has test ETH in wallet
- [ ] Connected to correct Ethereum network
- [ ] Passport is in APPROVED status
- [ ] Click "Publish on Blockchain" opens dialog
- [ ] Can connect MetaMask wallet
- [ ] Can see passport details
- [ ] Can sign transaction in MetaMask
- [ ] Transaction is confirmed
- [ ] Passport status changes to PUBLISHED
- [ ] Transaction hash is displayed
- [ ] Backend audit log shows blockchain transaction
- [ ] Can refresh page without losing data

### Test Data

```typescript
// Test Passport (must be APPROVED)
{
  passportId: "BAT-2024-000001",
  serialNumber: "SN-TEST-001",
  model: "Test Model",
  chemistry: "NMC",
  status: "APPROVED"
}

// Test Wallet
- Address: 0x... (your test wallet)
- Network: Ethereum Sepolia (or your test network)
- Balance: Sufficient test ETH for gas
```

## Troubleshooting

### Issue: Dialog doesn't appear
**Solution:**
- Verify passport status is APPROVED
- Check that user role is ADMIN
- Clear browser cache and reload

### Issue: MetaMask connection fails
**Solution:**
- Make sure MetaMask is installed
- Unlock MetaMask extension
- Check if wallet has network access
- Try switching networks

### Issue: Transaction fails to confirm
**Solution:**
- Check gas price (may be too high/low)
- Verify smart contract address is correct
- Check wallet has sufficient balance
- Review contract ABI in code

### Issue: Backend doesn't receive transaction hash
**Solution:**
- Check browser console for API errors
- Verify backend endpoint is `/api/passports/:id/publish`
- Check request payload includes `blockchainTxHash`
- Verify authentication token is valid

## Security Considerations

✅ **User Controls Signing** - Only user's MetaMask signs transactions  
✅ **No Private Keys Stored** - Keys never leave user's wallet  
✅ **HTTPS Only** - All communications encrypted  
✅ **CSRF Protection** - Backend validates requests  
✅ **Audit Trail** - All blockchain transactions logged  

## API Endpoints

### Publish Passport with Blockchain

**Endpoint:** `POST /api/passports/:id/publish`

**Request:**
```json
{
  "walletAddress": "0x...",
  "blockchainTxHash": "0x...",
  "isBlockchainPublish": true
}
```

**Response:**
```json
{
  "id": "...",
  "passportId": "BAT-2024-000001",
  "status": "PUBLISHED",
  "blockchainTx": "0x...",
  "publishedByWallet": "0x...",
  "publishedAt": "2024-07-13T10:30:00Z",
  ...
}
```

## Future Enhancements

- [ ] Support multiple blockchain networks (Polygon, Arbitrum, etc.)
- [ ] Batch publish multiple passports
- [ ] IPFS integration for document storage
- [ ] Gas price optimization
- [ ] Passport NFT minting
- [ ] Decentralized verification system
- [ ] Multi-signature approval for high-value passports
- [ ] Blockchain event monitoring dashboard

## References

- [ethers.js Documentation](https://docs.ethers.org/v6/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Web3Modal Documentation](https://web3modal.com/)
- [Solidity Contract Example](./BLOCKCHAIN.md)
