import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Bank } from '../bank/bank.entity'
import { IsNull, LessThan, Like, MoreThan, Or, Repository } from 'typeorm'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Bill } from '../bill/bill.entity'
import { CreditCard } from '../credit-card/credit-card.entity'
import { SavingsService } from '../savings/savings.service'
import { getMonthBetweenOperator } from '../utils/operators'
import { firstDayOfMonth, lastDayOfMonth } from '../utils/dates'
import { HomeSavingsType } from '../types/home'
import { BillService } from '../bill/bill.service'

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
    private readonly savingsService: SavingsService,
    private readonly billsService: BillService
  ) {}

  /**
   * service to get the total saving from all the user's banks
   * @param userId id of the user
   * @returns total - total of savings; count - number of banks
   */
  async getSavingsTotal(
    userId: string,
    month?: number,
    year?: number
  ): Promise<HomeSavingsType> {
    const monthRef = month || new Date().getMonth()
    const yearRef = year || new Date().getFullYear()

    try {
      const userBanks = await this.bankRepository.find({
        where: { userId, isPiggyBank: false }
      })
      const savings = await Promise.all(
        userBanks.map((bank) =>
          this.savingsService.getOneByBankId(bank.id, monthRef, yearRef)
        )
      )
      const incomeBills = await this.billsService.getIncomeBills(
        userId,
        monthRef,
        yearRef
      )

      const monthlySavings = savings.reduce(
        (acc, saving) => acc + (saving?.total || 0),
        0
      )
      const totalIncomeBills = incomeBills.reduce((acc, bill) => acc + bill.total, 0)

      const totalIncome = totalIncomeBills
      const totalSavingsPreview = totalIncomeBills + monthlySavings
      const totalBanks = userBanks.reduce((acc, bank) => acc + bank.savings, 0)
      const countBanks = userBanks.length

      return {
        totalBanks,
        totalSavingsPreview,
        totalIncome,
        countBanks
      }
    } catch (error) {
      ErrorHandler.INTERNAL_SERVER_ERROR('Unable to get savings')
    }
  }

  async getBillsDetails(userId: string, month: number, year: number) {
    try {
      const filter = (m: number, y: number) => {
        return [
          {
            userId,
            due: getMonthBetweenOperator(m, y),
            isPayment: true,
            bank2Id: IsNull(),
            isRefund: false
          },
          {
            userId,
            due: getMonthBetweenOperator(m, y),
            type: 'creditCard',
            isRefund: false
          },
          {
            userId,
            due: Or(LessThan(firstDayOfMonth(m, y)), MoreThan(lastDayOfMonth(m, y))),
            paid: getMonthBetweenOperator(m, y),
            isPayment: true,
            bank2Id: IsNull(),
            isRefund: false
          }
        ]
      }

      const bills = await this.billRepository.find({
        where: filter(month, year)
      })
      const numberOfBills = bills.length
      const sumOfBillsLastMonth = await this.billRepository.sum(
        'totalParcel',
        filter(month - 1, year)
      )
      const sumOfBills = bills.reduce((prev, curr) => prev + curr.totalParcel, 0)
      const paidBills = bills.reduce(
        (prev, curr) => prev + (curr.settled ? curr.totalParcel : 0),
        0
      )

      return {
        sumOfBills,
        numberOfBills,
        delta: Boolean(sumOfBillsLastMonth)
          ? parseFloat((sumOfBills / sumOfBillsLastMonth - 1).toFixed(4)) * 100
          : 0,
        paidBills
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

  async getLastFiveBills(userId: string) {
    try {
      const bills = await this.billRepository.find({
        relations: ['creditCard', 'company', 'bank1', 'bank2', 'category'],
        where: [
          {
            userId,
            type: Or(Like('companyCredit'), Like('creditCard')),
            parcel: 0
          },
          {
            userId,
            type: 'money'
          }
        ],
        take: 5,
        order: { updatedAt: 'DESC' }
      })
      return {
        bills
      }
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
