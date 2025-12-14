import { InjectRepository } from '@nestjs/typeorm'
import { MoreThanOrEqual, Repository } from 'typeorm'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Injectable } from '@nestjs/common'
import { Bill } from '../bill/bill.entity'
import { CreditCard } from '../credit-card/credit-card.entity'
import { BillService } from '../bill/bill.service'
import {
  DashboardBillsPerMonthType,
  DashboardSavingsType
} from 'src/application/core/types/dashboard'
import { BankService } from '../bank/bank.service'
import { SavingsService } from '../savings/savings.service'
import { convertToFloat } from '../utils/conversions'

@Injectable()
export class DashboardService {
  constructor(
    private readonly billService: BillService,
    private readonly bankService: BankService,
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
    private readonly savingsService: SavingsService
  ) {}

  /**
   * Return a list of bills progression
   * @param {string} userId related user id
   * @param {number} monthSpan span of the months to return
   * @param {number} month month reference for the progression
   * @param {number} year year reference for the progression
   * @returns {DashboardBillsPerMonth[]} array with the progression info
   */
  async getBillProgression(
    userId: string,
    monthSpan: number,
    month: number,
    year: number
  ) {
    const billsArray: Bill[][] = []
    const result: DashboardBillsPerMonthType[] = []

    try {
      for (let i = 0; i < monthSpan + 1; i++) {
        const bills = await this.billService.getBillsByMonth(userId, month - i, year)
        billsArray.push(bills)
      }

      billsArray.forEach((billsMonth, index) => {
        const count = billsMonth.length
        const total = parseFloat(
          billsMonth.reduce((acc, bill) => acc + bill.totalParcel, 0).toFixed(2)
        )
        result.push({
          count,
          total,
          delta: 0,
          month: new Date(year, month - index, 1).getMonth(),
          year: new Date(year, month - index, 1).getFullYear()
        })
      })

      const resultWithDelta = result.map((r, index) => ({
        ...r,
        delta:
          !Boolean(result[index + 1]) || !Boolean(result[index].total)
            ? 0
            : convertToFloat((r.total / (result[index + 1].total || r.total) - 1) * 100)
      }))

      return resultWithDelta.slice(0, monthSpan).reverse()
    } catch (error) {
      ErrorHandler.INTERNAL_SERVER_ERROR(error)
    }
  }
  /**
   * Get savings info of a refered month and year
   * @param {string} userId id of the user
   * @param {number} month refered month
   * @param {number} year refered year
   * @returns {DashboardSavingsType} object with savings info
   */
  async getSavings(
    userId: string,
    month: number,
    year: number
  ): Promise<DashboardSavingsType> {
    try {
      const piggyBanksProgression = await this.savingsService.getSavingsProgression(
        userId,
        5,
        month,
        year
      )
      const userBanks = await this.bankService.getAllById(userId, false)
      const allMoneyBills = await this.billService.getBillsPaidByMoney(
        userId,
        month,
        year
      )
      const allIncomeBills = await this.billService.getIncomeBills(userId, month, year)
      const savings = await Promise.all(
        userBanks.map((bank) => this.savingsService.getOneByBankId(bank.id, month, year))
      )

      let totalSettled = 0
      let totalPending = 0
      const totalIncome = allIncomeBills.reduce((acc, bill) => acc + bill.total, 0)
      const totalSavings = convertToFloat(
        savings.reduce((acc, saving) => acc + (saving?.total || 0), 0)
      )
      const totalBanks = userBanks.reduce((acc, bank) => acc + bank.savings, 0)
      allMoneyBills.forEach((bill) => {
        if (bill.settled) totalSettled += bill.totalParcel
        else totalPending += bill.totalParcel
      })

      return {
        piggyBanksProgression,
        totalIncome,
        totalBanks,
        totalSettled: convertToFloat(totalSettled),
        totalSavings: convertToFloat(totalSavings),
        totalPending,
        totalPreview: convertToFloat(
          totalSavings + totalIncome - totalSettled - totalPending
        )
      }
    } catch (error) {
      ErrorHandler.handle(error)
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

  /**
   * Return a summary of the categories
   * @param {Bills[]} bills list of bills to extract the categories
   * @param {number} numberOfCategories number of top categories to be displayed
   * @returns {Object} a summary of the top categories and a summary
   * of the restant of the categories
   */
  getSummaryOfCategories(bills: Bill[], numberOfCategories: number) {
    const categorySets: any = {}

    try {
      bills.forEach((monthBill) => {
        categorySets[monthBill.categoryId] = [
          ...(categorySets[monthBill.categoryId] || []),
          monthBill
        ]
      })

      const entries = Object.entries(categorySets)
      const sorted = entries
        .sort(([, arrA], [, arrB]) => (arrB as Bill[]).length - (arrA as Bill[]).length)
        .map(([key, value]: [string, Bill[]]) => ({
          category: value[0].category,
          total: parseFloat(
            value.reduce((acc, bill) => acc + bill.totalParcel, 0).toFixed(2)
          ),
          count: value.length,
          key
        }))

      if (sorted.length < numberOfCategories) numberOfCategories = sorted.length

      const topCategories = sorted
        .sort((a, b) => b.total - a.total)
        .slice(0, numberOfCategories)
      const rest = sorted.slice(numberOfCategories)

      const otherCategories = {
        category: null,
        total: parseFloat(rest.reduce((acc, oc) => acc + oc.total, 0).toFixed(2)),
        count: rest.reduce((acc, oc) => acc + oc.count, 0),
        key: 'other-categories'
      }

      return { topCategories, otherCategories }
    } catch (error) {
      ErrorHandler.INTERNAL_SERVER_ERROR('Error callculating categories summary')
    }
  }
}
