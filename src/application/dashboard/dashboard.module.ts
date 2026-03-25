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
import { SavingsService } from '../savings/savings.service'
import { Savings } from '../savings/savings.entity'
import { BankModule } from '../bank/bank.module'
import { BillModule } from '../bill/bill.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Savings, Bill, CreditCard, Bank]),
    BillModule,
    BankModule
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    BillService,
    BankService,
    CreditCardService,
    SavingsService
  ],
  exports: [DashboardService]
})
export class DashboardModule {}
