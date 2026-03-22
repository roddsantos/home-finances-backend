import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HomeController } from './home.controller'
import { HomeService } from './home.service'
import { Bank } from '../bank/bank.entity'
import { Bill } from '../bill/bill.entity'
import { CreditCard } from '../credit-card/credit-card.entity'
import { Savings } from '../savings/savings.entity'
import { Category } from '../category/category.entity'
import { Company } from '../company/company.entity'
import { BillModule } from '../bill/bill.module'
import { BankModule } from '../bank/bank.module'
import { CategoryModule } from '../category/category.module'
import { CompanyModule } from '../company/company.module'
import { CreditCardModule } from '../credit-card/credit-card.module'
import { SavingsModule } from '../savings/savings.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Bank, Bill, Category, Company, CreditCard, Savings]),
    BillModule,
    BankModule,
    CategoryModule,
    CompanyModule,
    CreditCardModule,
    SavingsModule
  ],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [TypeOrmModule]
})
export class HomeModule {}
