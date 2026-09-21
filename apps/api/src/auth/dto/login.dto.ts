import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@exemplo.com',
    description: 'E-mail do administrador',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email!: string;

  @ApiProperty({
    example: 'senha-segura-123',
    minLength: 12,
    description: 'Senha do administrador',
  })
  @IsString()
  @MinLength(12, {
    message: 'A senha deve possuir pelo menos 12 caracteres.',
  })
  password!: string;
}
