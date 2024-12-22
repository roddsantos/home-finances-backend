import { InjectRepository } from '@nestjs/typeorm'
import { Between, Repository } from 'typeorm'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Injectable } from '@nestjs/common'
import { Bill } from '../bill/bill.entity'

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>
  ) {}

  async getMonthSpan(months: number, userId: string) {
    const dateSpans: Date[][] = []
    for (let i = 0; i < months; i++) {
      const actualMonth = new Date().getMonth() - i
      const actualYear =
        actualMonth < 0 ? new Date().getFullYear() - 1 : new Date().getFullYear()
      dateSpans.push([
        new Date(actualYear, actualMonth, 1),
        new Date(actualYear, actualMonth + 1, 0)
      ])
    }
    try {
      const results = await Promise.all(
        dateSpans.map((dates) =>
          this.billRepository.find({
            where: [
              {
                userId,
                due: Between(dates[0], dates[1]),
                type: 'companyCredit'
              },
              {
                userId,
                due: Between(dates[0], dates[1]),
                type: 'creditCard',
                isRefund: false
              },
              {
                userId,
                due: Between(dates[0], dates[1]),
                type: 'money',
                isPayment: true
              }
            ]
          })
        )
      )
      return results
    } catch (error) {
      return ErrorHandler.handle(error)
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
}
