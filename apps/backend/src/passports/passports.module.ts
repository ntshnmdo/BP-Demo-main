import { Module } from '@nestjs/common';
import { PassportsService } from './passports.service';
import { PassportsController } from './passports.controller';
import { AuditModule } from '../audit/audit.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [AuditModule, BlockchainModule],
  controllers: [PassportsController],
  providers: [PassportsService],
  exports: [PassportsService],
})
export class PassportsModule {}
