import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PassportsService } from './passports.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { UpdatePassportDto } from './dto/update-passport.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { IsString, IsNotEmpty } from 'class-validator';

class RejectDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

@Controller('passports')
export class PassportsController {
  constructor(private readonly passportsService: PassportsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.passportsService.findAll(user.id, user.role, page, limit, status);
  }

  @Get('public/:passportId')
  getPublic(@Param('passportId') passportId: string) {
    return this.passportsService.getPublicPassport(passportId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.passportsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'MANUFACTURER', 'MATERIAL_SUPPLIER')
  create(@Body() dto: CreatePassportDto, @CurrentUser() user: any) {
    return this.passportsService.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePassportDto,
    @CurrentUser() user: any,
  ) {
    return this.passportsService.update(id, dto, user.id, user.role);
  }

  @Post(':id/submit')
  @UseGuards(AuthGuard('jwt'))
  submit(@Param('id') id: string, @CurrentUser() user: any) {
    return this.passportsService.submit(id, user.id);
  }

  @Post(':id/approve')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.passportsService.approve(id, user.id);
  }

  @Post(':id/reject')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  reject(
    @Param('id') id: string,
    @Body() body: RejectDto,
    @CurrentUser() user: any,
  ) {
    return this.passportsService.reject(id, user.id, body.reason);
  }

  @Post(':id/publish')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  publish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.passportsService.publish(id, user.id);
  }

  @Get(':id/audit-logs')
  @UseGuards(AuthGuard('jwt'))
  getAuditLogs(@Param('id') id: string) {
    return this.passportsService.getAuditLogs(id);
  }

  @Get(':id/verify')
  @UseGuards(AuthGuard('jwt'))
  verifyBlockchain(@Param('id') id: string) {
    return this.passportsService.verifyBlockchain(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.passportsService.delete(id, user.id, user.role);
  }
}
