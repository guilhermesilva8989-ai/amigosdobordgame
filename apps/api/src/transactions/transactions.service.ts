import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto, adminId: string) {
    if (dto.participantId) {
      const participant =
        await this.prisma.participant.findUnique({
          where: { id: dto.participantId },
          select: { id: true },
        });

      if (!participant) {
        throw new NotFoundException(
          'Participante não encontrado.',
        );
      }
    }

    const id = randomUUID();

    const referenceMonth = dto.referenceMonth
      ? new Date(`${dto.referenceMonth}-01T00:00:00.000Z`)
      : undefined;

    const occurredAt = dto.occurredAt
      ? new Date(dto.occurredAt)
      : undefined;

    const [transaction] = await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          id,
          type: dto.type,
          amount: dto.amount,
          description: dto.description.trim(),
          referenceMonth,
          occurredAt,
          participantId: dto.participantId,
          createdById: adminId,
        },
        include: {
          participant: {
            select: {
              id: true,
              publicCode: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'Transaction',
          entityId: id,
          createdById: adminId,
          details: {
            type: dto.type,
            amount: dto.amount,
          },
        },
      }),
    ]);

    return transaction;
  }

  findAllAdmin() {
    return this.prisma.transaction.findMany({
      include: {
        participant: {
          select: {
            id: true,
            publicCode: true,
            name: true,
          },
        },
      },
      orderBy: [
        { occurredAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findAllPublic() {
    const transactions =
      await this.prisma.transaction.findMany({
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          referenceMonth: true,
          occurredAt: true,
          participant: {
            select: {
              publicCode: true,
            },
          },
        },
        orderBy: [
          { occurredAt: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 20,
      });

    return transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      referenceMonth: transaction.referenceMonth,
      occurredAt: transaction.occurredAt,
      participantCode:
        transaction.participant?.publicCode ?? null,
    }));
  }

  async getPublicSummary() {
    const [entries, expenses] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { type: 'ENTRY' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { type: 'EXPENSE' },
        _sum: { amount: true },
      }),
    ]);

    const totalEntries = Number(entries._sum.amount ?? 0);
    const totalExpenses = Number(expenses._sum.amount ?? 0);

    return {
      totalEntries,
      totalExpenses,
      balance: totalEntries - totalExpenses,
    };
  }
}
