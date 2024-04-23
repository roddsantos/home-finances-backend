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
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Bank } from '../bank/bank.entity'
import { BankService } from '../bank/bank.service'

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private readonly billService: Repository<Bill>,
    private readonly bankService: BankService
  ) {}

  async createTransactionBill(createTransactionBillDto: BillBank) {
    try {
      const { total, bank1Id, bank2Id } = createTransactionBillDto
      const bank1 = await this.bankService.getOneById(bank1Id)
      if (bank2Id && bank1) {
        const bank2 = await this.bankService.getOneById(bank2Id)
        const newBank1Value: Bank = { ...bank1, savings: bank1.savings - total }
        if (bank2) {
          const newBank2Value: Bank = { ...bank2, savings: bank2.savings + total }
          await this.bankService.update(bank1Id, newBank1Value)
          await this.bankService.update(bank2Id, newBank2Value)
        }
      } else {
        if (bank1) {
          const newBank1Value: Bank = { ...bank1, savings: bank1.savings + total }
          await this.bankService.update(bank1Id, newBank1Value)
        } else ErrorHandler.NOT_FOUND_MESSAGE('Bank not found')
      }
      const res = await this.billService.save(createTransactionBillDto)
      return res
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
      const res = await this.billService.save(createCreditCardBillDto)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async createServiceBill(createServiceBillDto: BillService2) {
    try {
      const res = await this.billService.save(createServiceBillDto)
      return res
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
