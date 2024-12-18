import { Module } from '@nestjs/common'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Bill } from '../bill/bill.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Bill])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService]
})
export class DashboardModule {}
