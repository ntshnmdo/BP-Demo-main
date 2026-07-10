import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(
    passportId: string,
    action: AuditAction,
    actorId: string,
    details?: string,
    metadata?: Record<string, any>,
  ) {
    return this.prisma.auditLog.create({
      data: {
        passportId,
        action,
        actorId,
        details,
        metadata: metadata as any,
      },
      include: {
        actor: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async findByPassport(passportId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { passportId },
      include: {
        actor: {
          select: { id: true, name: true, role: true, organization: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByActor(actorId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { actorId },
      include: {
        passport: {
          select: { passportId: true, model: true, serialNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
