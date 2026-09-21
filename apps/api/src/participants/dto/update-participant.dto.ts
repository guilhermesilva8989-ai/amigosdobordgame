import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateParticipantDto {
  @ApiPropertyOptional({ example: 'Nome atualizado' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Permite ativar ou desativar sem apagar o histórico',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
