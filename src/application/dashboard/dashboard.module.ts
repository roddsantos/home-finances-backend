import { Module } from '@nestjs/common'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Bill } from '../bill/bill.entity'
import { CreditCard } from '../credit-card/credit-card.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Bill, CreditCard])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService]
})
export class DashboardModule {}
