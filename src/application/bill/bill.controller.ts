import { Body, Controller, Get, Patch, Post, Query, Res } from '@nestjs/common'
import { BillService } from './bill.service'
import { Response } from 'express'
import { ErrorHandler } from '../utils/ErrorHandler'
import {
  AllBillProps,
  BillBank,
  BillCompany,
  BillCreditCard,
  CreateBillTemplateDto
} from './dto/bill-template.dto'
import { ResponseHandler } from '../utils/ResponseHandler'
import {
  AllUpdateBillProps,
  UpdateBillBank,
  UpdateBillCompany,
  UpdateBillCreditCard,
  UpdateBillTemplateDto
} from './dto/update-bill.dto'
import { GetBillsDto } from './dto/get-bills.dto'

@Controller('bill')
export class BillController {
  constructor(private readonly billService: BillService) {}

  verifyCreateTemplate(data: Pick<AllBillProps, keyof CreateBillTemplateDto>) {
    return (
      !data.name ||
      !data.description ||
      !data.categoryId ||
      !data.userId ||
      data.total <= 0 ||
      !data.due
    )
  }

  verifyUpdateTemplate(data: Pick<AllUpdateBillProps, keyof UpdateBillTemplateDto>) {
    return !data.id || !data.name || data.description === ''
  }

  @Post('/transaction')
  public async createTransaction(@Body() data: BillBank, @Res() res: Response) {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (this.verifyCreateTemplate(data) || !data.bank1Id)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (data.bank1Id === data.bank2Id)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Banks cant be the same')

      const result = await this.billService.createTransactionBill(data)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Post('/cc')
  public async createCc(@Body() data: BillCreditCard, @Res() res: Response) {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (this.verifyCreateTemplate(data) || !data.creditCardId || data.parcels < 0)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')

      const result = await this.billService.createCreditCardBill(data)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Post('/company')
  public async createCompany(@Body() data: BillCompany, @Res() res: Response) {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (this.verifyCreateTemplate(data) || !data.companyId || !Boolean(data.due))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (data.creditCardId && data.bank1Id)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE(
          "Bank and credit card can't be present together"
        )

      const result = await this.billService.createCompanyCreditBill(data)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch('/transaction')
  public async updateTransaction(@Body() data: UpdateBillBank, @Res() res: Response) {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (this.verifyUpdateTemplate(data) || data.bank1Id)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')

      const { bank1Id, id, ...rest } = data
      const result = await this.billService.updateTransactionBill(id, bank1Id, rest)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch('/cc')
  public async updateCc(@Body() data: UpdateBillCreditCard, @Res() res: Response) {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (this.verifyUpdateTemplate(data) || !data.creditCardId)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')

      const { id, ...rest } = data
      const result = await this.billService.updateCreditCardBill(id, rest)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch('/company')
  public async updateCompany(@Body() data: UpdateBillCompany, @Res() res: Response) {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (!this.verifyUpdateTemplate(data) || data.company || Boolean(data.due))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')

      const { company, id, ...rest } = data
      const result = await this.billService.updateCompanyBill(id, company, rest)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get()
  public async getFilteredBills(@Res() res: Response, @Query() filters: GetBillsDto) {
    try {
      if (!Boolean(filters.page) || !Boolean(filters.limit) || !Boolean(filters.userId))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      const { page, limit, userId, data } = filters

      const result = await this.billService.getBills(userId, page, limit, data)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
