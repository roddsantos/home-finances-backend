import { Injectable } from '@nestjs/common'
import { Bill } from './bill.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import {
  CreateBankTransactionDto,
  CreateCompanyBillDto,
  CreateCreditCardBillDto
} from './dto/bill-creation.dto'
import { UpdateBillTemplateDto } from './dto/update-bill.dto'
import { GetBillsDto } from './dto/get-bills.dto'

@Injectable()
export class BillService {
  constructor(private readonly billService: typeof Bill) {}

  async createTransactionBill(
    createTransactionBillDto: CreateBankTransactionDto & UpdateBillTemplateDto
  ) {
    try {
      const res = await this.billService.create(createTransactionBillDto)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async createCompanyBill(
    createCompanyBillDto: CreateCompanyBillDto & UpdateBillTemplateDto
  ) {
    try {
      const res = await this.billService.create(createCompanyBillDto)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async createCreditCardBill(
    createCreditCardBillDto: CreateCreditCardBillDto & UpdateBillTemplateDto
  ) {
    try {
      const res = await this.billService.create(createCreditCardBillDto)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async updateTransactionBill(
    updateTransactionBillDto: UpdateBillTemplateDto & UpdateBillTemplateDto
  ) {
    try {
      const res = await this.billService.update(
        { ...updateTransactionBillDto },
        { where: { id: updateTransactionBillDto.id } }
      )
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async updateCompanyBill(
    updateCompanyBillDto: UpdateBillTemplateDto & UpdateBillTemplateDto
  ) {
    try {
      const res = await this.billService.update(
        { ...updateCompanyBillDto },
        { where: { id: updateCompanyBillDto.id } }
      )
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async updateCreditCardBill(
    updateCreditCardBillDto: CreateCreditCardBillDto & UpdateBillTemplateDto
  ) {
    try {
      const res = await this.billService.update(
        { ...updateCreditCardBillDto },
        { where: { id: updateCreditCardBillDto.id } }
      )
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getBills(getBillsDto: GetBillsDto) {
    try {
      const { page, limit, ...rest } = getBillsDto
      const res = await this.billService.findAndCountAll({
        where: { ...rest },
        limit,
        offset: limit * page
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
