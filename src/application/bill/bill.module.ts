import { forwardRef, Module } from '@nestjs/common'
import { BillController } from './bill.controller'
import { BillService } from './bill.service'
import { Bill } from './bill.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BankModule } from '../bank/bank.module'
import { CreditCardModule } from '../credit-card/credit-card.module'
import { UpdateBillService } from './services/update-bill.service'
import { CreateBillService } from './services/create-bill.service'
import { GetBillService } from './services/get-bill.service'
import { QuickSettleBillService } from './services/quick-settle-bill.service'
import { AuthModule } from '../core/auth/auth.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Bill]),
    BankModule,
    forwardRef(() => CreditCardModule),
    AuthModule
  ],
  controllers: [BillController],
  providers: [
    UpdateBillService,
    CreateBillService,
    GetBillService,
    BillService,
    QuickSettleBillService
  ],
  exports: [
    TypeOrmModule,
    CreateBillService,
    UpdateBillService,
    BillService,
    QuickSettleBillService
  ]
})
export class BillModule {}
