import { ethers } from 'ethers';

export interface BlockchainTransaction {
  passportId: string;
  dataHash: string;
  userAddress: string;
  txHash?: string;
  timestamp: number;
}

/**
 * Service to handle blockchain interactions with user's connected MetaMask wallet
 */
export class BlockchainTransactionService {
  private rpcUrl: string;
  private contractAddress: string;
  private contractABI: string[] = [
    "function anchorPassport(address to, string adi, string dbHash, string cid) external returns (uint256)",
    "event PassportAnchored(uint256 indexed tokenId, address indexed to, string adi, string dbSha256Hash, string ipfsCid, uint256 timestamp)"
  ];

  constructor(rpcUrl?: string, contractAddress?: string) {
    this.rpcUrl = rpcUrl || process.env.NEXT_PUBLIC_RPC_URL || '';
    this.contractAddress = contractAddress || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
  }

  /**
   * Sign and submit passport anchoring transaction using user's MetaMask wallet
   */
  async submitPassportTransaction(
    passportId: string,
    dataHash: string,
    userAddress: string,
    storageMode: 'ipfs' | 'local' = 'local'
  ): Promise<{ txHash: string; tokenId?: string }> {
    if (!window.ethereum) {
      throw new Error('MetaMask not available');
    }

    if (!this.contractAddress) {
      throw new Error('Contract address not configured');
    }

    try {
      // Create provider from user's MetaMask connection
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance with user's signer
      const contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        signer
      );

      // Prepare CID pointer
      const cid = storageMode === 'ipfs' ? `ipfs://${dataHash}` : `local://${dataHash}`;

      console.log(`[BLOCKCHAIN] Submitting anchorPassport transaction from ${userAddress}...`);
      
      // Submit transaction
      const tx = await contract.anchorPassport(userAddress, passportId, dataHash, cid);
      
      console.log(`[BLOCKCHAIN] Transaction submitted: ${tx.hash}. Waiting for confirmation...`);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();

      if (!receipt || receipt.status !== 1) {
        throw new Error('Blockchain transaction reverted.');
      }

      console.log(`[BLOCKCHAIN] Transaction confirmed: ${tx.hash}`);

      // Parse event logs for token ID
      let tokenId: string | undefined;
      try {
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog(log as any);
            if (parsedLog && parsedLog.name === 'PassportAnchored') {
              tokenId = parsedLog.args[0].toString();
              break;
            }
          } catch (e) {
            // ignore logs that don't match
          }
        }
      } catch (e) {
        console.warn('Could not parse event logs:', e);
      }

      return { txHash: tx.hash, tokenId };
    } catch (error: any) {
      const errorMessage = error?.reason || error?.message || 'Failed to submit transaction';
      console.error('[BLOCKCHAIN ERROR]', errorMessage);
      throw new Error(`Blockchain transaction failed: ${errorMessage}`);
    }
  }

  /**
   * Verify if a passport is anchored on-chain
   */
  async verifyPassportAnchored(passportId: string): Promise<boolean> {
    if (!this.rpcUrl || !this.contractAddress) {
      console.warn('RPC or contract address not configured for verification');
      return false;
    }

    try {
      const provider = new ethers.JsonRpcProvider(this.rpcUrl);
      const contract = new ethers.Contract(
        this.contractAddress,
        ["function isAdiAnchored(string adi) external view returns (bool)"],
        provider
      );

      const isAnchored = await contract.isAdiAnchored(passportId);
      console.log(`[BLOCKCHAIN] Verified passport ${passportId} isAnchored=${isAnchored}`);
      return isAnchored;
    } catch (error: any) {
      console.error('[BLOCKCHAIN ERROR] Verification failed:', error?.message);
      return false;
    }
  }

  /**
   * Get the current connected account
   */
  async getConnectedAccount(): Promise<string | null> {
    if (!window.ethereum) {
      return null;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return await signer.getAddress();
    } catch (error) {
      console.error('Failed to get connected account:', error);
      return null;
    }
  }

  /**
   * Get the current network ID
   */
  async getNetworkId(): Promise<number | null> {
    if (!window.ethereum) {
      return null;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      return Number(network.chainId);
    } catch (error) {
      console.error('Failed to get network ID:', error);
      return null;
    }
  }
}
