import { InjectRepository } from '@nestjs/typeorm'
import { Between, MoreThanOrEqual, Repository } from 'typeorm'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Injectable } from '@nestjs/common'
import { Bill } from '../bill/bill.entity'
import { CreditCard } from '../credit-card/credit-card.entity'
import { BillService } from '../bill/bill.service'

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    private readonly billService: BillService,
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>
  ) {}

  async getBillProgression(
    userId: string,
    monthSpan: number,
    month: number,
    year: number
  ) {
    const actualMonthAndYear: number[][] = []
    for (let i = 0; i < monthSpan; i++) {
      const actualMonth = new Date(year, month - i, 1).getMonth()
      const actualYear = new Date(year, month - i, 1).getFullYear()
      actualMonthAndYear.push([actualMonth, actualYear])
    }
    try {
      const results = await Promise.all(
        actualMonthAndYear.map((mtyr) =>
          this.billService.getPaidBillsByMonth(userId, mtyr[0], mtyr[1])
        )
      )
      return results
    } catch (error) {
      return ErrorHandler.INTERNAL_SERVER_ERROR(error)
    }
  }

  async getBills(userId: string) {
    try {
      const dates = {
        thisMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        nextMonth: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      }
      const result = this.billRepository.find({
        relations: ['category'],
        where: [
          {
            userId,
            due: Between(dates.thisMonth, dates.nextMonth),
            type: 'companyCredit'
          },
          {
            userId,
            due: Between(dates.thisMonth, dates.nextMonth),
            type: 'creditCard',
            isRefund: false
          },
          {
            userId,
            due: Between(dates.thisMonth, dates.nextMonth),
            type: 'money',
            isPayment: true
          }
        ]
      })
      return result
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getSavings(userId: string) {
    const dates = [
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    ]
    try {
      const result = this.billRepository.find({
        where: {
          type: 'money',
          due: Between(dates[0], dates[1]),
          userId
        }
      })
      return result
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getCreditCards(userId: string) {
    try {
      const result = this.creditCardRepository.find({
        where: {
          month: MoreThanOrEqual(new Date().getMonth() - 4),
          userId
        }
      })
      return result
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
