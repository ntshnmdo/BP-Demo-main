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
    "function isAdiAnchored(string adi) external view returns (bool)",
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
      
      // Check and switch network if needed
      const targetChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 99999;
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);

      if (currentChainId !== targetChainId) {
        console.log(`[BLOCKCHAIN] Current chain ID ${currentChainId} does not match target ${targetChainId}. Prompting network switch...`);
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${targetChainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            console.log('[BLOCKCHAIN] Chain not added to MetaMask. Requesting addition...');
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${targetChainId.toString(16)}`,
                    chainName: targetChainId === 99999 ? 'ADI Foundation Testnet' : 'Local Blockchain',
                    rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.ab.testnet.adifoundation.ai'],
                    nativeCurrency: {
                      name: 'ADI',
                      symbol: 'ADI',
                      decimals: 18,
                    },
                    blockExplorerUrls: ['https://explorer.ab.testnet.adifoundation.ai/'],
                  },
                ],
              });
            } catch (addError: any) {
              console.error('[BLOCKCHAIN] Failed to add Ethereum chain:', addError);
              throw new Error(`Please add network with Chain ID ${targetChainId} to MetaMask.`);
            }
          } else {
            console.error('[BLOCKCHAIN] Failed to switch Ethereum chain:', switchError);
            throw new Error(`Please switch MetaMask to network with Chain ID ${targetChainId}.`);
          }
        }
      }

      // Re-initialize provider and signer after switch
      const updatedProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await updatedProvider.getSigner();
      
      // Create contract instance with user's signer
      const contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        signer
      );

      // Check if already anchored on-chain to handle recovery/resubmissions
      const isAlreadyAnchored = await contract.isAdiAnchored(passportId);
      if (isAlreadyAnchored) {
        console.log(`[BLOCKCHAIN] Passport ${passportId} is already anchored on-chain. Finding event logs...`);
        try {
          const filter = contract.filters.PassportAnchored(null, null, passportId);
          const events = await contract.queryFilter(filter, 0, 'latest');
          if (events && events.length > 0) {
            const event = events[events.length - 1] as any;
            console.log(`[BLOCKCHAIN] Found existing anchoring transaction: ${event.transactionHash}`);
            let tokenId: string | undefined;
            if (event.args && event.args.length > 0) {
              tokenId = event.args[0].toString();
            }
            return { txHash: event.transactionHash, tokenId };
          }
        } catch (eventError) {
          console.warn('[BLOCKCHAIN] Failed to query event history:', eventError);
        }
        // Fallback placeholder if event querying fails
        return { txHash: '0xAlreadyAnchored' };
      }

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
