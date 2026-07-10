export interface IBlockchainService {
  storeHash(passportId: string, dataHash: string): Promise<{ txHash: string }>;
  verifyHash(passportId: string, dataHash: string): Promise<boolean>;
  getRecord(passportId: string): Promise<{ hash: string; timestamp: Date } | null>;
}

export const BLOCKCHAIN_SERVICE = 'BLOCKCHAIN_SERVICE';
