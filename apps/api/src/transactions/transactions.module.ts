import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import {
  PublicTransactionsController,
  TransactionsController,
} from './transactions.controller.js';
import { TransactionsService } from './transactions.service.js';

@Module({
  imports: [AuthModule],
  controllers: [
    TransactionsController,
    PublicTransactionsController,
  ],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
