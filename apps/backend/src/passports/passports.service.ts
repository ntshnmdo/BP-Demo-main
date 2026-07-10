import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { UpdatePassportDto } from './dto/update-passport.dto';
import { BLOCKCHAIN_SERVICE, IBlockchainService } from '../blockchain/blockchain.interface';
import * as crypto from 'crypto';

@Injectable()
export class PassportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @Inject(BLOCKCHAIN_SERVICE) private readonly blockchainService: IBlockchainService,
  ) {}

  private generatePassportId(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 999999)
      .toString()
      .padStart(6, '0');
    return `BAT-${year}-${random}`;
  }

  private computeDataHash(passport: any): string {
    const data = JSON.stringify({
      passportId: passport.passportId,
      serialNumber: passport.serialNumber,
      model: passport.model,
      chemistry: passport.chemistry,
      carbonFootprint: passport.carbonFootprint,
      materialComposition: passport.materialComposition,
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async findAll(
    userId: string,
    role: string,
    page = 1,
    limit = 20,
    status?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    // Role-based filtering
    if (role === 'MANUFACTURER' || role === 'MATERIAL_SUPPLIER') {
      where.createdById = userId;
    }
    // ADMIN, SUSTAINABILITY_TEAM, TESTING_LABORATORY see all

    if (status) {
      where.status = status;
    }

    const [passports, total] = await Promise.all([
      this.prisma.batteryPassport.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          passportId: true,
          status: true,
          serialNumber: true,
          model: true,
          batteryType: true,
          chemistry: true,
          productionDate: true,
          carbonFootprint: true,
          circularityScore: true,
          countryOfOrigin: true,
          createdAt: true,
          updatedAt: true,
          submittedAt: true,
          approvedAt: true,
          publishedAt: true,
          createdBy: { select: { id: true, name: true, organization: true } },
          _count: { select: { certificates: true, documents: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.batteryPassport.count({ where }),
    ]);

    return {
      passports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const passport = await this.prisma.batteryPassport.findFirst({
      where: { OR: [{ id }, { passportId: id }] },
      include: {
        createdBy: { select: { id: true, name: true, email: true, organization: true } },
        approvedBy: { select: { id: true, name: true, email: true, organization: true } },
        certificates: { orderBy: { issuedDate: 'desc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
        auditLogs: {
          include: { actor: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!passport) {
      throw new NotFoundException(`Passport ${id} not found`);
    }

    return passport;
  }

  async create(dto: CreatePassportDto, userId: string) {
    let passportId = this.generatePassportId();
    // Ensure uniqueness
    let attempts = 0;
    while (attempts < 5) {
      const exists = await this.prisma.batteryPassport.findUnique({
        where: { passportId },
      });
      if (!exists) break;
      passportId = this.generatePassportId();
      attempts++;
    }

    const passport = await this.prisma.batteryPassport.create({
      data: {
        passportId,
        serialNumber: dto.serialNumber,
        model: dto.model,
        batteryType: dto.batteryType,
        chemistry: dto.chemistry,
        productionDate: new Date(dto.productionDate),
        intendedUse: dto.intendedUse,
        capacity: dto.capacity,
        nominalVoltage: dto.nominalVoltage,
        countryOfOrigin: dto.countryOfOrigin,
        materialComposition: dto.materialComposition,
        carbonFootprint: dto.carbonFootprint,
        ghgEmissions: dto.ghgEmissions,
        manufacturingSiteEmissions: dto.manufacturingSiteEmissions,
        recycledContent: dto.recycledContent,
        recyclingInfo: dto.recyclingInfo,
        circularityScore: dto.circularityScore,
        warrantyStart: dto.warrantyStart ? new Date(dto.warrantyStart) : undefined,
        warrantyEnd: dto.warrantyEnd ? new Date(dto.warrantyEnd) : undefined,
        warrantyKm: dto.warrantyKm,
        stateOfHealth: dto.stateOfHealth !== undefined ? dto.stateOfHealth : 100,
        stateOfCharge: dto.stateOfCharge !== undefined ? dto.stateOfCharge : 100,
        qrCode: `https://passport.batterypassport.eu/scan/${passportId}`,
        createdById: userId,
        status: 'DRAFT',
      },
    });

    await this.auditService.createLog(
      passport.id,
      'CREATED',
      userId,
      `Battery passport created: ${passport.model} (${passport.serialNumber})`,
    );

    return passport;
  }

  async update(id: string, dto: UpdatePassportDto, userId: string, userRole: string) {
    const passport = await this.prisma.batteryPassport.findFirst({
      where: { OR: [{ id }, { passportId: id }] },
    });

    if (!passport) {
      throw new NotFoundException(`Passport ${id} not found`);
    }

    // Only owner or admin can update; only DRAFT/REJECTED can be edited by owner
    if (
      userRole !== 'ADMIN' &&
      passport.createdById !== userId
    ) {
      throw new ForbiddenException('You do not own this passport');
    }

    if (
      userRole !== 'ADMIN' &&
      !['DRAFT', 'REJECTED'].includes(passport.status)
    ) {
      throw new BadRequestException(
        'Only DRAFT or REJECTED passports can be edited',
      );
    }

    const data: any = {};
    if (dto.serialNumber !== undefined) data.serialNumber = dto.serialNumber;
    if (dto.model !== undefined) data.model = dto.model;
    if (dto.batteryType !== undefined) data.batteryType = dto.batteryType;
    if (dto.chemistry !== undefined) data.chemistry = dto.chemistry;
    if (dto.productionDate !== undefined) data.productionDate = new Date(dto.productionDate);
    if (dto.intendedUse !== undefined) data.intendedUse = dto.intendedUse;
    if (dto.capacity !== undefined) data.capacity = dto.capacity;
    if (dto.nominalVoltage !== undefined) data.nominalVoltage = dto.nominalVoltage;
    if (dto.countryOfOrigin !== undefined) data.countryOfOrigin = dto.countryOfOrigin;
    if (dto.materialComposition !== undefined) data.materialComposition = dto.materialComposition;
    if (dto.carbonFootprint !== undefined) data.carbonFootprint = dto.carbonFootprint;
    if (dto.ghgEmissions !== undefined) data.ghgEmissions = dto.ghgEmissions;
    if (dto.manufacturingSiteEmissions !== undefined) data.manufacturingSiteEmissions = dto.manufacturingSiteEmissions;
    if (dto.recycledContent !== undefined) data.recycledContent = dto.recycledContent;
    if (dto.recyclingInfo !== undefined) data.recyclingInfo = dto.recyclingInfo;
    if (dto.circularityScore !== undefined) data.circularityScore = dto.circularityScore;
    if (dto.warrantyStart !== undefined) data.warrantyStart = new Date(dto.warrantyStart);
    if (dto.warrantyEnd !== undefined) data.warrantyEnd = new Date(dto.warrantyEnd);
    if (dto.warrantyKm !== undefined) data.warrantyKm = dto.warrantyKm;
    if (dto.stateOfHealth !== undefined) data.stateOfHealth = dto.stateOfHealth;
    if (dto.stateOfCharge !== undefined) data.stateOfCharge = dto.stateOfCharge;

    const updated = await this.prisma.batteryPassport.update({
      where: { id: passport.id },
      data,
    });

    await this.auditService.createLog(
      passport.id,
      'UPDATED',
      userId,
      `Passport updated: fields modified`,
    );

    return updated;
  }

  async submit(id: string, userId: string) {
    const passport = await this.prisma.batteryPassport.findFirst({
      where: { OR: [{ id }, { passportId: id }] },
    });

    if (!passport) throw new NotFoundException(`Passport ${id} not found`);
    if (passport.createdById !== userId) {
      throw new ForbiddenException('You do not own this passport');
    }
    if (!['DRAFT', 'REJECTED'].includes(passport.status)) {
      throw new BadRequestException(
        `Cannot submit a passport with status ${passport.status}`,
      );
    }

    const updated = await this.prisma.batteryPassport.update({
      where: { id: passport.id },
      data: { status: 'SUBMITTED', submittedAt: new Date(), rejectionReason: null },
    });

    await this.auditService.createLog(
      passport.id,
      'SUBMITTED',
      userId,
      `Passport submitted for regulatory approval`,
    );

    return updated;
  }

  async approve(id: string, adminId: string) {
    const passport = await this.prisma.batteryPassport.findFirst({
      where: { OR: [{ id }, { passportId: id }] },
    });

    if (!passport) throw new NotFoundException(`Passport ${id} not found`);
    if (passport.status !== 'SUBMITTED') {
      throw new BadRequestException(
        `Passport must be in SUBMITTED status to approve. Current: ${passport.status}`,
      );
    }

    // Compute and store blockchain hash
    const dataHash = this.computeDataHash(passport);
    const blockchainResult = await this.blockchainService.storeHash(
      passport.passportId,
      dataHash,
    );

    const updated = await this.prisma.batteryPassport.update({
      where: { id: passport.id },
      data: {
        status: 'APPROVED',
        approvedById: adminId,
        approvedAt: new Date(),
        blockchainHash: dataHash,
        blockchainTx: blockchainResult.txHash,
        rejectionReason: null,
      },
    });

    await this.auditService.createLog(
      passport.id,
      'APPROVED',
      adminId,
      `Passport approved. Blockchain TX: ${blockchainResult.txHash}`,
      { txHash: blockchainResult.txHash, dataHash },
    );

    return updated;
  }

  async reject(id: string, adminId: string, reason: string) {
    const passport = await this.prisma.batteryPassport.findFirst({
      where: { OR: [{ id }, { passportId: id }] },
    });

    if (!passport) throw new NotFoundException(`Passport ${id} not found`);
    if (passport.status !== 'SUBMITTED') {
      throw new BadRequestException(
        `Passport must be in SUBMITTED status to reject. Current: ${passport.status}`,
      );
    }

    const updated = await this.prisma.batteryPassport.update({
      where: { id: passport.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    });

    await this.auditService.createLog(
      passport.id,
      'REJECTED',
      adminId,
      `Passport rejected. Reason: ${reason}`,
      { reason },
    );

    return updated;
  }

  async publish(id: string, adminId: string) {
    const passport = await this.prisma.batteryPassport.findFirst({
      where: { OR: [{ id }, { passportId: id }] },
    });

    if (!passport) throw new NotFoundException(`Passport ${id} not found`);
    if (passport.status !== 'APPROVED') {
      throw new BadRequestException(
        `Passport must be in APPROVED status to publish. Current: ${passport.status}`,
      );
    }

    const updated = await this.prisma.batteryPassport.update({
      where: { id: passport.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    await this.auditService.createLog(
      passport.id,
      'PUBLISHED',
      adminId,
      `Passport published to public registry`,
    );

    return updated;
  }

  async getPublicPassport(passportId: string) {
    const passport = await this.prisma.batteryPassport.findFirst({
      where: {
        OR: [{ id: passportId }, { passportId }, { serialNumber: passportId }],
      },
      select: {
        passportId: true,
        serialNumber: true,
        qrCode: true,
        model: true,
        batteryType: true,
        chemistry: true,
        productionDate: true,
        intendedUse: true,
        capacity: true,
        nominalVoltage: true,
        countryOfOrigin: true,
        materialComposition: true,
        carbonFootprint: true,
        ghgEmissions: true,
        recycledContent: true,
        recyclingInfo: true,
        circularityScore: true,
        blockchainHash: true,
        blockchainTx: true,
        warrantyStart: true,
        warrantyEnd: true,
        warrantyKm: true,
        publishedAt: true,
        createdBy: { select: { name: true, organization: true } },
        certificates: {
          select: {
            type: true,
            issuer: true,
            issuedDate: true,
            expiryDate: true,
            status: true,
          },
        },
      },
    });

    if (!passport) {
      throw new NotFoundException(`Published passport ${passportId} not found`);
    }

    return passport;
  }

  async getAuditLogs(passportId: string) {
    const passport = await this.prisma.batteryPassport.findFirst({
      where: { OR: [{ id: passportId }, { passportId }] },
    });

    if (!passport) throw new NotFoundException(`Passport ${passportId} not found`);

    return this.prisma.auditLog.findMany({
      where: { passportId: passport.id },
      include: {
        actor: { select: { id: true, name: true, role: true, organization: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async verifyBlockchain(id: string) {
    const passport = await this.prisma.batteryPassport.findFirst({
      where: { OR: [{ id }, { passportId: id }] },
    });

    if (!passport) throw new NotFoundException(`Passport ${id} not found`);
    if (!passport.blockchainHash) {
      return { verified: false, message: 'No blockchain record found' };
    }

    const currentHash = this.computeDataHash(passport);
    const isValid = await this.blockchainService.verifyHash(
      passport.passportId,
      currentHash,
    );

    return {
      verified: isValid,
      storedHash: passport.blockchainHash,
      currentHash,
      txHash: passport.blockchainTx,
      message: isValid ? 'Blockchain integrity verified' : 'Data tampering detected',
    };
  }

  async delete(id: string, userId: string, userRole: string) {
    const passport = await this.prisma.batteryPassport.findFirst({
      where: { OR: [{ id }, { passportId: id }] },
    });

    if (!passport) throw new NotFoundException(`Passport ${id} not found`);

    if (passport.createdById !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to delete this passport');
    }

    return this.prisma.batteryPassport.delete({
      where: { id: passport.id },
    });
  }
}
