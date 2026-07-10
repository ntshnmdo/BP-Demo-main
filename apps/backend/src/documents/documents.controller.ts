import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { DocumentsService } from './documents.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Controller('passports/:passportId/documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll(@Param('passportId') passportId: string) {
    return this.documentsService.findByPassport(passportId);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
      fileFilter: (req, file, callback) => {
        const allowed = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowed.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              `File type ${file.mimetype} not allowed`,
            ),
            false,
          );
        }
      },
    }),
  )
  upload(
    @Param('passportId') passportId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: string,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.documentsService.create(passportId, file, type || 'GENERAL', user.id);
  }

  @Delete(':docId')
  remove(@Param('docId') docId: string, @CurrentUser() user: any) {
    return this.documentsService.remove(docId, user.id);
  }
}
