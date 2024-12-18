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
            where: {
              due: Between(dates[0], dates[1]),
              userId
            }
          })
        )
      )
      return results
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
