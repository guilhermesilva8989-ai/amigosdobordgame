import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../database/prisma.service.js';
import { ParticipantAliasService } from './participant-alias.service.js';
import { ParticipantsService } from './participants.service.js';

describe('ParticipantsService', () => {
  it('não expõe o nome real na listagem pública', async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 'participante-01',
        publicCode: 'BG-00000001',
        name: 'Nome Real Protegido',
        joinedAt: new Date('2026-09-21T18:00:00.000Z'),
      },
    ]);

    const prisma = {
      participant: {
        findMany,
      },
    } as unknown as PrismaService;

    const service = new ParticipantsService(
      prisma,
      new ParticipantAliasService(),
    );

    const result = await service.findAllPublic();

    expect(findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      select: {
        id: true,
        publicCode: true,
        joinedAt: true,
      },
      orderBy: { id: 'asc' },
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      publicCode: 'BG-00000001',
      alias: expect.any(String),
      joinedAt: new Date('2026-09-21T18:00:00.000Z'),
    });

    expect(result[0]).not.toHaveProperty('name');
    expect(JSON.stringify(result)).not.toContain(
      'Nome Real Protegido',
    );
  });
});
