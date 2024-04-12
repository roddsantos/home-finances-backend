import { Module } from '@nestjs/common'
import { TypeBillController } from './type-bill.controller'
import { TypeBillService } from './type-bill.service'

@Module({
  controllers: [TypeBillController],
  providers: [TypeBillService]
})
export class TypeBillModule {}
