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
import { Between, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Bank } from '../bank/bank.entity'
import { BankService } from '../bank/bank.service'
import { CreditCardService } from '../credit-card/credit-card.service'
import { CreditCard } from '../credit-card/credit-card.entity'
import { UUID } from '../utils/uuid'

@Injectable()
export class BillService {
  private readonly uuid: UUID
  constructor(
    @InjectRepository(Bill)
    private readonly billService: Repository<Bill>,
    private readonly bankService: BankService,
    private readonly ccService: CreditCardService
  ) {
    this.uuid = new UUID()
  }

  parcelsCcBills(bill: BillCreditCard) {
    const bills = [] as BillCreditCard[]
    let month = bill.month
    let year = bill.year

    for (let i = 0; i < bill.parcels; i++) {
      const parcelObject = {
        ...bill,
        parcel: i,
        totalParcel:
          parseFloat(((bill.total + bill.taxes) / bill.parcels).toFixed(2)) +
          (i === bill.parcels - 1 ? bill.delta : 0),
        month,
        year
      }
      bills.push(parcelObject)
      month = month === 11 ? 0 : month + 1
      year = month === 11 ? year + 1 : year
    }
    return bills
  }

  parcelsServiceCompanyBills(bill: BillService2 | BillCompany) {
    const bills = [] as BillService2[]
    let month = bill.month
    let year = bill.year

    for (let i = 0; i < bill.parcels; i++) {
      const parcelObject = {
        ...bill,
        parcel: i,
        totalParcel:
          parseFloat(((bill.total + bill.taxes) / bill.parcels).toFixed(2)) +
          (i === bill.parcels - 1 ? bill.delta : 0),
        month,
        year
      }
      bills.push(parcelObject)
      month = month === 11 ? 0 : month + 1
      year = month === 11 ? year + 1 : year
    }
    return bills
  }

