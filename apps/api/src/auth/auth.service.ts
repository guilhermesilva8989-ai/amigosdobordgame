import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { PrismaService } from '../database/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: loginDto.email },
    });

    const validPassword =
      admin?.isActive === true &&
      (await verify(admin.passwordHash, loginDto.password));

    if (!admin || !validPassword) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const loggedAt = new Date();

    await this.prisma.$transaction([
      this.prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: loggedAt },
      }),
      this.prisma.auditLog.create({
        data: {
          action: 'LOGIN',
          entity: 'Admin',
          entityId: admin.id,
          createdById: admin.id,
          details: {
            email: admin.email,
            loggedAt: loggedAt.toISOString(),
          },
        },
      }),
    ]);

    const accessToken = await this.jwtService.signAsync({
      sub: admin.id,
      email: admin.email,
      role: 'admin',
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '2h'),
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    };
  }
}
