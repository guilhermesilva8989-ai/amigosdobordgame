import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { ParticipantAliasService } from '../participants/participant-alias.service.js';
import { SiteSettingsService } from '../site-settings/site-settings.service.js';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aliasService: ParticipantAliasService,
    private readonly siteSettingsService: SiteSettingsService,
  ) {}

  async getPublicDashboard() {
    const now = new Date();

    const referenceMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );

    const [
      entries,
      expenses,
      participants,
      contributions,
      recentTransactions,
      financialGoal,
      settings,
    ] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { type: 'ENTRY' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      this.prisma.participant.findMany({
        where: { isActive: true },
        select: {
          id: true,
          publicCode: true,
          name: true,
          joinedAt: true,
        },
        orderBy: { id: 'asc' },
      }),
      this.prisma.transaction.groupBy({
        by: ['participantId'],
        where: {
          type: 'ENTRY',
          participantId: { not: null },
          referenceMonth,
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.findMany({
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          occurredAt: true,
          participantId: true,
        },
        orderBy: [
          { occurredAt: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 10,
      }),
      this.prisma.financialGoal.findFirst({
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          targetAmount: true,
          deadline: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.siteSettingsService.find(),
    ]);

    const totalEntries = Number(entries._sum.amount ?? 0);
    const totalExpenses = Number(expenses._sum.amount ?? 0);
    const balance = totalEntries - totalExpenses;

    const aliases = this.aliasService.createAliases(
      participants.map((participant) => participant.id),
      now,
    );

    const contributionByParticipant = new Map(
      contributions.map((contribution) => [
        contribution.participantId,
        Number(contribution._sum.amount ?? 0),
      ]),
    );

    const publicParticipants = participants.map((participant) => {
      const paid =
        contributionByParticipant.get(participant.id) ?? 0;

      const displayName =
        settings.nameDisplayMode === 'REAL'
          ? participant.name
          : aliases.get(participant.id);

      return {
        publicCode: participant.publicCode,
        alias: displayName,
        joinedAt: participant.joinedAt,
        paid,
        status: paid > 0 ? 'PAID' : 'PENDING',
      };
    });

    const targetAmount = financialGoal
      ? Number(financialGoal.targetAmount)
      : 0;

    const goalCurrentAmount = Math.max(balance, 0);

    const percentage =
      targetAmount > 0
        ? Math.min(
            (goalCurrentAmount / targetAmount) * 100,
            100,
          )
        : 0;

    return {
      generatedAt: now,
      referenceMonth,
      settings: {
        heroTitle: settings.heroTitle,
        heroDescription: settings.heroDescription,
        bannerUrl: settings.bannerUrl,
        showGoal: settings.showGoal,
        nameDisplayMode: settings.nameDisplayMode,
      },
      summary: {
        totalEntries,
        totalExpenses,
        balance,
        activeParticipants: participants.length,
        paidParticipants: publicParticipants.filter(
          (participant) => participant.status === 'PAID',
        ).length,
      },
      goal:
        settings.showGoal && financialGoal
          ? {
              id: financialGoal.id,
              title: financialGoal.title,
              targetAmount,
              currentAmount: goalCurrentAmount,
              percentage: Number(percentage.toFixed(2)),
              deadline: financialGoal.deadline,
            }
          : null,
      participants: publicParticipants,
      recentTransactions: recentTransactions.map(
        (transaction) => ({
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount.toString(),
          description: transaction.description,
          occurredAt: transaction.occurredAt,
          participantCode:
            participants.find(
              (participant) =>
                participant.id === transaction.participantId,
            )?.publicCode ?? null,
        }),
      ),
    };
  }
}