  async createTransactionBill(createTransactionBillDto: BillBank) {
    try {
      const { total, bank1Id, bank2Id, isPayment, settled } = createTransactionBillDto
      const bank1 = await this.bankService.getOneById(bank1Id)
      if (bank1 && settled) {
        if (bank2Id) {
          const newBank1Value: Bank = {
            ...bank1,
            savings: bank1.savings - total * (isPayment ? -1 : 1)
          }
          const bank2 = await this.bankService.getOneById(bank2Id)
          if (bank2) {
            const newBank2Value: Bank = {
              ...bank2,
              savings: bank2.savings + total * (isPayment ? 1 : -1)
            }
            await this.bankService.update(bank1Id, newBank1Value)
            await this.bankService.update(bank2Id, newBank2Value)

            const res = await this.billService.save(createTransactionBillDto)
            return res
          } else ErrorHandler.NOT_FOUND_MESSAGE('Bank 2 not found')
        } else {
          const newBank1Value: Bank = {
            ...bank1,
            savings: bank1.savings + total * (isPayment ? -1 : 1)
          }
          await this.bankService.update(bank1Id, newBank1Value)
          const res = await this.billService.save(createTransactionBillDto)
          return res
        }
      } else if (!settled) {
        const res = await this.billService.save(createTransactionBillDto)
        return res
      } else ErrorHandler.NOT_FOUND_MESSAGE('Bank 1 not found')
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async createCompanyBill(createCompanyBillDto: BillCompany) {
    try {
      const { creditCardId, total, taxes, delta, month, bank1Id } = createCompanyBillDto
      const groupId = this.uuid.v4()

      let data = null
      if (creditCardId)
        data = await this.ccService.getOneById(creditCardId, {
          isClosed: false,
          month: MoreThanOrEqual(month)
        })
      else data = await this.bankService.getOneById(bank1Id)

      const bills = this.parcelsServiceCompanyBills(createCompanyBillDto)
      if (creditCardId && data) {
        const newCcObject: CreditCard = {
          ...data,
          limit: data.limit + (total + taxes + delta) * -1,
          invoice: data.invoice + bills[0].totalParcel
        }
        await this.ccService.update(creditCardId, newCcObject)
      } else if (bank1Id && data) {
        const newBank1Value: Bank = { ...data, savings: data.savings - total }
        await this.bankService.update(bank1Id, newBank1Value)
      }

      const allBills = await Promise.all(
        bills.map((b) => {
          const res = this.billService.save({ ...b, groupId })
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
      const { creditCardId, total, taxes, delta, isRefund, month } =
        createCreditCardBillDto
      const groupId = this.uuid.v4()

      const cc = await this.ccService.getOneById(creditCardId, {
        isClosed: false,
        month: MoreThanOrEqual(month)
      })
      const bills = this.parcelsCcBills(createCreditCardBillDto)
      if (cc) {
        const newCcObject: CreditCard = {
          ...cc,
          limit: cc.limit + (total + taxes + delta) * (isRefund ? 1 : -1),
          invoice: cc.invoice + bills[0].totalParcel * (isRefund ? -1 : 1)
        }
        await this.ccService.update(creditCardId, newCcObject)
      }
      const allBills = await Promise.all(
        bills.map((b) => {
          const res = this.billService.save({ ...b, groupId })
          return res
        })
      )
      return allBills
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async createServiceBill(createServiceBillDto: BillService2) {
    try {
      const { creditCardId, total, taxes, delta, month, bank1Id, settled } =
        createServiceBillDto
      const groupId = this.uuid.v4()

      let data = null
      const bills = this.parcelsServiceCompanyBills(createServiceBillDto)

      if (settled) {
        if (creditCardId)
          data = await this.ccService.getOneById(creditCardId, {
            isClosed: false,
            month: MoreThanOrEqual(month)
          })
        else data = await this.bankService.getOneById(bank1Id)

        if (creditCardId && data) {
          const newCcObject: CreditCard = {
            ...data,
            limit: data.limit + (total + taxes + delta) * -1,
            invoice: data.invoice + bills[0].totalParcel
          }
          await this.ccService.update(creditCardId, newCcObject)
        } else if (bank1Id && data) {
          const newBank1Value: Bank = { ...data, savings: data.savings - total }
          await this.bankService.update(bank1Id, newBank1Value)
        }
      }
      const allBills = await Promise.all(
        bills.map((b) => {
          const res = this.billService.save({ ...b, groupId })
          return res
        })
      )
      return allBills
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async updateTransactionBill(
    id: string,
    bank1Id: string,
    data: Omit<UpdateBillBank, 'id' | 'bank1'>
  ) {
    try {
      const res = await this.billService.update(data, {
        id,
        bank1Id
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async updateCompanyBill(
    id: string,
    companyId: string,
    data: Omit<UpdateBillCompany, 'company' | 'id'>
  ) {
    try {
      const res = await this.billService.update(data, {
        id,
        companyId
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async updateCreditCardBill(
    id: string,
    creditCardId: string,
    data: Omit<UpdateBillCreditCard, 'creditCard' | 'id'>
  ) {
    try {
      const res = await this.billService.update(data, {
        id,
        creditCardId
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getBills(userId: string, page: number, take: number, data: any) {
    try {
      let parsedFilter: FilterDisplay[] = []
      const filterObject: any = {
        months: [],
        min: null,
        max: null,
        years: [],
        typeBillId: [],
        bankId: [],
        companyId: [],
        creditCardId: [],
        status: 'all'
      }
      if (data.length > 0) {
        parsedFilter = JSON.parse(data) as FilterDisplay[]
        parsedFilter.forEach((d) => {
          switch (d.identifier) {
            case 'month':
              filterObject.months!.push(d.id as number)
              break
            case 'year':
              filterObject.years!.push(d.id as number)
              break
            case 'min':
              filterObject.min! = d.id as number
              break
            case 'max':
              filterObject.max! = d.id as number
              break
            case 'status':
              filterObject.status = d.id as string
              break
            case 'typebill':
              filterObject.typeBillId.push(d.id)
              break
            case 'company':
              filterObject.companyId.push(d.id)
              break
            case 'creditcard':
              filterObject.creditCardId.push(d.id)
              break
            case 'bank':
              filterObject.bankId.push(d.id)
              break
            case 'status':
              filterObject.status = d.id as string
              break
            default:
              break
          }
        })
      }
      const finalFilter: any = {}
      // set months
      if (filterObject.months.length > 0) finalFilter.month = In([...filterObject.months])
      // set years
      if (filterObject.years.length > 0) finalFilter.year = In([...filterObject.years])
      // met min and max total values
      if (filterObject.min && filterObject.max)
        finalFilter.total = Between(filterObject.min, filterObject.max)
      else if (filterObject.min) finalFilter.total = MoreThanOrEqual(filterObject.min)
      else if (filterObject.max) finalFilter.total = LessThanOrEqual(filterObject.max)
      // set type bills ids
      if (filterObject.typeBillId.length > 0)
        finalFilter.typeBillId = In([...filterObject.typeBillId])
      // set banks ids
      if (filterObject.bankId.length > 0) {
        finalFilter.bank1Id = In([...filterObject.bankId])
        finalFilter.bank2Id = In([...filterObject.bankId])
      }
      // set companies ids
      if (filterObject.companyId.length > 0)
        finalFilter.companyId = In([...filterObject.companyId])
      // set credit cards ids
      if (filterObject.creditCardId.length > 0)
        finalFilter.creditCardId = In([...filterObject.creditCardId])
      // set status
      if (filterObject.status !== 'all')
        finalFilter.settled = filterObject.status === 'settled'

      const res = await this.billService.find({
        relations: ['creditCard', 'company', 'bank1', 'bank2', 'typeBill'],
        take,
        skip: take * page - take,
        where: [{ ...finalFilter, userId }]
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
