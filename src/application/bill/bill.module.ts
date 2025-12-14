import { Module } from '@nestjs/common'
import { BillController } from './bill.controller'
import { BillService } from './bill.service'
import { Bill } from './bill.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BankModule } from '../bank/bank.module'
import { CreditCardModule } from '../credit-card/credit-card.module'
import { UpdateBillService } from './services/update-bill.service'
import { CreateBillService } from './services/create-bill.service'
import { GetBillService } from './services/get-bill.service'

@Module({
  imports: [TypeOrmModule.forFeature([Bill]), BillModule, BankModule, CreditCardModule],
  controllers: [BillController],
  providers: [UpdateBillService, CreateBillService, GetBillService, BillService],
  exports: [TypeOrmModule]
})
export class BillModule {}
