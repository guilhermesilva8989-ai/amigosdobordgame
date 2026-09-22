import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { FinancialGoalsController } from './financial-goals.controller.js';
import { FinancialGoalsService } from './financial-goals.service.js';

@Module({
  imports: [AuthModule],
  controllers: [FinancialGoalsController],
  providers: [FinancialGoalsService],
  exports: [FinancialGoalsService],
})
export class FinancialGoalsModule {}
