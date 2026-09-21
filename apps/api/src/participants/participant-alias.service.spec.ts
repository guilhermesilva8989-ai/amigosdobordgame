import { describe, expect, it } from 'vitest';
import { ParticipantAliasService } from './participant-alias.service.js';

describe('ParticipantAliasService', () => {
  const service = new ParticipantAliasService();

  const participantIds = [
    'participante-01',
    'participante-02',
    'participante-03',
    'participante-04',
    'participante-05',
    'participante-06',
  ];

  it('mantém os mesmos apelidos durante a mesma hora', () => {
    const firstDate = new Date('2026-09-21T18:10:00.000Z');
    const secondDate = new Date('2026-09-21T18:59:59.000Z');

    const firstAliases = service.createAliases(
      participantIds,
      firstDate,
    );

    const secondAliases = service.createAliases(
      participantIds,
      secondDate,
    );

    expect([...secondAliases.entries()]).toEqual([
      ...firstAliases.entries(),
    ]);
  });

  it('altera a distribuição após a mudança de hora', () => {
    const firstDate = new Date('2026-09-21T18:59:59.000Z');
    const secondDate = new Date('2026-09-21T19:00:00.000Z');

    const firstAliases = service.createAliases(
      participantIds,
      firstDate,
    );

    const secondAliases = service.createAliases(
      participantIds,
      secondDate,
    );

    expect([...secondAliases.values()]).not.toEqual([
      ...firstAliases.values(),
    ]);
  });

  it('não repete apelidos entre os participantes', () => {
    const aliases = service.createAliases(
      participantIds,
      new Date('2026-09-21T18:00:00.000Z'),
    );

    const names = [...aliases.values()];

    expect(new Set(names).size).toBe(names.length);
  });

  it('não altera a lista original de identificadores', () => {
    const originalIds = [...participantIds];

    service.createAliases(
      participantIds,
      new Date('2026-09-21T18:00:00.000Z'),
    );

    expect(participantIds).toEqual(originalIds);
  });
});
