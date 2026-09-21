import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from './auth.types.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica o administrador' })
  @ApiOkResponse({
    description: 'Autenticação realizada com sucesso.',
    schema: {
      example: {
        accessToken: 'token-jwt',
        tokenType: 'Bearer',
        expiresIn: '2h',
        admin: {
          id: 'uuid',
          name: 'Administrador',
          email: 'admin@exemplo.com',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'E-mail ou senha inválidos.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna o administrador autenticado' })
  @ApiOkResponse({
    description: 'Administrador autenticado.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token inválido, expirado ou não informado.',
  })
  me(@Req() request: AuthenticatedRequest) {
    return request.admin;
  }
}
