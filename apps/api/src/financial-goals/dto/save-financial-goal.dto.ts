import {
  IsDateString,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class SaveFinancialGoalDto {
  @ApiProperty({
    example: 'Comprar novos jogos',
    description: 'Nome da meta financeira atual.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(2, 150)
  title!: string;

  @ApiProperty({
    example: '2500.00',
    description: 'Valor positivo com até duas casas decimais.',
  })
  @IsString()
  @Matches(/^(?:0\.(?!00)\d{2}|[1-9]\d*(?:\.\d{1,2})?)$/, {
    message:
      'targetAmount deve ser positivo e possuir até duas casas decimais.',
  })
  targetAmount!: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Data limite no formato AAAA-MM-DD.',
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}
