import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ErrorHandler } from '../utils/ErrorHandler'
import { HttpException, Injectable } from '@nestjs/common'
import { Bill } from '../bill/bill.entity'
import { CreditCard } from '../credit-card/credit-card.entity'
import { BillService } from '../bill/bill.service'
import {
  DashboardBillsPerMonthType,
  DashboardSavingsType
} from 'src/application/core/types/dashboard'
import { BankService } from '../bank/bank.service'
import { SavingsService } from '../savings/savings.service'
import { convertToFloat, objectToString } from '../utils/conversions'
import * as path from 'path'
import { DASHBOARD_MODULE } from '../core/consts/filename.consts'
import { GeneralService } from '../app/general/service.general'
import { CreditCardService } from '../credit-card/credit-card.service'

@Injectable()
export class DashboardService extends GeneralService {
  constructor(
    private readonly billService: BillService,
    private readonly bankService: BankService,
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
    private readonly creditCardService: CreditCardService,
    private readonly savingsService: SavingsService
  ) {
    super(path.join(__dirname, DASHBOARD_MODULE.service))
  }

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
      this.logger.error(
        `error retrieving all banks by userId : userId : ${userId} : month ${month} : year : ${year}`,
        this.logDirectory
      )
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
        totalIncome: convertToFloat(totalIncome),
        totalBanks: convertToFloat(totalBanks),
        totalSettled: convertToFloat(totalSettled),
        totalSavings: convertToFloat(totalSavings),
        totalPending: convertToFloat(totalPending),
        totalPreview: convertToFloat(
          totalSavings + totalIncome - totalSettled - totalPending
        )
      }
    } catch (error) {
      this.logger.error(
        `error retrieving all banks savings userId : userId : ${userId} : month ${month} : year : ${year}`,
        this.logDirectory
      )
      ErrorHandler.handle(error as HttpException)
    }
  }

  async getCreditCards(userId: string, month: number, year: number) {
    try {
      const groupIds = await this.creditCardService.getDistinctCreditCards(userId)
      const result = await Promise.all(
        groupIds.map((groupIdObject) =>
          this.creditCardService.getCreditCardsFromGroupId(groupIdObject.groupId)
        )
      )

      const treated = result.map((ccs) => {
        const ccTracker = [...new Array(Math.max(0, 6 - ccs.length)).fill(null), ...ccs]
        return {
          color: ccs[0]?.color || '',
          title: ccs[0]?.name || '',
          data: ccTracker
            .map((cc, i) => {
              return {
                month: new Date(year, month - i, 1).getMonth(),
                year: new Date(year, month - i, 1).getFullYear(),
                invoice: cc ? cc.invoice : 0,
                delta:
                  i === 0
                    ? 0
                    : convertToFloat(
                        (!Boolean(ccTracker[i - 1])
                          ? 0
                          : (cc.invoice - ccTracker[i - 1].invoice) /
                            ccTracker[i - 1].invoice) * 100
                      )
              }
            })
            .slice(1)
        }
      })
      return treated
    } catch (error) {
      this.logger.error(
        `error retrieving all credit cards info by userId : userId : ${userId} : ${objectToString(error)}`,
        this.logDirectory
      )
      ErrorHandler.handle(error as HttpException)
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
      this.logger.error(
        `error extracting summary of categories : numberOfCategories : ${numberOfCategories}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('error callculating categories summary')
    }
  }
}
