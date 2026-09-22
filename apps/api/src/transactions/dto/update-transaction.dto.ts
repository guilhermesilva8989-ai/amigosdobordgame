import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTransactionDto {
  @ApiPropertyOptional({
    example: '40.00',
    description: 'Novo valor positivo da movimentação.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(?:0\.(?!00)\d{2}|[1-9]\d*(?:\.\d{1,2})?)$/, {
    message:
      'amount deve ser positivo e possuir até duas casas decimais.',
  })
  amount?: string;

  @ApiPropertyOptional({
    example: 'Contribuição mensal',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description?: string;
}
