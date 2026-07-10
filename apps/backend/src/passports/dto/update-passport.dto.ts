import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsObject,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { BatteryType } from '@prisma/client';

export class UpdatePassportDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  serialNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  model?: string;

  @IsOptional()
  @IsEnum(BatteryType)
  batteryType?: BatteryType;

  @IsOptional()
  @IsString()
  @MinLength(2)
  chemistry?: string;

  @IsOptional()
  @IsDateString()
  productionDate?: string;

  @IsOptional()
  @IsString()
  intendedUse?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  nominalVoltage?: number;

  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  @IsOptional()
  @IsObject()
  materialComposition?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  carbonFootprint?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ghgEmissions?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  manufacturingSiteEmissions?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  recycledContent?: number;

  @IsOptional()
  @IsString()
  recyclingInfo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  circularityScore?: number;

  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  warrantyKm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  stateOfHealth?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  stateOfCharge?: number;
}
