import { Injectable, Logger } from '@nestjs/common'
import { Bill } from './bill.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import {
  UpdateBillBank,
  UpdateBillCompany,
  UpdateBillCreditCard
} from './dto/update-bill.dto'
import { GetBillsDto } from './dto/get-bills.dto'
import {
  BillBank,
  BillCompany,
  BillCreditCard,
  BillService2
} from './dto/bill-template.dto'
import { MoreThanOrEqual, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Bank } from '../bank/bank.entity'
import { BankService } from '../bank/bank.service'
import { CreditCardService } from '../credit-card/credit-card.service'
import { CreditCard } from '../credit-card/credit-card.entity'

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private readonly billService: Repository<Bill>,
    private readonly bankService: BankService,
    private readonly ccService: CreditCardService
  ) {}

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
        year,
        typeBillId: bill.typeBill.id
      }
      delete parcelObject.typeBill
      bills.push(parcelObject)
      month = month === 11 ? 0 : month + 1
      year = month === 11 ? year + 1 : year
    }
    return bills
  }

  parcelsServiceBills(bill: BillService2) {
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
        year,
        typeBillId: bill.typeBill.id
      }
      delete parcelObject.typeBill
      bills.push(parcelObject)
      month = month === 11 ? 0 : month + 1
      year = month === 11 ? year + 1 : year
    }
    return bills
  }

  async createTransactionBill(createTransactionBillDto: BillBank) {
    try {
      const { total, bank1Id, bank2Id } = createTransactionBillDto
      const bank1 = await this.bankService.getOneById(bank1Id)
      if (bank1) {
        if (bank2Id) {
          const newBank1Value: Bank = { ...bank1, savings: bank1.savings - total }
          const bank2 = await this.bankService.getOneById(bank2Id)
          if (bank2) {
            const newBank2Value: Bank = { ...bank2, savings: bank2.savings + total }
            await this.bankService.update(bank1Id, newBank1Value)
            await this.bankService.update(bank2Id, newBank2Value)

            const data = {
              ...createTransactionBillDto,
              typeBillId: createTransactionBillDto.typeBill.id
            }
            delete data.typeBill

            const res = await this.billService.save(data)
            return res
          } else ErrorHandler.NOT_FOUND_MESSAGE('Bank 2 not found')
        } else {
          const newBank1Value: Bank = { ...bank1, savings: bank1.savings + total }
          await this.bankService.update(bank1Id, newBank1Value)
          const res = await this.billService.save(createTransactionBillDto)
          return res
        }
      } else ErrorHandler.NOT_FOUND_MESSAGE('Bank 1 not found')
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async createCompanyBill(createCompanyBillDto: BillCompany) {
    try {
      const res = await this.billService.save(createCompanyBillDto)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async createCreditCardBill(createCreditCardBillDto: BillCreditCard) {
    try {
      const { creditCardId, total, taxes, delta, isRefund, month } =
        createCreditCardBillDto
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
      const allCcs = await Promise.all(
        bills.map((b) => {
          const res = this.billService.save(b)
          return res
        })
      )
      return allCcs
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async createServiceBill(createServiceBillDto: BillService2) {
    try {
      const { creditCardId, total, taxes, delta, month, bank1Id } = createServiceBillDto
      let data = null
      if (creditCardId)
        data = await this.ccService.getOneById(creditCardId, {
          isClosed: false,
          month: MoreThanOrEqual(month)
        })
      else data = await this.bankService.getOneById(bank1Id)

      const bills = this.parcelsServiceBills(createServiceBillDto)
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
      const allCcs = await Promise.all(
        bills.map((b) => {
          const res = this.billService.save(b)
          return res
        })
      )
      return allCcs
    } catch (error) {
      console.log('EEROR', error)
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

  async getBills(
    userId: string,
    page: number,
    take: number,
    data: Omit<GetBillsDto, 'limit' | 'page' | 'userId'>
  ) {
    try {
      const { typeBillId, ...rest } = data
      const res = await this.billService.find({
        relations: ['creditCard', 'company', 'bank1', 'bank2', 'typeBill'],
        take,
        skip: take * page - take,
        where: { ...rest, userId, typeBillId }
      })
      return res
    } catch (error) {
      Logger.log('here 2', error)
      return ErrorHandler.handle(error)
    }
  }
}
