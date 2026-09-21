import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

const FANTASY_NAMES = [
  'Luke Skywalker',
  'Leia Organa',
  'Han Solo',
  'Obi-Wan Kenobi',
  'Ahsoka Tano',
  'Din Djarin',
  'Grogu',
  'Mace Windu',
  'Padmé Amidala',
  'Lando Calrissian',
  'Chewbacca',
  'Rey Skywalker',
  'Cassian Andor',
  'Jyn Erso',
  'Poe Dameron',
  'Finn',
  'Monkey D. Luffy',
  'Roronoa Zoro',
  'Nami',
  'Sanji',
  'Tony Tony Chopper',
  'Nico Robin',
  'Franky',
  'Brook',
  'Jinbe',
  'Shanks',
  'Trafalgar Law',
  'Portgas D. Ace',
  'Sabo',
  'Boa Hancock',
  'Yamato',
  'Usopp',
] as const;

@Injectable()
export class ParticipantAliasService {
  createAliases(
    participantIds: string[],
    currentDate = new Date(),
  ): Map<string, string> {
    const hour = Math.floor(currentDate.getTime() / 3_600_000);

    const shuffledNames = [...FANTASY_NAMES].sort((first, second) => {
      return this.hash(`${hour}:${first}`).localeCompare(
        this.hash(`${hour}:${second}`),
      );
    });

    const sortedIds = [...participantIds].sort();

    return new Map(
      sortedIds.map((id, index) => [
        id,
        shuffledNames[index % shuffledNames.length],
      ]),
    );
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
