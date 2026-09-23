import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service.js';
import { CreateParticipantDto } from './dto/create-participant.dto.js';
import { UpdateParticipantDto } from './dto/update-participant.dto.js';
import { ParticipantAliasService } from './participant-alias.service.js';

@Injectable()
export class ParticipantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aliasService: ParticipantAliasService,
  ) {}

  async create(dto: CreateParticipantDto, adminId: string) {
    const normalizedName = dto.name.trim().replace(/\\s+/g, ' ');

    const existingParticipant =
      await this.prisma.participant.findFirst({
        where: {
          name: {
            equals: normalizedName,
            mode: 'insensitive',
          },
        },
        select: { id: true },
      });

    if (existingParticipant) {
      throw new ConflictException(
        'Já existe um participante cadastrado com esse nome.',
      );
    }

    const id = randomUUID();
    const publicCode = `BG-${id.slice(0, 8).toUpperCase()}`;

    const [participant] = await this.prisma.$transaction([
      this.prisma.participant.create({
        data: {
          id,
          publicCode,
          name: normalizedName,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'Participant',
          entityId: id,
          createdById: adminId,
          details: { publicCode },
        },
      }),
    ]);

    return participant;
  }

  async remove(id: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const participant = await tx.participant.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          publicCode: true,
          _count: { select: { transactions: true } },
        },
      });

      if (!participant) {
        throw new NotFoundException('Participante não encontrado.');
      }

      if (participant._count.transactions > 0) {
        throw new ConflictException(
          'Este participante possui movimentações. Desative o cadastro para preservar o histórico financeiro.',
        );
      }

      await tx.participant.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          action: 'DELETE',
          entity: 'Participant',
          entityId: id,
          createdById: adminId,
          details: {
            name: participant.name,
            publicCode: participant.publicCode,
          },
        },
      });

      return { message: 'Participante excluído com sucesso.' };
    });
  }

  findAllAdmin() {
    return this.prisma.participant.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findAllPublic() {
    const participants = await this.prisma.participant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        publicCode: true,
        joinedAt: true,
      },
      orderBy: { id: 'asc' },
    });

    const aliases = this.aliasService.createAliases(
      participants.map((participant) => participant.id),
    );

    return participants.map((participant) => ({
      publicCode: participant.publicCode,
      alias: aliases.get(participant.id),
      joinedAt: participant.joinedAt,
    }));
  }

  async update(
    id: string,
    dto: UpdateParticipantDto,
    adminId: string,
  ) {
    const existingParticipant =
      await this.prisma.participant.findUnique({ where: { id } });

    if (!existingParticipant) {
      throw new NotFoundException('Participante não encontrado.');
    }

    const [participant] = await this.prisma.$transaction([
      this.prisma.participant.update({
        where: { id },
        data: dto,
      }),
      this.prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          entity: 'Participant',
          entityId: id,
          createdById: adminId,
          details: {
            updatedFields: Object.keys(dto),
          },
        },
      }),
    ]);

    return participant;
  }
}
