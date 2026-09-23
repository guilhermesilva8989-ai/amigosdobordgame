import { Module } from '@nestjs/common';
import { ParticipantsModule } from '../participants/participants.module.js';
import { SiteSettingsModule } from '../site-settings/site-settings.module.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [
    ParticipantsModule,
    SiteSettingsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}