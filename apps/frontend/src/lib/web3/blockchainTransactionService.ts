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
      // Encode calldata using ethers Interface (ABI encoding only — no ENS involved)
      const iface = new ethers.Interface(this.contractABI);
      const cid = storageMode === 'ipfs' ? `ipfs://${dataHash}` : `local://${dataHash}`;

      // Ensure address is EIP-55 checksummed
      const checksumAddress = ethers.getAddress(userAddress);

      const calldata = iface.encodeFunctionData('anchorPassport', [
        checksumAddress,
        passportId,
        dataHash,
        cid,
      ]);

      console.log(`[BLOCKCHAIN] Submitting anchorPassport via eth_sendTransaction from ${checksumAddress}...`);

      // Send transaction directly through MetaMask — completely bypasses ethers ENS resolution
      const txHash: string = await (window.ethereum as any).request({
        method: 'eth_sendTransaction',
        params: [{
          from: checksumAddress,
          to: this.contractAddress,
          data: calldata,
        }],
      });

      console.log(`[BLOCKCHAIN] Transaction submitted: ${txHash}. Waiting for confirmation...`);

      // Poll for receipt using raw eth_getTransactionReceipt
      const receipt = await this._waitForReceipt(txHash);

      if (!receipt || receipt.status !== '0x1') {
        throw new Error('Blockchain transaction reverted.');
      }

      console.log(`[BLOCKCHAIN] Transaction confirmed: ${txHash}`);

      // Parse event logs for token ID
      let tokenId: string | undefined;
      try {
        const eventTopic = iface.getEvent('PassportAnchored')?.topicHash;
        for (const log of receipt.logs ?? []) {
          if (log.topics?.[0] === eventTopic) {
            const parsed = iface.parseLog(log);
            if (parsed) {
              tokenId = parsed.args[0].toString();
              break;
            }
          }
        }
      } catch (e) {
        console.warn('Could not parse event logs:', e);
      }

      return { txHash, tokenId };
    } catch (error: any) {
      const errorMessage = error?.reason || error?.message || 'Failed to submit transaction';
      console.error('[BLOCKCHAIN ERROR]', errorMessage);
      throw new Error(`Blockchain transaction failed: ${errorMessage}`);
    }
  }

  /** Poll eth_getTransactionReceipt until mined (max 60 attempts × 3s = 3 min) */
  private async _waitForReceipt(txHash: string, maxAttempts = 60): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const receipt = await (window.ethereum as any).request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });
      if (receipt) return receipt;
    }
    throw new Error('Transaction was not mined within the timeout period.');
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
      // Pass staticNetwork to prevent ENS resolution on custom/local networks
      const provider = new ethers.JsonRpcProvider(this.rpcUrl, undefined, { staticNetwork: true });
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
      const rawNetwork = await (window.ethereum as any).request({ method: 'eth_chainId' });
      const chainId = parseInt(rawNetwork, 16);
      const network = new ethers.Network('unknown', chainId);
      const provider = new ethers.BrowserProvider(window.ethereum, network);
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
      const rawChainId = await (window.ethereum as any).request({ method: 'eth_chainId' });
      return parseInt(rawChainId, 16);
    } catch (error) {
      console.error('Failed to get network ID:', error);
      return null;
    }
  }
}
