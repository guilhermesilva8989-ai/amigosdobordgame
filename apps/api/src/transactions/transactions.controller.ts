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
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { TransactionsService } from './transactions.service.js';

@ApiTags('Administração — Movimentações')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registra uma entrada ou despesa' })
  @ApiCreatedResponse({
    description: 'Movimentação registrada.',
  })
  create(
    @Body() dto: CreateTransactionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.transactionsService.create(
      dto,
      request.admin.id,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Lista movimentações para o administrador',
  })
  @ApiOkResponse({
    description: 'Listagem administrativa completa.',
  })
  findAll() {
    return this.transactionsService.findAllAdmin();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma movimentação' })
  @ApiOkResponse({ description: 'Movimentação atualizada.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.transactionsService.update(
      id,
      dto,
      request.admin.id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma movimentação' })
  @ApiOkResponse({ description: 'Movimentação removida.' })
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.transactionsService.remove(
      id,
      request.admin.id,
    );
  }
}

@ApiTags('Consulta pública')
@Controller('public/transactions')
export class PublicTransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Retorna entradas, despesas e saldo',
  })
  @ApiOkResponse({
    description: 'Resumo financeiro público.',
  })
  summary() {
    return this.transactionsService.getPublicSummary();
  }

  @Get()
  @ApiOperation({
    summary: 'Lista as movimentações públicas recentes',
  })
  @ApiOkResponse({
    description:
      'A resposta não contém nomes reais de participantes.',
  })
  findAll() {
    return this.transactionsService.findAllPublic();
  }
}
