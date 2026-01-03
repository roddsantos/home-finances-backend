import { Injectable } from '@nestjs/common'
import { Bill } from './bill.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { FilterDisplay } from './dto/get-bills.dto'
import { BillCompany, BillCreditCard, BillService2 } from './dto/bill-template.dto'
import { IsNull, LessThan, MoreThan, Not, Or, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Bank } from '../bank/bank.entity'
import { BankService } from '../bank/bank.service'
import { getMonthBetweenOperator, operatorFilter } from '../utils/operators'
import { firstDayOfMonth, lastDayOfMonth } from '../utils/dates'
import { SumAndCountType } from 'src/application/core/types/general'
import { convertToFloat } from '../utils/conversions'
import * as path from 'path'
import { GeneralService } from '../app/general/service.general'
import { BILL_MODULE } from '../core/consts/filename.consts'

@Injectable()
export class BillService extends GeneralService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    private readonly bankService: BankService
  ) {
    super(path.join(__dirname, BILL_MODULE.service))
  }

  parcelsCcBills(bill: BillCreditCard) {
    const bills = [] as BillCreditCard[]
    let month = new Date(bill.due).getMonth()

    for (let i = 0; i < bill.parcels; i++) {
      const newDateDue = new Date(new Date(bill.due).setMonth(month))
      const newDatePaid = bill.paid ? new Date(new Date(bill.paid).setMonth(month)) : null
      const parcelObject = {
        ...bill,
        parcel: i,
        totalParcel:
          parseFloat(((bill.total + bill.taxes) / bill.parcels).toFixed(2)) +
          (i === bill.parcels - 1 ? bill.delta : 0),
        paid: bill.paid ? newDatePaid.toISOString() : null,
        due: newDateDue.toISOString()
      }
      bills.push(parcelObject)
      month = month + 1
    }
    return bills
  }

  parcelsCompanyCreditBills(bill: BillService2 | BillCompany) {
    try {
      const bills = [] as BillService2[]
      const dueDate = new Date(bill.due)
      let dueDay = dueDate.getDate()
      let dueMonth = dueDate.getMonth()
      let dueYear = dueDate.getFullYear()

      for (let i = 0; i < bill.parcels; i++) {
        const newYear = dueMonth + 1 > 11 ? dueYear + 1 : dueYear
        const newMonth = dueMonth + 1 > 11 ? 0 : dueMonth + 1
        const newDay =
          new Date(newYear, newMonth, dueDay).getDate() !== dueDay
            ? new Date(newYear, newMonth + 1, 0).getDate()
            : dueDay

        const newDate = new Date(newYear, newMonth, newDay).toISOString()
        const parcelObject = {
          ...bill,
          parcel: i,
          totalParcel:
            parseFloat(((bill.total + bill.taxes) / bill.parcels).toFixed(2)) +
            (i === bill.parcels - 1 ? bill.delta : 0),
          taxes: parseFloat((bill.taxes / bill.parcels).toFixed(2)),
          delta: i === bill.parcels - 1 ? bill.delta : 0,
          paid: null,
          due: newDate
        }
        bills.push(parcelObject)
        dueMonth = newMonth
        dueYear = newYear
        dueDay = newDay
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
    return await this.bankService.update(bank.id, newBankValue)
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
      this.logger.error(
        'Bills - Error getting the bills list : ' + error,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('Bills - Error getting the bills list')
    }
  }

  async getBillById(id: string) {
    try {
      return await this.billRepository.findOneBy({ id })
    } catch (error) {
      this.logger.error('Bills - Error getting bill by id : ' + error, this.logDirectory)
      return ErrorHandler.NOT_FOUND_MESSAGE('Bill not found')
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
        'Bills - Error getting bill by month : ' + error,
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR('Bills - Error getting bill by month')
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
      this.logger.error('Bills - Error getting money bills : ' + error, this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('Bills - Error getting money bills')
    }
  }
}
