import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Bank } from '../bank/bank.entity'
import {
  IsNull,
  LessThan,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Or,
  Repository
} from 'typeorm'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Bill } from '../bill/bill.entity'
import { CreditCard } from '../credit-card/credit-card.entity'
import { SavingsService } from '../savings/savings.service'
import { getMonthBetweenOperator } from '../utils/operators'
import { firstDayOfMonth, lastDayOfMonth } from '../utils/dates'
import { HomeSavingsType } from 'src/application/core/types/home'
import { BillService } from '../bill/bill.service'
import * as path from 'path'
import { HOME_MODULE } from '../core/consts/filename.consts'
import { GeneralService } from '../app/general/service.general'
import { BankService } from '../bank/bank.service'
import { CategoryService } from '../category/category.service'
import { CompanyService } from '../company/company.service'
import { CreditCardService } from '../credit-card/credit-card.service'
import { ItemTypes } from '../core/types/general'
import { objectToString } from '../utils/conversions'

@Injectable()
export class HomeService extends GeneralService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
    private readonly savingsService: SavingsService,
    private readonly billsService: BillService,
    private readonly bankService: BankService,
    private readonly categoryService: CategoryService,
    private readonly companyService: CompanyService,
    private readonly creditCardService: CreditCardService
  ) {
    super(path.join(__dirname, HOME_MODULE.controller))
  }

  /**
   * service to get the total saving from all the user's banks
   * @param userId id of the user
   * @returns total - total of savings; count - number of banks
   */
  async getSavingsTotal(
    userId: string,
    month: number,
    year: number
  ): Promise<HomeSavingsType> {
    try {
      // Get sum of common banks
      const userBanks = await this.bankRepository.find({
        where: { userId, isPiggyBank: false }
      })
      const sumBanks = userBanks.reduce((acc, bank) => acc + bank.savings, 0)

      // Get sum of piggy banks
      const piggyBanks = await this.bankRepository.find({
        where: { userId, isPiggyBank: true }
      })

      // Get piggy bank bills history
      const piggyBankDeposits = await this.billRepository.sum('total', [
        {
          userId,
          bank2Id: Or(...piggyBanks.map((pb) => Like(pb.id))),
          due: getMonthBetweenOperator(month, year)
        }
      ])
      const piggyBankWithdraws = await this.billRepository.sum('total', {
        userId,
        bank1Id: Or(...piggyBanks.map((pb) => Like(pb.id))),
        due: getMonthBetweenOperator(month, year)
      })
      const piggyBankBillsDelta = piggyBankDeposits - piggyBankWithdraws

      // Get resume of bills (income and outcome)
      const bills = await this.billsService.getBillsByMonth(userId, month, year)
      const sumOfBills = bills.reduce((prev, curr) => prev + curr.totalParcel, 0)
      const incomeBills = await this.billsService.getIncomeBills(userId, month, year)
      const totalIncomeBills = incomeBills.reduce((acc, bill) => acc + bill.total, 0)

      // Get savings
      const savingsOffset = month < new Date().getMonth() ? 1 : 0
      const savings = await Promise.all(
        userBanks.map((bank) =>
          this.savingsService.getOneByBankId(bank.id, month + savingsOffset, year)
        )
      )
      const monthlySavings =
        month > new Date().getMonth()
          ? sumBanks
          : savings.reduce((acc, saving) => acc + (saving?.total || 0), 0)

      const totalBanks = month < new Date().getMonth() ? monthlySavings : sumBanks
      const totalSavingsPreview =
        month < new Date().getMonth()
          ? monthlySavings
          : totalIncomeBills + monthlySavings - sumOfBills - piggyBankBillsDelta
      const totalIncome = totalIncomeBills
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
            bank2Id: IsNull()
          },
          {
            userId,
            due: getMonthBetweenOperator(m, y),
            type: 'creditCard'
          },
          {
            userId,
            due: Or(LessThan(firstDayOfMonth(m, y)), MoreThan(lastDayOfMonth(m, y))),
            paid: getMonthBetweenOperator(m, y),
            isPayment: true,
            bank2Id: IsNull()
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
      ErrorHandler.handle(error)
    }
  }

  async getCreditCardValues(userId: string, month: number, year: number) {
    try {
      const filterObject = {
        months: [month],
        years: [year]
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
      ErrorHandler.handle(error)
    }
  }

  async getLastFiveBills(userId: string, month: number, year: number) {
    try {
      const bills = await this.billRepository.find({
        relations: ['creditCard', 'company', 'bank1', 'bank2', 'category'],
        where: [
          {
            userId,
            type: Or(Like('companyCredit'), Like('creditCard')),
            due: getMonthBetweenOperator(month, year),
            parcel: 0
          },
          {
            userId,
            type: 'money',
            due: getMonthBetweenOperator(month, year)
          }
        ],
        take: 5,
        order: { updatedAt: 'DESC' }
      })
      return {
        bills
      }
    } catch (error) {
      this.logger.error(
        `error fetching LAST five bills : userId : ${userId} : month : ${month} : year : ${month} : error : ${objectToString(error)}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('home - error fetching LAST five bills')
    }
  }

  async getNextFiveBills(userId: string, month: number, year: number) {
    try {
      const startDate = new Date()

      const bills = await this.billRepository.find({
        relations: ['creditCard', 'company', 'bank1', 'bank2', 'category'],
        where: [
          {
            userId,
            type: Or(Like('companyCredit'), Like('creditCard')),
            due: MoreThanOrEqual(startDate),
            parcel: 0,
            settled: false
          },
          {
            userId,
            type: 'money',
            due: MoreThanOrEqual(startDate),
            settled: false
          }
        ],
        take: 5,
        order: { due: 'ASC' }
      })
      return {
        bills
      }
    } catch (error) {
      this.logger.error(
        `error fetching NEXT five bills : userId : ${userId} : month : ${month} : year : ${month} : error : ${objectToString(error)}`,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('home - error fetching NEXT five bills')
    }
  }

  async getSearchByTerm(searchTerm: string, userId: string) {
    try {
      const banks = await this.bankService.getBySearchTerm(searchTerm, userId)
      const bills = await this.billsService.getBySearchTerm(searchTerm, userId)
      const categories = await this.categoryService.getBySearchTerm(searchTerm, userId)
      const companies = await this.companyService.getBySearchTerm(searchTerm, userId)
      const creditCards = await this.creditCardService.getBySearchTerm(searchTerm, userId)

      return { banks, bills, categories, companies, creditCards }
    } catch (error) {
      this.logger.error(
        `error fetching items by search term : searchTerm : ${searchTerm}`,
        this.logDirectory
      )
      ErrorHandler.handle(error)
    }
  }

  async getItemFromSearch(id: string, type: ItemTypes) {
    try {
      switch (type) {
        case 'bank':
          return await this.bankService.getOneById(id)
        case 'bill':
          return await this.billsService.getBillById(id)
        case 'category':
          return await this.categoryService.getOneById(id)
        case 'company':
          return await this.companyService.getOneById(id)
        case 'credit-card':
          return await this.creditCardService.getOneById(id)
      }
    } catch (error) {
      this.logger.error(
        `error fetching item : id : ${id} : type : ${type}`,
        this.logDirectory
      )
      ErrorHandler.handle(error)
    }
  }
}
