import { Injectable } from '@nestjs/common'
import { Bill } from './bill.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import {
  UpdateBillBank,
  UpdateBillCompany,
  UpdateBillCreditCard
} from './dto/update-bill.dto'
import { FilterDisplay } from './dto/get-bills.dto'
import {
  BillBank,
  BillCompany,
  BillCreditCard,
  BillService2
} from './dto/bill-template.dto'
import { IsNull, LessThan, MoreThan, Not, Or, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Bank } from '../bank/bank.entity'
import { BankService } from '../bank/bank.service'
import { CreditCardService } from '../credit-card/credit-card.service'
import { CreditCard } from '../credit-card/credit-card.entity'
import { UUID } from '../utils/uuid'
import { getMonthBetweenOperator, operatorFilter } from '../utils/operators'
import { firstDayOfMonth, lastDayOfMonth } from '../utils/dates'
import { SumAndCountType } from '../types/general'
import { convertToFloat } from '../utils/conversions'

@Injectable()
export class BillService {
  private readonly uuid: UUID
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    private readonly bankService: BankService,
    private readonly ccService: CreditCardService
  ) {
    this.uuid = new UUID()
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
    const bills = [] as BillService2[]
    let month = new Date(bill.due).getMonth()

    for (let i = 0; i < bill.parcels; i++) {
      month = month + 1
      const newDate = new Date(new Date(bill.due).setMonth(month))
      const parcelObject = {
        ...bill,
        parcel: i,
        totalParcel:
          parseFloat(((bill.total + bill.taxes) / bill.parcels).toFixed(2)) +
          (i === bill.parcels - 1 ? bill.delta : 0),
        taxes: parseFloat((bill.taxes / bill.parcels).toFixed(2)),
        delta: i === bill.parcels - 1 ? bill.delta : 0,
        paid: null,
        due: newDate.toISOString()
      }
      bills.push(parcelObject)
    }
    return bills
  }

  async createTransactionBill(createTransactionBillDto: BillBank) {
    try {
      const { total, bank1Id, bank2Id, isPayment, settled } = createTransactionBillDto
      const bank1 = await this.bankService.getOneById(bank1Id)
      if (bank1 && settled) {
        if (bank2Id) {
          const bank2 = await this.bankService.getOneById(bank2Id)
          if (bank2) {
            const newBank1Value: Bank = {
              ...bank1,
              savings: bank1.savings + total * (isPayment ? -1 : 1)
            }
            const newBank2Value: Bank = {
              ...bank2,
              savings: bank2.savings + total * (isPayment ? 1 : -1)
            }
            await this.bankService.update(bank1Id, newBank1Value)
            await this.bankService.update(bank2Id, newBank2Value)

            const res = await this.billRepository.save({
              ...createTransactionBillDto,
              totalParcel: total
            })
            return res
          } else ErrorHandler.NOT_FOUND_MESSAGE('Bank 2 not found')
        } else {
          const newBank1Value: Bank = {
            ...bank1,
            savings: bank1.savings + total * (isPayment ? -1 : 1)
          }
          await this.bankService.update(bank1Id, newBank1Value)
          const res = await this.billRepository.save({
            ...createTransactionBillDto,
            totalParcel: total
          })
          return res
        }
      } else if (!settled) {
        const res = await this.billRepository.save({
          ...createTransactionBillDto,
          totalParcel: total
        })
        return res
      } else ErrorHandler.NOT_FOUND_MESSAGE('Bank 1 not found')
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async createCompanyCreditBill(createCompanyBillDto: BillCompany) {
    try {
      const groupId = this.uuid.v4()

      const bills = this.parcelsCompanyCreditBills(createCompanyBillDto)

      const allBills = await Promise.all(
        bills.map((b) => {
          const res = this.billRepository.save({ ...b, groupId })
          return res
        })
      )
      return allBills
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async createCreditCardBill(createCreditCardBillDto: BillCreditCard) {
    try {
      const { creditCardId, total, taxes, delta, isRefund, settled } =
        createCreditCardBillDto
      const groupId = this.uuid.v4()

      const bills = this.parcelsCcBills(createCreditCardBillDto)
      if (settled) {
        const cc = await this.ccService.getOneById(creditCardId, {
          isClosed: false
        })
        if (cc) {
          const newCcObject: CreditCard = {
            ...cc,
            limit: cc.limit + (total + taxes + delta) * (isRefund ? 1 : -1),
            invoice: cc.invoice + bills[0].totalParcel * (isRefund ? -1 : 1)
          }
          await this.ccService.update(creditCardId, newCcObject)
        } else throw ErrorHandler.CONFLICT_MESSAGE("This card can't be used")
      }

      const allBills = await Promise.all(
        bills.map((b) => {
          const res = this.billRepository.save({ ...b, groupId })
          return res
        })
      )
      return allBills
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async updateTransactionBill(id: string, data: Omit<UpdateBillBank, 'id'>) {
    const isQuickSettle = id && data.settled && !data.bank1Id

    try {
      const { settled, bank1Id, bank2Id, total, isPayment } = data
      const bill = await this.billRepository.findOneBy({ id })
      if (!bill) ErrorHandler.NOT_FOUND_MESSAGE('Bill not found')

      const newTotalDelta = isQuickSettle
        ? bill.total
        : !bill.settled
          ? total
          : total - bill.total

      const bank1 = await this.bankService.getOneById(bank1Id)
      if (!bank1) ErrorHandler.NOT_FOUND_MESSAGE('Bank 1 not found')

      if (settled && newTotalDelta !== 0) {
        const newBank1Object: Bank = {
          ...bank1,
          id: bank1Id,
          savings: bank1.savings + newTotalDelta * (isPayment ? -1 : 1)
        }
        if (bank2Id) {
          const bank2 = await this.bankService.getOneById(bank2Id)
          if (!bank2) ErrorHandler.NOT_FOUND_MESSAGE('Bank 2 not found')
          const newBank2Object: Bank = {
            ...bank2,
            id: bank2Id,
            savings: bank2.savings + newTotalDelta * (isPayment ? 1 : -1)
          }
          await this.bankService.update(bank2Id, newBank2Object)
        }
        await this.bankService.update(bank1Id, newBank1Object)
      }

      const res = await this.billRepository.update(id, { ...data })
      return res
    } catch (error) {
      ErrorHandler.handle(error)
    }
  }

  async updateCompanyBill(id: string, data: Partial<Omit<UpdateBillCompany, 'id'>>) {
    const isQuickSettle = id && data.settled && !data.companyId

    try {
      const bill = await this.billRepository.findOneBy({ id })
      if (!bill) ErrorHandler.NOT_FOUND_MESSAGE('Bill not found')

      const newDelta = bill.parcel === bill.parcels - 1 ? data.delta - bill.delta : 0
      const newTotalParcel =
        data.taxes !== undefined
          ? bill.totalParcel + (data.taxes - bill.taxes) + newDelta
          : bill.totalParcel

      const bank1Id = isQuickSettle ? bill.bank1Id : data.bank1Id
      const creditCardId = isQuickSettle ? bill.creditCardId : data.creditCardId
      const { totalParcel, parcels, total } = bill

      if (data.settled) {
        if (bank1Id) {
          const bank = await this.bankService.getOneById(bank1Id)
          if (!bank) ErrorHandler.NOT_FOUND_MESSAGE('Bank not found')
          else {
            const savings = isQuickSettle
              ? bank.savings - (parcels > 1 ? newTotalParcel : total)
              : bank.savings - newTotalParcel
            const newBankValue: Bank = {
              ...bank,
              id: bank1Id,
              savings
            }
            await this.bankService.update(bank1Id, newBankValue)
          }
        } else if (creditCardId) {
          const cc = await this.ccService.getOneById(creditCardId)
          if (!cc) ErrorHandler.NOT_FOUND_MESSAGE('Credit card not found')
          else {
            const calculatedValue = isQuickSettle
              ? parcels > 1
                ? totalParcel
                : total
              : data.parcels > 1
                ? data.totalParcel
                : data.total
            const newCcObject: CreditCard = {
              ...cc,
              limit: cc.limit - calculatedValue,
              invoice: cc.invoice + calculatedValue
            }
            await this.ccService.update(creditCardId, newCcObject)
          }
        } else
          ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE(
            'Neither credit card nor bank were found'
          )
      }

      const res = await this.billRepository.update(id, {
        ...data,
        paid: data.settled ? data.paid || new Date() : null,
        totalParcel: newTotalParcel
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async updateCreditCardBill(id: string, data: Omit<UpdateBillCreditCard, 'id'>) {
    const {
      total,
      taxes,
      delta,
      isRefund,
      groupId,
      parcel,
      parcels,
      totalParcel,
      creditCardId,
      due,
      settled
    } = data

    try {
      if (!groupId) throw ErrorHandler.NOT_FOUND_MESSAGE('Group id not found')
      const allBillsRelated = await this.billRepository.find({
        where: {
          groupId
        }
      })
      if (allBillsRelated.length === 0)
        throw ErrorHandler.NOT_FOUND_MESSAGE('Bill not found')
      const firstBill = allBillsRelated[0]

      let month = new Date(due).getMonth()
      const allPromises = await Promise.all(
        allBillsRelated.map((abr, i) => {
          const newDate = new Date(new Date(due).setMonth(month))
          const updateData = this.billRepository.update(abr.id, {
            ...data,
            parcel: abr.parcel,
            totalParcel:
              parseFloat(((total + taxes) / parcels).toFixed(2)) +
              (i === parcels - 1 ? delta : 0),
            paid: newDate.toISOString(),
            due: newDate.toISOString()
          })
          month = month + 1
          return updateData
        })
      )

      if (
        (firstBill.total !== total ||
          firstBill.taxes !== taxes ||
          firstBill.delta !== delta) &&
        parcel > 0
      )
        throw ErrorHandler.NOT_ACCEPTABLE(
          "Can't change bill value after first one is processed"
        )

      if (allPromises.length !== allBillsRelated.length)
        throw ErrorHandler.SOME_PROMISE_NOT_COMPLETED_MESSAGE(
          'One or more bills were not updated'
        )

      if (settled && !firstBill.settled) {
        const cc = await this.ccService.getOneById(creditCardId, {
          isClosed: false
        })
        if (cc) {
          const valueForLimit =
            parcel > 0
              ? total - (parcel * total + taxes + (parcels === parcel - 1 ? delta : 0))
              : total + taxes + delta
          const newCcObject: CreditCard = {
            ...cc,
            limit: cc.limit + valueForLimit * (isRefund ? 1 : -1),
            invoice: cc.invoice + totalParcel * (isRefund ? -1 : 1)
          }
          await this.ccService.update(creditCardId, newCcObject)
        }
      }
      return {
        affected: allBillsRelated.map((abr) => abr.id)
      }
    } catch (error) {
      ErrorHandler.handle(error)
    }
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

      return {
        count: total,
        data: result,
        total: convertToFloat(sum)
      }
    } catch (error) {
      ErrorHandler.INTERNAL_SERVER_ERROR('Error getting the bills list')
    }
  }

  async getBillById(id: string) {
    const bill = await this.billRepository.findOneBy({ id })
    if (bill) return bill
    else ErrorHandler.NOT_FOUND_MESSAGE('Bill not found')
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
            bank2Id: IsNull(),
            isRefund: false
          },
          {
            userId,
            due: getMonthBetweenOperator(month, year),
            type: 'creditCard',
            isRefund: false
          },
          {
            userId,
            due: Or(
              LessThan(firstDayOfMonth(month, year)),
              MoreThan(lastDayOfMonth(month, year))
            ),
            paid: getMonthBetweenOperator(month, year),
            isPayment: true,
            bank2Id: IsNull(),
            isRefund: false
          }
        ]
      })
      return bills
    } catch (error) {
      ErrorHandler.INTERNAL_SERVER_ERROR("Can't find bills")
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
      ErrorHandler.INTERNAL_SERVER_ERROR('Error fetching money bills')
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
      ErrorHandler.INTERNAL_SERVER_ERROR('Error fetching money bills')
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
      ErrorHandler.INTERNAL_SERVER_ERROR('Error fetching money bills')
    }
  }
}
