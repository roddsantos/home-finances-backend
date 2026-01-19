import { Body, Controller, Get, Param, Patch, Post, Query, Res } from '@nestjs/common'
import { BillService } from './bill.service'
import { Response } from 'express'
import { ErrorHandler } from '../utils/ErrorHandler'
import { ResponseHandler } from '../utils/ResponseHandler'
import { UpdateBillService } from './services/update-bill.service'
import { CreateBillService } from './services/create-bill.service'
import { QuickSettleBillService } from './services/quick-settle-bill.service'
import {
  CreateBillTemplateDto,
  GetBillsTemplateDto,
  UpdateBillTemplateDto
} from '../core/types/bill'
import { GeneralController } from '../app/general/controller.general'
import * as path from 'path'
import { BILL_MODULE } from '../core/consts/filename.consts'

@Controller('bill')
export class BillController extends GeneralController {
  constructor(
    private readonly billService: BillService,
    private readonly updateBillService: UpdateBillService,
    private readonly createBillService: CreateBillService,
    private readonly quickSettleBillService: QuickSettleBillService
  ) {
    super(path.join(__dirname, BILL_MODULE.controller))
  }

  verifyCreateTemplate(data: CreateBillTemplateDto) {
    return (
      !data.name ||
      !data.description ||
      !data.categoryId ||
      !data.userId ||
      data.total <= 0 ||
      !data.due
    )
  }

  verifyUpdateTemplate(data: UpdateBillTemplateDto) {
    return !data.id
  }

  @Post('/transaction')
  public async createTransaction(
    @Body() data: CreateBillTemplateDto,
    @Res() res: Response
  ) {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (this.verifyCreateTemplate(data) || !data.bank1Id)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (data.bank1Id === data.bank2Id)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Banks cant be the same')

      const result = await this.createBillService.createTransactionBill(data)
      this.logger.info(
        // eslint-disable-next-line max-len
        `successfully created transaction bill with id : ${result.bill.id} : payload : ${JSON.stringify(data)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Post('/cc')
  public async createCc(@Body() data: CreateBillTemplateDto, @Res() res: Response) {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (this.verifyCreateTemplate(data) || !data.creditCardId || data.parcels < 0)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')

      const result = await this.createBillService.createCreditCardBill(data)
      this.logger.info(
        // eslint-disable-next-line max-len
        `successfully created credit card bill with groupId : ${result[0].groupId} : payload : ${JSON.stringify(data)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Post('/company')
  public async createCompany(@Body() data: CreateBillTemplateDto, @Res() res: Response) {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (this.verifyCreateTemplate(data) || !data.companyId || !Boolean(data.due))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (data.creditCardId && data.bank1Id)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE(
          "Bank and credit card can't be present together"
        )

      const result = await this.createBillService.createCompanyCreditBill(data)
      this.logger.info(
        // eslint-disable-next-line max-len
        `successfully created company bill with groupId : ${result[0].groupId} : payload : ${JSON.stringify(data)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch('/transaction')
  public async updateTransaction(
    @Body() data: UpdateBillTemplateDto,
    @Res() res: Response
  ) {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing data to update')
      if (!data.id) ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing id')

      const { id, ...rest } = data
      const result = await this.updateBillService.updateTransactionBill(id, rest)
      this.logger.info(
        // eslint-disable-next-line max-len
        `successfully updated transaction bill with id : ${id} : payload : ${JSON.stringify(data)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch('/cc')
  public async updateCc(@Body() data: UpdateBillTemplateDto, @Res() res: Response) {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (this.verifyUpdateTemplate(data) || !data.creditCardId)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')

      const result = await this.updateBillService.updateCreditCardBill(data)
      this.logger.info(
        // eslint-disable-next-line max-len
        `successfully updated transaction bill with id : ${data.id} : payload : ${JSON.stringify(data)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch('/company')
  public async updateCompany(@Body() data: UpdateBillTemplateDto, @Res() res: Response) {
    try {
      if (!Boolean(data) || this.verifyUpdateTemplate(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (data.paid && !data.settled)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE(
          'Missing Required Fields: settled needs to be checked when setting a paid date'
        )
      const result = await this.updateBillService.updateCompanyBill(data.id, data)
      this.logger.info(
        // eslint-disable-next-line max-len
        `successfully updated company bill with id : ${data.id} : payload : ${JSON.stringify(data)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch('/quick-settle/:id')
  public async quickSetting(
    @Param('id') id: string,
    @Body() data: UpdateBillTemplateDto,
    @Res() res: Response
  ) {
    try {
      const result = await this.quickSettleBillService.quickSettle(id, data)

      const payload = Object.keys(data).length > 0 ? JSON.stringify(data) : 'none'
      this.logger.info(
        `quick settle bill successfully updated : payload : ${payload}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch('/redo-quick-settle/:id')
  public async redoQuickSetting(
    @Param('id') id: string,
    @Body() data: UpdateBillTemplateDto,
    @Res() res: Response
  ) {
    try {
      const result = await this.quickSettleBillService.reversingQuickSettle(id, data)

      const payload = Object.keys(data).length > 0 ? JSON.stringify(data) : 'none'
      this.logger.info(
        `quick settle bill successfully reversed : id : ${id} payload : ${payload}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get()
  public async getFilteredBills(
    @Res() res: Response,
    @Query() filters: GetBillsTemplateDto
  ) {
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
