import { Injectable } from '@nestjs/common'
import { Bill } from './bill.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { ILike, IsNull, LessThan, MoreThan, Not, Or, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Bank } from '../bank/bank.entity'
import { BankService } from '../bank/bank.service'
import { getMonthBetweenOperator, operatorFilter } from '../utils/operators'
import { firstDayOfMonth, getNextDate, lastDayOfMonth } from '../utils/dates'
import { SumAndCountType } from 'src/application/core/types/general'
import { convertToFloat } from '../utils/conversions'
import * as path from 'path'
import { GeneralService } from '../app/general/service.general'
import { BILL_MODULE } from '../core/consts/filename.consts'
import { CreateBillTemplateDto, FilterDisplay } from '../core/types/bill'

@Injectable()
export class BillService extends GeneralService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    private readonly bankService: BankService
  ) {
    super(path.join(__dirname, BILL_MODULE.service))
  }

  parcelsForBills(bill: CreateBillTemplateDto, isCreditCardBill = false) {
    try {
      const groupId = this.uuid.v4()
      const bills = [] as CreateBillTemplateDto[]
      const dueDate = new Date(bill.due)
      const paidDate = new Date(bill.paid)

      for (let i = 0; i < bill.parcels; i++) {
        const newDueDate = getNextDate(dueDate, i + 1, isCreditCardBill)
        const newPaidDate = getNextDate(paidDate, i + 1, isCreditCardBill)

        const delta = convertToFloat(i === bill.parcels - 1 ? bill.delta : 0)
        const totalParcel =
          convertToFloat((bill.total + bill.taxes) / bill.parcels) + delta
        const taxes = convertToFloat(bill.taxes / bill.parcels)

        const parcelObject = {
          ...bill,
          groupId,
          parcel: i,
          totalParcel,
          taxes,
          delta,
          paid: newPaidDate,
          due: newDueDate
        }

        bills.push(parcelObject)
      }
      return bills
    } catch (error) {
      this.logger.error(
        'Bills - Unable to generate bills data : ' + error,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('Bills - Unable to generate bills data')
    }
  }

  async updateBank(bank: Bank, total: number, isPayment: boolean) {
    const newBankValue: Bank = {
      ...bank,
      savings: bank.savings + total * (isPayment ? -1 : 1)
    }
    await this.bankService.update(newBankValue)

    return newBankValue
  }

  async getBills(userId: string, page: number, take: number, data: any) {
    try {
      const parsedFilter: FilterDisplay[] = JSON.parse(data) as FilterDisplay[]
      const finalFilter = operatorFilter(parsedFilter)

      const [result, total] = await this.billRepository.findAndCount({
        relations: ['creditCard', 'company', 'bank1', 'bank2', 'category'],
        take,
        skip: take * page - take,
        where: [{ ...finalFilter, userId }],
        order: { paid: 'ASC', due: 'ASC' }
      })
      const sum = await this.billRepository.sum('totalParcel', [
        { ...finalFilter, userId }
      ])

      let income = {
        total: 0,
        count: 0
      }
      const addIncomeBills = !Boolean(
        parsedFilter.find((pf) => pf.identifier === 'moneyflux' && pf.id === 'outcome')
      )

      if (addIncomeBills) {
        const incomeBillsArray = await this.billRepository.findAndCount({
          relations: ['creditCard', 'company', 'bank1', 'bank2', 'category'],
          where: [
            {
              ...finalFilter,
              userId,
              isPayment: !addIncomeBills
            }
          ],
          order: { paid: 'ASC', due: 'ASC' }
        })

        income = {
          total: convertToFloat(
            incomeBillsArray[0].reduce((prev, curr) => curr.totalParcel + prev, 0)
          ),
          count: addIncomeBills ? incomeBillsArray[1] : 0
        }
      }

      return {
        count: total,
        data: result,
        total: convertToFloat(sum),
        income
      }
    } catch (error) {
      this.logger.error('error getting the bills list : ' + error, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('Bills - Error getting the bills list')
    }
  }

  async getBillById(id: string) {
    try {
      this.logger.info(`retrieving bill data : id : ${id}`, this.logDirectory)
      return await this.billRepository.findOne({
        relations: ['creditCard', 'company', 'bank1', 'bank2', 'category'],
        where: { id }
      })
    } catch (error) {
      this.logger.error(
        `error updating transaction bill : bill not found : id : ${id}`,
        this.logDirectory
      )
      ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE(
        'bills - error updating transaction bill : bill not found'
      )
    }
  }

  /**
   * Return all the bills in a month
   * @param {string} userId related user
   * @param {number} month related month
   * @param {number} year related year
   * @param {string[]} relations indicates what relations of entity should be loaded
   * @returns {Bill[]} array with bills
   */
  async getBillsByMonth(
    userId: string,
    month: number,
    year: number,
    relations: string[] = []
  ): Promise<Bill[]> {
    try {
      this.logger.info(
        `fetching bills by month : month: ${month} & year: ${year}`,
        this.logDirectory
      )
      const bills = await this.billRepository.find({
        relations,
        where: [
          {
            userId,
            due: getMonthBetweenOperator(month, year),
            isPayment: true,
            bank2Id: IsNull()
          },
          {
            userId,
            due: getMonthBetweenOperator(month, year),
            type: 'creditCard'
          },
          {
            userId,
            due: Or(
              LessThan(firstDayOfMonth(month, year)),
              MoreThan(lastDayOfMonth(month, year))
            ),
            paid: getMonthBetweenOperator(month, year),
            isPayment: true,
            bank2Id: IsNull()
          }
        ]
      })
      return bills
    } catch (error) {
      this.logger.error(
        `error fetching bills by month : month: ${month} & year: ${year} : ` + error,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('bills - error getting bill by month')
    }
  }

  /**
   * Fetch all the bills paid with money
   * @param {string} userId related user
   * @param {number} month related month
   * @param {number} year related year
   * @returns {Bill[]} list of bills
   */
  async getBillsPaidByMoney(
    userId: string,
    month: number,
    year: number
  ): Promise<Bill[]> {
    try {
      const moneyBills = await this.billRepository.find({
        where: [
          {
            userId,
            due: getMonthBetweenOperator(month, year),
            type: Not('creditCard'),
            bank2Id: IsNull(),
            isPayment: true
          }
        ]
      })

      return moneyBills
    } catch (error) {
      this.logger.error(
        'Bills - Error getting bills paid by money : ' + error,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('Bills - Error getting bills paid by money')
    }
  }

  /**
   * Fetch all bills with income money
   * @param {string} userId related user
   * @param {number} month related month
   * @param {number} year related year
   * @returns {Bill[]} list of bills
   */
  async getIncomeBills(userId: string, month: number, year: number): Promise<Bill[]> {
    try {
      const incomeBills = await this.billRepository.find({
        where: [
          {
            userId,
            due: getMonthBetweenOperator(month, year),
            type: 'money',
            bank2Id: IsNull(),
            isPayment: false
          }
        ]
      })

      return incomeBills
    } catch (error) {
      this.logger.error(
        'Bills - Error getting income bills : ' + error,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('Bills - Error getting income bills')
    }
  }

  /**
   * List of bills count and sum per day of a month
   * @param {string} userId related user
   * @param {number} month related month
   * @param {number} year related year
   * @returns {SumAndCountType[]} array with sum and count of bills per day
   */
  async getDailyBillsCount(
    userId: string,
    month: number,
    year: number
  ): Promise<Array<{ day: number } & SumAndCountType>> {
    try {
      const bills = await this.getBillsByMonth(userId, month, year)

      const dailyBillsCount: Array<{ day: number } & SumAndCountType> = []

      for (let index = 1; index <= new Date(year, month + 1, 0).getDate(); index++) {
        const billsInThisDay = bills.filter((bill) => bill.due.getDate() === index)

        dailyBillsCount.push({
          count: billsInThisDay.length,
          total: billsInThisDay.reduce((acc, bill) => acc + bill.totalParcel, 0),
          day: index
        })
      }

      return dailyBillsCount
    } catch (error) {
      this.logger.error('error getting daily bills count : ' + error, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('bills - error getting money bills')
    }
  }

  async getBySearchTerm(searchTerm: string, userId: string) {
    if (!userId) {
      this.logger.error(`userId not found : userId : ${userId}`, this.logDirectory)
      ErrorHandler.BAD_REQUEST('bills - userId not found')
    }

    if (!searchTerm) {
      return []
    }
    try {
      const searchResult = await this.billRepository.find({
        select: { id: true, name: true, description: true, due: true, totalParcel: true },
        where: { name: ILike(`%${searchTerm}%`), userId },
        order: { due: 'DESC' },
        take: 20
      })

      return searchResult.map((bill) => ({
        id: bill.id,
        description: bill.description,
        title: bill.name,
        type: 'bill',
        date: bill.due,
        value: bill.totalParcel
      }))
    } catch (error) {
      this.logger.error(
        `error retrieving bill by search term : searchTerm : ${searchTerm} : error : ${error}`,
        this.logDirectory
      )
      ErrorHandler.NOT_FOUND_MESSAGE('bills - error retrieving bill by search term')
    }
  }

  async getPinnedBills(userId: string, pinnedBills: string[]) {
    if (!userId) {
      this.logger.error(`userId not found : userId : ${userId}`, this.logDirectory)
      ErrorHandler.BAD_REQUEST('bills - userId not found')
    }

    try {
      const apiCalls = pinnedBills.map((billId) => this.getBillById(billId))

      const results = await Promise.all(apiCalls)

      return results
    } catch (error) {
      this.logger.error(
        `error retrieving pinned bills : error : ${error}`,
        this.logDirectory
      )
      ErrorHandler.NOT_FOUND_MESSAGE('bills - error retrieving pinned bills')
    }
  }
}
