import { Module } from '@nestjs/common'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Bill } from '../bill/bill.entity'
import { CreditCard } from '../credit-card/credit-card.entity'
import { BillService } from '../bill/bill.service'
import { BankService } from '../bank/bank.service'
import { CreditCardService } from '../credit-card/credit-card.service'
import { Bank } from '../bank/bank.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Bill, CreditCard, Bank])],
  controllers: [DashboardController],
  providers: [DashboardService, BillService, BankService, CreditCardService],
  exports: [DashboardService]
})
export class DashboardModule {}
