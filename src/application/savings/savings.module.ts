import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Savings } from './savings.entity'
import { SavingsController } from './savings.controller'
import { SavingsService } from './savings.service'

@Module({
  imports: [TypeOrmModule.forFeature([Savings])],
  controllers: [SavingsController],
  providers: [SavingsService],
  exports: [TypeOrmModule, SavingsService]
})
export class SavingsModule {}
