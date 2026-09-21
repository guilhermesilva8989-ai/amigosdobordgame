import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../database/prisma.service.js';
import { TransactionsService } from './transactions.service.js';

describe('TransactionsService', () => {
  it('calcula entradas, despesas e saldo corretamente', async () => {
    const aggregate = vi
      .fn()
      .mockResolvedValueOnce({
        _sum: { amount: '100.00' },
      })
      .mockResolvedValueOnce({
        _sum: { amount: '25.50' },
      });

    const prisma = {
      transaction: {
        aggregate,
      },
    } as unknown as PrismaService;

    const service = new TransactionsService(prisma);

    await expect(service.getPublicSummary()).resolves.toEqual({
      totalEntries: 100,
      totalExpenses: 25.5,
      balance: 74.5,
    });

    expect(aggregate).toHaveBeenCalledTimes(2);
  });

  it('retorna zeros quando não existem movimentações', async () => {
    const aggregate = vi
      .fn()
      .mockResolvedValue({
        _sum: { amount: null },
      });

    const prisma = {
      transaction: {
        aggregate,
      },
    } as unknown as PrismaService;

    const service = new TransactionsService(prisma);

    await expect(service.getPublicSummary()).resolves.toEqual({
      totalEntries: 0,
      totalExpenses: 0,
      balance: 0,
    });
  });

  it('não expõe nomes reais no histórico público', async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 'transaction-01',
        type: 'ENTRY',
        amount: {
          toString: () => '100.00',
        },
        description: 'Contribuição mensal',
        referenceMonth: new Date('2026-09-01T00:00:00.000Z'),
        occurredAt: new Date('2026-09-21T18:00:00.000Z'),
        participant: {
          publicCode: 'BG-00000001',
          name: 'Nome Real Protegido',
        },
        createdBy: {
          name: 'Administrador Protegido',
        },
      },
    ]);

    const prisma = {
      transaction: {
        findMany,
      },
    } as unknown as PrismaService;

    const service = new TransactionsService(prisma);
    const result = await service.findAllPublic();

    expect(result).toEqual([
      {
        id: 'transaction-01',
        type: 'ENTRY',
        amount: '100.00',
        description: 'Contribuição mensal',
        referenceMonth: new Date(
          '2026-09-01T00:00:00.000Z',
        ),
        occurredAt: new Date(
          '2026-09-21T18:00:00.000Z',
        ),
        participantCode: 'BG-00000001',
      },
    ]);

    const serializedResult = JSON.stringify(result);

    expect(serializedResult).not.toContain(
      'Nome Real Protegido',
    );

    expect(serializedResult).not.toContain(
      'Administrador Protegido',
    );
  });
});
