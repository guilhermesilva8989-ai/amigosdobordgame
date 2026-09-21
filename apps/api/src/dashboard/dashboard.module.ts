import { Module } from '@nestjs/common';
import { ParticipantsModule } from '../participants/participants.module.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [ParticipantsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
