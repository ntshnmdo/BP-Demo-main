import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findByPassport(passportId: string) {
    const passport = await this.prisma.batteryPassport.findFirst({
      where: { OR: [{ id: passportId }, { passportId }] },
    });

    if (!passport) {
      throw new NotFoundException(`Passport ${passportId} not found`);
    }

    return this.prisma.document.findMany({
      where: { passportId: passport.id },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async create(
    passportId: string,
    file: Express.Multer.File,
    docType: string,
    userId: string,
  ) {
    const passport = await this.prisma.batteryPassport.findFirst({
      where: { OR: [{ id: passportId }, { passportId }] },
    });

    if (!passport) {
      throw new NotFoundException(`Passport ${passportId} not found`);
    }

    const fileUrl = `/uploads/${file.filename}`;

    const document = await this.prisma.document.create({
      data: {
        passportId: passport.id,
        name: file.originalname,
        type: docType || 'GENERAL',
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });

    await this.auditService.createLog(
      passport.id,
      'DOCUMENT_UPLOADED',
      userId,
      `Document uploaded: ${file.originalname} (${docType})`,
      { documentId: document.id, fileSize: file.size, mimeType: file.mimetype },
    );

    return document;
  }

  async remove(id: string, userId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException(`Document ${id} not found`);

    // Remove file from disk if it exists
    const filePath = path.join(process.cwd(), doc.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.prisma.document.delete({ where: { id } });
    return { message: `Document ${id} deleted` };
  }
}
