import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminsService } from './admins.service.js';
import { CreateAdminDto } from './dto/create-admin.dto.js';

@ApiTags('Administração — Administradores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista administradores com acesso' })
  @ApiOkResponse({ description: 'Administradores ativos.' })
  list() { return this.adminsService.list(); }

  @Post()
  @ApiOperation({ summary: 'Cria administrador com senha protegida' })
  @ApiCreatedResponse({ description: 'Administrador criado.' })
  create(@Body() dto: CreateAdminDto, @Req() request: AuthenticatedRequest) {
    return this.adminsService.create(dto, request.admin.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoga o acesso de um administrador preservando o histórico' })
  @ApiOkResponse({ description: 'Acesso removido.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string, @Req() request: AuthenticatedRequest) {
    return this.adminsService.remove(id, request.admin.id);
  }
}
