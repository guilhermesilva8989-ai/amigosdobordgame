import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';

const participantSelect = {
  id: true,
  publicCode: true,
  name: true,
} as const;

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto, adminId: string) {
    if (dto.participantId) {
      await this.ensureParticipantExists(dto.participantId);
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
            select: participantSelect,
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
          select: participantSelect,
        },
      },
      orderBy: [
        { occurredAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async update(
    id: string,
    dto: UpdateTransactionDto,
    adminId: string,
  ) {
    const existingTransaction =
      await this.prisma.transaction.findUnique({
        where: { id },
      });

    if (!existingTransaction) {
      throw new NotFoundException(
        'Movimentação não encontrada.',
      );
    }

    const [transaction] = await this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { id },
        data: {
          ...(dto.amount ? { amount: dto.amount } : {}),
          ...(dto.description
            ? { description: dto.description.trim() }
            : {}),
        },
        include: {
          participant: {
            select: participantSelect,
          },
        },
      }),
      this.prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          entity: 'Transaction',
          entityId: id,
          createdById: adminId,
          details: {
            previousAmount:
              existingTransaction.amount.toString(),
            newAmount:
              dto.amount ??
              existingTransaction.amount.toString(),
            updatedFields: Object.keys(dto),
          },
        },
      }),
    ]);

    return transaction;
  }

  async remove(id: string, adminId: string) {
    const transaction =
      await this.prisma.transaction.findUnique({
        where: { id },
      });

    if (!transaction) {
      throw new NotFoundException(
        'Movimentação não encontrada.',
      );
    }

    await this.prisma.$transaction([
      this.prisma.transaction.delete({
        where: { id },
      }),
      this.prisma.auditLog.create({
        data: {
          action: 'DELETE',
          entity: 'Transaction',
          entityId: id,
          createdById: adminId,
          details: {
            type: transaction.type,
            amount: transaction.amount.toString(),
            description: transaction.description,
          },
        },
      }),
    ]);

    return {
      message: 'Movimentação removida com sucesso.',
      id,
    };
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

  private async ensureParticipantExists(
    participantId: string,
  ) {
    const participant =
      await this.prisma.participant.findUnique({
        where: { id: participantId },
        select: { id: true },
      });

    if (!participant) {
      throw new NotFoundException(
        'Participante não encontrado.',
      );
    }
  }
}
