import { Injectable } from '@nestjs/common'
import { Bill } from './bill.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import {
  UpdateBillBank,
  UpdateBillCompany,
  UpdateBillCreditCard
} from './dto/update-bill.dto'
import { GetBillsDto } from './dto/get-bills.dto'
import { BillBank, BillCompany, BillCreditCard } from './dto/bill-template.dto'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private readonly billService: Repository<Bill>
  ) {}

  async createTransactionBill(createTransactionBillDto: BillBank) {
    try {
      const res = await this.billService.save(createTransactionBillDto)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async createCompanyBill(createCompanyBillDto: BillCompany) {
    try {
      const res = await this.billService.create(createCompanyBillDto)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async createCreditCardBill(createCreditCardBillDto: BillCreditCard) {
    try {
      const res = await this.billService.create(createCreditCardBillDto)
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
        ...rest,
        take,
        skip: take * page,
        where: { userId, typeBillId }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
