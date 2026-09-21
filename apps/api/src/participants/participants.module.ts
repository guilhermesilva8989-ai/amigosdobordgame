import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import {
  ParticipantsController,
  PublicParticipantsController,
} from './participants.controller.js';
import { ParticipantAliasService } from './participant-alias.service.js';
import { ParticipantsService } from './participants.service.js';

@Module({
  imports: [AuthModule],
  controllers: [
    ParticipantsController,
    PublicParticipantsController,
  ],
  providers: [
    ParticipantsService,
    ParticipantAliasService,
  ],
})
export class ParticipantsModule {}
