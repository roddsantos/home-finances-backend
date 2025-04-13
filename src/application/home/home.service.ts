import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Bank } from '../bank/bank.entity'
import { Between, LessThan, MoreThan, Or, Repository } from 'typeorm'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Bill } from '../bill/bill.entity'
import { CreditCard } from '../credit-card/credit-card.entity'

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>
  ) {}

  thisMonthDates = {
    firstDay: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    lastDay: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  }
  lastMonthDates = {
    firstDay: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    lastDay: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
  }

  /**
   * service to get the total saving from all the user's banks
   * @param userId id of the user
   * @returns total - total of savings; count - number of banks
   */
  async getSavingsTotal(userId: string) {
    try {
      const toReceive = await this.billRepository.sum('total', [
        {
          userId,
          due: Between(this.thisMonthDates.firstDay, this.thisMonthDates.lastDay),
          isPayment: false,
          bank2Id: null,
          isRefund: false,
          settled: false
        }
      ])
      const total = await this.bankRepository.sum('savings', {
        userId
      })
      const count = await this.bankRepository.count({
        where: {
          userId
        }
      })
      return {
        total,
        toReceive,
        count
      }
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getBillsDetails(userId: string) {
    try {
      const filter = (thisMonth: boolean) => {
        return [
          {
            userId,
            due: Between(
              thisMonth ? this.thisMonthDates.firstDay : this.lastMonthDates.firstDay,
              thisMonth ? this.thisMonthDates.lastDay : this.lastMonthDates.lastDay
            ),
            isPayment: true,
            bank2Id: null,
            isRefund: false
          },
          {
            userId,
            due: Between(
              thisMonth ? this.thisMonthDates.firstDay : this.lastMonthDates.firstDay,
              thisMonth ? this.thisMonthDates.lastDay : this.lastMonthDates.lastDay
            ),
            type: 'creditCard',
            isRefund: false
          },
          {
            userId,
            due: Or(
              LessThan(
                thisMonth ? this.thisMonthDates.firstDay : this.lastMonthDates.firstDay
              ),
              MoreThan(
                thisMonth ? this.thisMonthDates.lastDay : this.lastMonthDates.lastDay
              )
            ),
            paid: Between(
              thisMonth ? this.thisMonthDates.firstDay : this.lastMonthDates.firstDay,
              thisMonth ? this.thisMonthDates.lastDay : this.lastMonthDates.lastDay
            ),
            isPayment: true,
            bank2Id: null,
            isRefund: false
          }
        ]
      }

      const bills = await this.billRepository.find({
        where: filter(true)
      })
      const count = bills.length
      const lastTotal = await this.billRepository.sum('totalParcel', filter(false))
      const total = bills.reduce((prev, curr) => prev + curr.totalParcel, 0)
      const settled = bills.reduce(
        (prev, curr) => prev + (curr.settled ? curr.totalParcel : 0),
        0
      )

      return {
        total,
        count,
        delta: Boolean(lastTotal) ? parseFloat((total / lastTotal - 1).toFixed(4)) : 0,
        settled
      }
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getCreditCardValues(userId: string) {
    try {
      const filterObject = {
        months: [new Date().getMonth()],
        years: [new Date().getFullYear()]
      }
      const dates: Array<Date[]> = []
      filterObject.years.forEach((y) =>
        filterObject.months.forEach((m) => {
          dates.push([new Date(y, m, 1), new Date(y, m + 1, 0)])
        })
      )
      const openedCards = await this.creditCardRepository.find({
        where: {
          userId,
          isClosed: false
        }
      })
      const total = openedCards.reduce((prev, curr) => prev + curr.invoice, 0)
      const count = openedCards.length
      return {
        total: total || 0,
        count
      }
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
