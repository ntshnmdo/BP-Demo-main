import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IBlockchainService } from './blockchain.interface';
import * as crypto from 'crypto';
import { ethers } from 'ethers';

/**
 * MockBlockchainService operates in hybrid mode:
 * - If RPC_URL, CONTRACT_ADDRESS, and ANCHOR_PRIVATE_KEY are provided in .env,
 *   it performs a real on-chain transaction (minting an NFT for the Battery Passport).
 * - Otherwise, it falls back to a local cryptographic simulation.
 */
@Injectable()
export class MockBlockchainService implements IBlockchainService {
  private readonly logger = new Logger(MockBlockchainService.name);

  constructor(private readonly prisma: PrismaService) {}

  async storeHash(
    passportId: string,
    dataHash: string,
  ): Promise<{ txHash: string }> {
    const rpcUrl = process.env.RPC_URL;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const privateKey = process.env.ANCHOR_PRIVATE_KEY;
    const storageMode = (process.env.STORAGE_MODE || 'local').toLowerCase();

    // Determine storage CID pointer
    const cid = storageMode === 'ipfs' ? `ipfs://${dataHash}` : `local://${dataHash}`;

    if (rpcUrl && contractAddress && privateKey) {
      try {
        this.logger.log(`[BLOCKCHAIN] Connecting to RPC node: ${rpcUrl}`);
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(
          contractAddress,
          [
            "function anchorPassport(address to, string adi, string dbHash, string cid) external returns (uint256)",
            "event PassportAnchored(uint256 indexed tokenId, address indexed to, string adi, string dbSha256Hash, string ipfsCid, uint256 timestamp)"
          ],
          wallet
        );

        // Determine destination address. Use ANCHOR_OWNER_ADDRESS if defined, fallback to signer wallet
        const toAddress = process.env.ANCHOR_OWNER_ADDRESS || wallet.address;

        this.logger.log(
          `[BLOCKCHAIN] Submitting anchorPassport transaction to contract ${contractAddress} for ADI=${passportId}...`
        );
        const tx = await contract.anchorPassport(
          toAddress,
          passportId,
          dataHash,
          cid
        );
        this.logger.log(`[BLOCKCHAIN] Transaction sent: ${tx.hash}. Waiting for confirmation...`);
        const receipt = await tx.wait();

        if (!receipt || receipt.status !== 1) {
          throw new Error('Blockchain transaction reverted.');
        }

        // Parse token ID from logs
        let tokenId: number | null = null;
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog(log as any);
            if (parsedLog && parsedLog.name === 'PassportAnchored') {
              tokenId = Number(parsedLog.args[0]);
              break;
            }
          } catch (e) {
            // ignore mismatch logs
          }
        }

        this.logger.log(
          `[BLOCKCHAIN] Anchored successfully on-chain! TokenID=${tokenId}, TxHash=${tx.hash}`
        );

        // Update database with real blockchain transaction hash
        await this.prisma.batteryPassport.update({
          where: { passportId },
          data: {
            blockchainHash: dataHash,
            blockchainTx: tx.hash,
          },
        });

        return { txHash: tx.hash };
      } catch (err: any) {
        this.logger.error(
          `[BLOCKCHAIN ERROR] Failed to anchor on-chain: ${err.message || err}. Falling back to mock...`
        );
      }
    }

    // Mock Fallback
    const timestamp = Date.now().toString();
    const txHash = crypto
      .createHash('sha256')
      .update(`${passportId}:${dataHash}:${timestamp}`)
      .digest('hex');

    // Persist to the database
    await this.prisma.batteryPassport.update({
      where: { passportId },
      data: {
        blockchainHash: dataHash,
        blockchainTx: `0x${txHash}`,
      },
    });

    this.logger.log(
      `[MOCK BLOCKCHAIN] Stored simulated hash for passport ${passportId}: tx=0x${txHash}`,
    );

    return { txHash: `0x${txHash}` };
  }

  async verifyHash(passportId: string, dataHash: string): Promise<boolean> {
    const rpcUrl = process.env.RPC_URL;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (rpcUrl && contractAddress) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(
          contractAddress,
          ["function isAdiAnchored(string adi) external view returns (bool)"],
          provider
        );

        const isAnchored = await contract.isAdiAnchored(passportId);
        this.logger.log(`[BLOCKCHAIN] Verified passport ${passportId} isAnchored=${isAnchored}`);
        
        const passport = await this.prisma.batteryPassport.findUnique({
          where: { passportId },
          select: { blockchainHash: true },
        });
        return isAnchored && passport?.blockchainHash === dataHash;
      } catch (err: any) {
        this.logger.error(`[BLOCKCHAIN ERROR] Failed to verify on-chain: ${err.message || err}`);
      }
    }

    // Local fallback
    const passport = await this.prisma.batteryPassport.findUnique({
      where: { passportId },
      select: { blockchainHash: true, blockchainTx: true },
    });

    if (!passport || !passport.blockchainHash) {
      this.logger.warn(
        `[MOCK BLOCKCHAIN] No record found for passport ${passportId}`,
      );
      return false;
    }

    const isValid = passport.blockchainHash === dataHash;
    this.logger.log(
      `[MOCK BLOCKCHAIN] Verify ${passportId}: ${isValid ? 'VALID' : 'TAMPERED'}`,
    );
    return isValid;
  }

  async getRecord(
    passportId: string,
  ): Promise<{ hash: string; timestamp: Date } | null> {
    const passport = await this.prisma.batteryPassport.findUnique({
      where: { passportId },
      select: {
        blockchainHash: true,
        approvedAt: true,
        updatedAt: true,
      },
    });

    if (!passport || !passport.blockchainHash) {
      return null;
    }

    return {
      hash: passport.blockchainHash,
      timestamp: passport.approvedAt || passport.updatedAt,
    };
  }
}
