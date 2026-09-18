import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';

import { AppService } from './app.service.js';
import type { HealthResponse } from './app.service.js';

class HealthResponseDto implements HealthResponse {
  @ApiProperty({ example: 'ok' })
  status!: 'ok';

  @ApiProperty({ example: 'amigos-do-board-game-api' })
  service!: string;

  @ApiProperty({ example: '1.0.0' })
  version!: string;

  @ApiProperty({ example: 'development' })
  environment!: string;

  @ApiProperty({ example: 120 })
  uptimeSeconds!: number;

  @ApiProperty({ example: '2026-09-18T09:30:00.000Z' })
  timestamp!: string;
}

@ApiTags('Sistema')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Verifica a saúde da API',
    description:
      'Retorna o status, a versão e o tempo de execução do serviço.',
  })
  @ApiOkResponse({
    description: 'API funcionando corretamente.',
    type: HealthResponseDto,
  })
  getHealth(): HealthResponse {
    return this.appService.getHealth();
  }
}
