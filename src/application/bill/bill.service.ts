import { Injectable } from '@nestjs/common'
import { Bill } from './bill.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import {
  CreateBankTransactionDto,
  CreateCompanyBillDto,
  CreateCreditCardBillDto
} from './dto/bill-creation.dto'
import {
  UpdateBillBank,
  UpdateBillCompany,
  UpdateBillCreditCard
} from './dto/update-bill.dto'
import { GetBillsDto } from './dto/get-bills.dto'
import { CreateBillTemplateDto } from './dto/bill-template.dto'
import { Repository } from 'typeorm'

@Injectable()
export class BillService {
  constructor(private readonly billService: Repository<Bill>) {}

  async createTransactionBill(
    createTransactionBillDto: CreateBankTransactionDto & CreateBillTemplateDto
  ) {
    try {
      const res = await this.billService.create(createTransactionBillDto)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async createCompanyBill(
    createCompanyBillDto: CreateCompanyBillDto & CreateBillTemplateDto
  ) {
    try {
      const res = await this.billService.create(createCompanyBillDto)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async createCreditCardBill(
    createCreditCardBillDto: CreateCreditCardBillDto & CreateBillTemplateDto
  ) {
    try {
      const res = await this.billService.create(createCreditCardBillDto)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async updateTransactionBill(
    id: string,
    bankId: string,
    data: Omit<UpdateBillBank, 'id' | 'bank1'>
  ) {
    try {
      const res = await this.billService.update(data, {
        id,
        bank1: { id: bankId }
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
        company: { id: companyId }
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
        creditCard: { id: creditCardId }
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
    data: Omit<GetBillsDto, 'limit' | 'page' | 'user'>
  ) {
    try {
      const { typeBill, ...rest } = data
      const res = await this.billService.find({
        relations: ['creditCard', 'company', 'bank', 'typeBill'],
        ...rest,
        take,
        skip: take * page,
        where: { user: { id: userId }, typeBill: { id: typeBill } }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
