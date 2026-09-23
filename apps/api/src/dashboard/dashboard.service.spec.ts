import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../database/prisma.service.js';
import { ParticipantAliasService } from '../participants/participant-alias.service.js';
import { SiteSettingsService } from '../site-settings/site-settings.service.js';
import { DashboardService } from './dashboard.service.js';

describe('DashboardService', () => {
  it('monta o painel sem expor nomes reais', async () => {
    const prisma = {
      transaction: {
        aggregate: vi
          .fn()
          .mockResolvedValueOnce({
            _sum: { amount: '100.00' },
          })
          .mockResolvedValueOnce({
            _sum: { amount: '25.50' },
          }),
        groupBy: vi.fn().mockResolvedValue([
          {
            participantId: 'participant-01',
            _sum: { amount: '100.00' },
          },
        ]),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'transaction-01',
            type: 'ENTRY',
            amount: {
              toString: () => '100.00',
            },
            description: 'Contribuição mensal',
            occurredAt: new Date(
              '2026-09-21T18:00:00.000Z',
            ),
            participantId: 'participant-01',
          },
        ]),
      },
      participant: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'participant-01',
            publicCode: 'BG-00000001',
            name: 'Nome Real Protegido',
            joinedAt: new Date(
              '2026-09-01T00:00:00.000Z',
            ),
          },
        ]),
      },
      financialGoal: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService;

    const siteSettingsService = {
      find: vi.fn().mockResolvedValue({
        id: 'main',
        heroTitle:
          'Diversão organizada, contas transparentes.',
        heroDescription:
          'Acompanhe as contribuições, despesas e o saldo do grupo.',
        bannerUrl: '/banner.jpeg',
        showGoal: true,
        nameDisplayMode: 'FANTASY',
      }),
    } as unknown as SiteSettingsService;

    const service = new DashboardService(
      prisma,
      new ParticipantAliasService(),
      siteSettingsService,
    );

    const result = await service.getPublicDashboard();
    const serializedResult = JSON.stringify(result);

    expect(result.settings).toEqual({
      heroTitle:
        'Diversão organizada, contas transparentes.',
      heroDescription:
        'Acompanhe as contribuições, despesas e o saldo do grupo.',
      bannerUrl: '/banner.jpeg',
      showGoal: true,
      nameDisplayMode: 'FANTASY',
    });

    expect(result.summary).toEqual({
      totalEntries: 100,
      totalExpenses: 25.5,
      balance: 74.5,
      activeParticipants: 1,
      paidParticipants: 1,
    });

    expect(result.participants[0]).toMatchObject({
      publicCode: 'BG-00000001',
      alias: expect.any(String),
      paid: 100,
      status: 'PAID',
    });

    expect(result.recentTransactions[0]).toMatchObject({
      participantCode: 'BG-00000001',
      amount: '100.00',
    });

    expect(serializedResult).not.toContain(
      'Nome Real Protegido',
    );

    expect(serializedResult).not.toContain(
      'participant-01',
    );
  });
});