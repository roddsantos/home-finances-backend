import { Module } from '@nestjs/common'
import { BankController } from './bank.controller'
import { BankService } from './bank.service'
import { Bank } from './bank.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([Bank])],
  controllers: [BankController],
  providers: [BankService],
  exports: [TypeOrmModule, BankService]
})
export class BankModule {}
