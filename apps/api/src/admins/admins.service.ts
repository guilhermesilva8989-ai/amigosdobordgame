import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'argon2';
import { PrismaService } from '../database/prisma.service.js';
import { CreateAdminDto } from './dto/create-admin.dto.js';

const publicAdmin = {
  id: true, name: true, email: true, isActive: true,
  createdAt: true, lastLoginAt: true,
} as const;

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.admin.findMany({
      where: { deletedAt: null },
      select: publicAdmin,
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateAdminDto, createdById: string) {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await hash(dto.password);
    const existing = await this.prisma.admin.findUnique({ where: { email }, select: { id: true } });
    if (existing) throw new ConflictException('Este e-mail já foi utilizado por um administrador.');

    try {
      return await this.prisma.$transaction(async (tx) => {
        const admin = await tx.admin.create({
          data: { name: dto.name.trim(), email, passwordHash },
          select: publicAdmin,
        });
        await tx.auditLog.create({ data: {
          action: 'CREATE', entity: 'Admin', entityId: admin.id,
          createdById, details: { email },
        } });
        return admin;
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Este e-mail já foi utilizado por um administrador.');
      }
      throw error;
    }
  }

  async remove(id: string, removedById: string) {
    if (id === removedById) throw new ForbiddenException('Você não pode remover sua própria conta.');
    try {
      return await this.prisma.$transaction(async (tx) => {
        const admin = await tx.admin.findUnique({ where: { id }, select: { id: true, email: true, deletedAt: true } });
        if (!admin || admin.deletedAt) throw new NotFoundException('Administrador não encontrado.');

        const activeCount = await tx.admin.count({ where: { isActive: true, deletedAt: null } });
        if (activeCount <= 1) throw new ConflictException('É necessário manter pelo menos um administrador ativo.');

        await tx.admin.update({ where: { id }, data: { isActive: false, deletedAt: new Date() } });
        await tx.auditLog.create({ data: {
          action: 'DELETE', entity: 'Admin', entityId: id,
          createdById: removedById, details: { email: admin.email },
        } });
        return { message: 'Acesso do administrador removido. O histórico foi preservado.' };
      }, { isolationLevel: 'Serializable' });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2034') {
        throw new ConflictException('Outra alteração ocorreu ao mesmo tempo. Tente novamente.');
      }
      throw error;
    }
  }
}
