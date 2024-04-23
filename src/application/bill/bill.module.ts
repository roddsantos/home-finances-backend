import { Module } from '@nestjs/common'
import { BillController } from './bill.controller'
import { BillService } from './bill.service'
import { Bill } from './bill.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BankModule } from '../bank/bank.module'
import { CreditCardModule } from '../credit-card/credit-card.module'

@Module({
  imports: [TypeOrmModule.forFeature([Bill]), BankModule, CreditCardModule],
  controllers: [BillController],
  providers: [BillService],
  exports: [TypeOrmModule]
})
export class BillModule {}
