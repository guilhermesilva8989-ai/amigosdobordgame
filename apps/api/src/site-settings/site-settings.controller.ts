import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SaveSiteSettingsDto } from './dto/save-site-settings.dto.js';
import { SiteSettingsService } from './site-settings.service.js';

@ApiTags('Administração — Página inicial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/site-settings')
export class SiteSettingsController {
  constructor(
    private readonly siteSettingsService: SiteSettingsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Consulta as configurações da página inicial',
  })
  @ApiOkResponse({
    description: 'Configurações atuais da página inicial.',
  })
  find() {
    return this.siteSettingsService.find();
  }

  @Put()
  @ApiOperation({
    summary: 'Atualiza as configurações da página inicial',
  })
  @ApiOkResponse({
    description: 'Configurações atualizadas.',
  })
  save(
    @Body() dto: SaveSiteSettingsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.siteSettingsService.save(
      dto,
      request.admin.id,
    );
  }
}