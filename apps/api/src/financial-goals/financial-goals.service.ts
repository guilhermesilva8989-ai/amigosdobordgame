import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service.js';
import { SaveFinancialGoalDto } from './dto/save-financial-goal.dto.js';

@Injectable()
export class FinancialGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findActive() {
    const goal = await this.prisma.financialGoal.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return goal
      ? {
          ...goal,
          targetAmount: goal.targetAmount.toString(),
        }
      : null;
  }

  async save(dto: SaveFinancialGoalDto, adminId: string) {
    const activeGoal =
      await this.prisma.financialGoal.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

    const deadline = dto.deadline
      ? new Date(`${dto.deadline}T00:00:00.000Z`)
      : null;

    const id = activeGoal?.id ?? randomUUID();

    const goalOperation = activeGoal
      ? this.prisma.financialGoal.update({
          where: { id: activeGoal.id },
          data: {
            title: dto.title,
            targetAmount: dto.targetAmount,
            deadline,
          },
        })
      : this.prisma.financialGoal.create({
          data: {
            id,
            title: dto.title,
            targetAmount: dto.targetAmount,
            deadline,
            createdById: adminId,
          },
        });

    const [goal] = await this.prisma.$transaction([
      goalOperation,
      this.prisma.auditLog.create({
        data: {
          action: activeGoal ? 'UPDATE' : 'CREATE',
          entity: 'FinancialGoal',
          entityId: id,
          createdById: adminId,
          details: {
            title: dto.title,
            targetAmount: dto.targetAmount,
            deadline: dto.deadline ?? null,
          },
        },
      }),
    ]);

    return {
      ...goal,
      targetAmount: goal.targetAmount.toString(),
    };
  }
}
