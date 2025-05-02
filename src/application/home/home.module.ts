import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HomeController } from './home.controller'
import { HomeService } from './home.service'
import { Bank } from '../bank/bank.entity'
import { Bill } from '../bill/bill.entity'
import { BillService } from '../bill/bill.service'
import { BankService } from '../bank/bank.service'
import { CreditCardService } from '../credit-card/credit-card.service'
import { CreditCard } from '../credit-card/credit-card.entity'
import { SavingsService } from '../savings/savings.service'
import { Savings } from '../savings/savings.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Bank, Bill, CreditCard, Savings])],
  controllers: [HomeController],
  providers: [HomeService, BillService, BankService, CreditCardService, SavingsService],
  exports: [TypeOrmModule]
})
export class HomeModule {}
