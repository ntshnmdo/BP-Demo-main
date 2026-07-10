import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  type: string;

  @IsString()
  issuer: string;

  @IsDateString()
  issuedDate: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}

export class UpdateCertificateDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  issuer?: string;

  @IsOptional()
  @IsDateString()
  issuedDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPassport(passportId: string) {
    const passport = await this.prisma.batteryPassport.findFirst({
      where: { OR: [{ id: passportId }, { passportId }] },
    });

    if (!passport) {
      throw new NotFoundException(`Passport ${passportId} not found`);
    }

    return this.prisma.certificate.findMany({
      where: { passportId: passport.id },
      orderBy: { issuedDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const cert = await this.prisma.certificate.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException(`Certificate ${id} not found`);
    return cert;
  }

  async create(passportId: string, dto: CreateCertificateDto) {
    const passport = await this.prisma.batteryPassport.findFirst({
      where: { OR: [{ id: passportId }, { passportId }] },
    });

    if (!passport) {
      throw new NotFoundException(`Passport ${passportId} not found`);
    }

    return this.prisma.certificate.create({
      data: {
        passportId: passport.id,
        type: dto.type,
        issuer: dto.issuer,
        issuedDate: new Date(dto.issuedDate),
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        status: dto.status || 'COMPLIANT',
        fileUrl: dto.fileUrl,
      },
    });
  }

  async update(id: string, dto: UpdateCertificateDto) {
    const cert = await this.prisma.certificate.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException(`Certificate ${id} not found`);

    const data: any = {};
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.issuer !== undefined) data.issuer = dto.issuer;
    if (dto.issuedDate !== undefined) data.issuedDate = new Date(dto.issuedDate);
    if (dto.expiryDate !== undefined) data.expiryDate = new Date(dto.expiryDate);
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.fileUrl !== undefined) data.fileUrl = dto.fileUrl;

    return this.prisma.certificate.update({ where: { id }, data });
  }

  async remove(id: string) {
    const cert = await this.prisma.certificate.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException(`Certificate ${id} not found`);

    await this.prisma.certificate.delete({ where: { id } });
    return { message: `Certificate ${id} deleted` };
  }
}
