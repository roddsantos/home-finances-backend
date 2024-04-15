import { Module } from '@nestjs/common'
import { TypeBillController } from './type-bill.controller'
import { TypeBillService } from './type-bill.service'
import { TypeBill } from './type-bill.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([TypeBill])],
  controllers: [TypeBillController],
  providers: [TypeBillService],
  exports: [TypeOrmModule]
})
export class TypeBillModule {}
