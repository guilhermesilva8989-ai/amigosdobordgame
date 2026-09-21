import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';

@ApiTags('Consulta pública')
@Controller('public/dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Retorna todos os dados do painel público',
  })
  @ApiOkResponse({
    description:
      'Resumo, meta, participantes anônimos e movimentações.',
  })
  findAll() {
    return this.dashboardService.getPublicDashboard();
  }
}
