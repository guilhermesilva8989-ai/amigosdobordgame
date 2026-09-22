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
import { SaveFinancialGoalDto } from './dto/save-financial-goal.dto.js';
import { FinancialGoalsService } from './financial-goals.service.js';

@ApiTags('Administração — Meta financeira')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/financial-goal')
export class FinancialGoalsController {
  constructor(
    private readonly financialGoalsService: FinancialGoalsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Consulta a meta financeira ativa' })
  @ApiOkResponse({ description: 'Meta ativa ou null.' })
  findActive() {
    return this.financialGoalsService.findActive();
  }

  @Put()
  @ApiOperation({ summary: 'Cria ou atualiza a meta financeira' })
  @ApiOkResponse({ description: 'Meta financeira salva.' })
  save(
    @Body() dto: SaveFinancialGoalDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.financialGoalsService.save(
      dto,
      request.admin.id,
    );
  }
}
