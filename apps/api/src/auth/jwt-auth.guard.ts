import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service.js';
import type {
  AuthenticatedRequest,
  JwtPayload,
} from './auth.types.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;
    const [type, token] = authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token de acesso não informado.');
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(token);

      if (payload.role !== 'admin') {
        throw new UnauthorizedException('Acesso não autorizado.');
      }

      const admin = await this.prisma.admin.findFirst({
        where: {
          id: payload.sub,
          email: payload.email,
          isActive: true,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (!admin) {
        throw new UnauthorizedException('Administrador não encontrado.');
      }

      request.admin = admin;

      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}
