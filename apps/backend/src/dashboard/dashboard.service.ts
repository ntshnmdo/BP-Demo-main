import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId: string, role: string) {
    const isAdminLike = ['ADMIN', 'SUSTAINABILITY_TEAM', 'TESTING_LABORATORY'].includes(role);
    const where = isAdminLike ? {} : { createdById: userId };

    const [
      total,
      draft,
      submitted,
      approved,
      published,
      rejected,
      totalUsers,
      totalCertificates,
    ] = await Promise.all([
      this.prisma.batteryPassport.count({ where }),
      this.prisma.batteryPassport.count({ where: { ...where, status: 'DRAFT' } }),
      this.prisma.batteryPassport.count({ where: { ...where, status: 'SUBMITTED' } }),
      this.prisma.batteryPassport.count({ where: { ...where, status: 'APPROVED' } }),
      this.prisma.batteryPassport.count({ where: { ...where, status: 'PUBLISHED' } }),
      this.prisma.batteryPassport.count({ where: { ...where, status: 'REJECTED' } }),
      isAdminLike ? this.prisma.user.count() : Promise.resolve(undefined),
      this.prisma.certificate.count(),
    ]);

    const carbonStats = await this.prisma.batteryPassport.aggregate({
      where: { ...where, carbonFootprint: { not: null } },
      _avg: { carbonFootprint: true, circularityScore: true, recycledContent: true },
    });

    return {
      passports: {
        total,
        draft,
        submitted,
        approved,
        published,
        rejected,
      },
      averages: {
        carbonFootprint: Math.round((carbonStats._avg.carbonFootprint || 0) * 10) / 10,
        circularityScore: Math.round((carbonStats._avg.circularityScore || 0) * 10) / 10,
        recycledContent: Math.round((carbonStats._avg.recycledContent || 0) * 10) / 10,
      },
      totalCertificates,
      ...(isAdminLike && { totalUsers }),
    };
  }

  async getRecentActivity(userId: string, role: string, limit = 10) {
    const isAdminLike = ['ADMIN', 'SUSTAINABILITY_TEAM', 'TESTING_LABORATORY'].includes(role);

    const where: any = {};
    if (!isAdminLike) {
      // Get passports owned by user
      const userPassports = await this.prisma.batteryPassport.findMany({
        where: { createdById: userId },
        select: { id: true },
      });
      where.passportId = { in: userPassports.map((p) => p.id) };
    }

    return this.prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { id: true, name: true, role: true } },
        passport: {
          select: {
            id: true,
            passportId: true,
            model: true,
            serialNumber: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUpcomingTasks(userId: string, role: string) {
    const tasks: any[] = [];

    if (role === 'ADMIN') {
      // Submitted passports awaiting review
      const pendingReview = await this.prisma.batteryPassport.findMany({
        where: { status: 'SUBMITTED' },
        select: {
          id: true,
          passportId: true,
          model: true,
          serialNumber: true,
          submittedAt: true,
          createdBy: { select: { name: true, organization: true } },
        },
        orderBy: { submittedAt: 'asc' },
        take: 10,
      });

      tasks.push(
        ...pendingReview.map((p) => ({
          type: 'REVIEW_REQUIRED',
          priority: 'HIGH',
          passport: p,
          message: `Passport ${p.passportId} is awaiting regulatory review`,
          submittedAt: p.submittedAt,
        })),
      );

      // Approved passports awaiting publication
      const pendingPublish = await this.prisma.batteryPassport.findMany({
        where: { status: 'APPROVED' },
        select: {
          id: true,
          passportId: true,
          model: true,
          serialNumber: true,
          approvedAt: true,
          createdBy: { select: { name: true, organization: true } },
        },
        orderBy: { approvedAt: 'asc' },
        take: 10,
      });

      tasks.push(
        ...pendingPublish.map((p) => ({
          type: 'PUBLICATION_REQUIRED',
          priority: 'MEDIUM',
          passport: p,
          message: `Passport ${p.passportId} is approved and ready to publish`,
          approvedAt: p.approvedAt,
        })),
      );
    } else {
      // Draft passports not submitted yet
      const drafts = await this.prisma.batteryPassport.findMany({
        where: { status: 'DRAFT', createdById: userId },
        select: {
          id: true,
          passportId: true,
          model: true,
          serialNumber: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      });

      tasks.push(
        ...drafts.map((p) => ({
          type: 'SUBMIT_DRAFT',
          priority: 'MEDIUM',
          passport: p,
          message: `Draft passport ${p.passportId} is ready for submission`,
        })),
      );

      // Rejected passports needing re-work
      const rejected = await this.prisma.batteryPassport.findMany({
        where: { status: 'REJECTED', createdById: userId },
        select: {
          id: true,
          passportId: true,
          model: true,
          serialNumber: true,
          rejectedAt: true,
          rejectionReason: true,
        },
        orderBy: { rejectedAt: 'desc' },
        take: 5,
      });

      tasks.push(
        ...rejected.map((p) => ({
          type: 'REWORK_REQUIRED',
          priority: 'HIGH',
          passport: p,
          message: `Passport ${p.passportId} was rejected and needs revision`,
          rejectionReason: p.rejectionReason,
        })),
      );
    }

    return tasks;
  }

  async getComplianceOverview() {
    const [totalCerts, compliantCerts, expiringCerts, expiredCerts] =
      await Promise.all([
        this.prisma.certificate.count(),
        this.prisma.certificate.count({ where: { status: 'COMPLIANT' } }),
        this.prisma.certificate.count({
          where: {
            expiryDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
            },
            status: 'COMPLIANT',
          },
        }),
        this.prisma.certificate.count({
          where: {
            expiryDate: { lt: new Date() },
          },
        }),
      ]);

    const certsByType = await this.prisma.certificate.groupBy({
      by: ['type'],
      _count: { id: true },
    });

    const publishedPassports = await this.prisma.batteryPassport.count({
      where: { status: 'PUBLISHED' },
    });

    const avgCircularity = await this.prisma.batteryPassport.aggregate({
      where: { status: 'PUBLISHED', circularityScore: { not: null } },
      _avg: { circularityScore: true, recycledContent: true, carbonFootprint: true },
    });

    return {
      certificates: {
        total: totalCerts,
        compliant: compliantCerts,
        expiringIn90Days: expiringCerts,
        expired: expiredCerts,
        complianceRate:
          totalCerts > 0
            ? Math.round((compliantCerts / totalCerts) * 100)
            : 0,
        byType: certsByType.map((c) => ({ type: c.type, count: c._count.id })),
      },
      publishedPassports,
      averages: {
        circularityScore: Math.round((avgCircularity._avg.circularityScore || 0) * 10) / 10,
        recycledContent: Math.round((avgCircularity._avg.recycledContent || 0) * 10) / 10,
        carbonFootprint: Math.round((avgCircularity._avg.carbonFootprint || 0) * 10) / 10,
      },
    };
  }
}
