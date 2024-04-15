import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { dataBaseConfig } from '../database/database.config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { BankModule } from '../bank/bank.module'
import { BillModule } from '../bill/bill.module'
import { CompanyModule } from '../company/company.module'
import { CreditCard } from '../credit-card/credit-card.entity'
import { TypeBill } from '../type-bill/type-bill.entity'
import { User } from '../user/user.entity'

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...dataBaseConfig }),
    BankModule,
    BillModule,
    CompanyModule,
    CreditCard,
    TypeBill,
    User
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
