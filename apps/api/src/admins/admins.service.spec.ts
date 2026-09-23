import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../database/prisma.service.js';
import { AdminsService } from './admins.service.js';

describe('AdminsService', () => {
  it('não lista contas removidas nem retorna senhas', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const service = new AdminsService({ admin: { findMany } } as unknown as PrismaService);
    await service.list();
    expect(findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      select: {
        id: true, name: true, email: true, isActive: true,
        createdAt: true, lastLoginAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('impede remover a própria conta', async () => {
    const transaction = vi.fn();
    const service = new AdminsService({ $transaction: transaction } as unknown as PrismaService);
    await expect(service.remove('meu-id', 'meu-id')).rejects.toThrow('própria conta');
    expect(transaction).not.toHaveBeenCalled();
  });

  it('impede remover a última conta ativa', async () => {
    const update = vi.fn();
    const tx = {
      admin: {
        findUnique: vi.fn().mockResolvedValue({ id: 'outro', email: 'outro@exemplo.com', deletedAt: null }),
        count: vi.fn().mockResolvedValue(1), update,
      },
    };
    const prisma = {
      $transaction: vi.fn((callback: (db: typeof tx) => Promise<unknown>) => callback(tx)),
    } as unknown as PrismaService;
    const service = new AdminsService(prisma);
    await expect(service.remove('outro', 'meu-id')).rejects.toThrow('pelo menos um administrador');
    expect(update).not.toHaveBeenCalled();
  });

  it('revoga o acesso sem apagar dados financeiros', async () => {
    const update = vi.fn();
    const create = vi.fn();
    const tx = {
      admin: {
        findUnique: vi.fn().mockResolvedValue({ id: 'outro', email: 'outro@exemplo.com', deletedAt: null }),
        count: vi.fn().mockResolvedValue(2), update,
      },
      auditLog: { create },
    };
    const prisma = {
      $transaction: vi.fn((callback: (db: typeof tx) => Promise<unknown>) => callback(tx)),
    } as unknown as PrismaService;
    await new AdminsService(prisma).remove('outro', 'meu-id');
    expect(update).toHaveBeenCalledWith({
      where: { id: 'outro' },
      data: { isActive: false, deletedAt: expect.any(Date) },
    });
    expect(create).toHaveBeenCalledWith({ data: expect.objectContaining({ action: 'DELETE', createdById: 'meu-id' }) });
  });
});
