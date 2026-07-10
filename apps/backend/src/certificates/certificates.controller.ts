import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  CertificatesService,
  CreateCertificateDto,
  UpdateCertificateDto,
} from './certificates.service';

@Controller('passports/:passportId/certificates')
@UseGuards(AuthGuard('jwt'))
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  findAll(@Param('passportId') passportId: string) {
    return this.certificatesService.findByPassport(passportId);
  }

  @Post()
  create(
    @Param('passportId') passportId: string,
    @Body() dto: CreateCertificateDto,
  ) {
    return this.certificatesService.create(passportId, dto);
  }

  @Patch(':certId')
  update(
    @Param('certId') certId: string,
    @Body() dto: UpdateCertificateDto,
  ) {
    return this.certificatesService.update(certId, dto);
  }

  @Delete(':certId')
  remove(@Param('certId') certId: string) {
    return this.certificatesService.remove(certId);
  }
}
