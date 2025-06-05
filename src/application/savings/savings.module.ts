import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Savings } from './savings.entity'
import { SavingsController } from './savings.controller'
import { SavingsService } from './savings.service'
import { BankService } from '../bank/bank.service'
import { Bank } from '../bank/bank.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Savings, Bank])],
  controllers: [SavingsController],
  providers: [SavingsService, BankService],
  exports: [TypeOrmModule, SavingsService]
})
export class SavingsModule {}
