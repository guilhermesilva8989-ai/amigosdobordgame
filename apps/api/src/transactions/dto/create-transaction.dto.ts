import {
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    enum: ['ENTRY', 'EXPENSE'],
    example: 'ENTRY',
    description: 'ENTRY para entrada ou EXPENSE para despesa.',
  })
  @IsIn(['ENTRY', 'EXPENSE'])
  type!: 'ENTRY' | 'EXPENSE';

  @ApiProperty({
    example: '150.00',
    description: 'Valor positivo com até duas casas decimais.',
  })
  @IsString()
  @Matches(/^(?:0\.(?!00)\d{2}|[1-9]\d*(?:\.\d{1,2})?)$/, {
    message:
      'amount deve ser positivo e possuir até duas casas decimais.',
  })
  amount!: string;

  @ApiProperty({
    example: 'Contribuição mensal',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description!: string;

  @ApiPropertyOptional({
    example: '2026-09',
    description: 'Mês de referência no formato AAAA-MM.',
  })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'referenceMonth deve estar no formato AAAA-MM.',
  })
  referenceMonth?: string;

  @ApiPropertyOptional({
    example: '2026-09-21T18:30:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  occurredAt?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Participante relacionado à movimentação.',
  })
  @IsOptional()
  @IsUUID()
  participantId?: string;
}
