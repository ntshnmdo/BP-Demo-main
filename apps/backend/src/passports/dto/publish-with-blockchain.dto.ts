import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class PublishWithBlockchainDto {
  @IsOptional()
  @IsString()
  walletAddress?: string;

  @IsOptional()
  @IsString()
  blockchainTxHash?: string;

  @IsOptional()
  @IsBoolean()
  isBlockchainPublish?: boolean;
}
