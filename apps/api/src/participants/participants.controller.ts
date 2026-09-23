import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateParticipantDto } from './dto/create-participant.dto.js';
import { UpdateParticipantDto } from './dto/update-participant.dto.js';
import { ParticipantsService } from './participants.service.js';

@ApiTags('Administração — Participantes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/participants')
export class ParticipantsController {
  constructor(
    private readonly participantsService: ParticipantsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um participante' })
  @ApiCreatedResponse({ description: 'Participante cadastrado.' })
  create(
    @Body() dto: CreateParticipantDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.participantsService.create(dto, request.admin.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista participantes com nomes reais' })
  @ApiOkResponse({ description: 'Listagem administrativa.' })
  findAll() {
    return this.participantsService.findAllAdmin();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Exclui participante sem movimentações' })
  @ApiOkResponse({ description: 'Participante excluído.' })
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.participantsService.remove(id, request.admin.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza ou desativa um participante' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateParticipantDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.participantsService.update(
      id,
      dto,
      request.admin.id,
    );
  }
}

@ApiTags('Consulta pública')
@Controller('public/participants')
export class PublicParticipantsController {
  constructor(
    private readonly participantsService: ParticipantsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lista participantes utilizando nomes fantasia',
  })
  @ApiOkResponse({
    description: 'O nome real nunca é retornado.',
  })
  findAll() {
    return this.participantsService.findAllPublic();
  }
}
