import { Module } from '@nestjs/common';
import { MockBlockchainService } from './mock-blockchain.service';
import { BLOCKCHAIN_SERVICE } from './blockchain.interface';

@Module({
  providers: [
    {
      provide: BLOCKCHAIN_SERVICE,
      useClass: MockBlockchainService,
    },
  ],
  exports: [BLOCKCHAIN_SERVICE],
})
export class BlockchainModule {}
