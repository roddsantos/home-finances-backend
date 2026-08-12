import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res
} from '@nestjs/common'
import { BillService } from './bill.service'
import { Response, Request } from 'express'
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
import { objectToString } from '../utils/conversions'
import { CacheService } from '../cache/cache.service'

@Controller('bill')
export class BillController extends GeneralController {
  constructor(
    private readonly billService: BillService,
    private readonly updateBillService: UpdateBillService,
    private readonly createBillService: CreateBillService,
    private readonly quickSettleBillService: QuickSettleBillService,
    private readonly cacheService: CacheService
  ) {
    super(path.join(__dirname, BILL_MODULE.controller))
  }

  @Post('/transaction')
  public async createTransaction(
    @Body() data: CreateBillTemplateDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user?.id

      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('bills - missing body data')
      if (!data.bank1Id) {
        this.logger.error(
          `error creating credit card bill : missing bank1Id : payload : ${JSON.stringify(data)}`,
          this.logDirectory
        )
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('bills - missing bank1Id')
      }
      if (data.bank1Id === data.bank2Id)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('bills - banks cant be the same')

      const result = await this.createBillService.createTransactionBill({
        ...data,
        userId
      })

      this.cacheService.deleteCacheBySectionAndKey('bills', userId)
      if (data.settled) this.cacheService.deleteCacheBySectionAndKey('banks', userId)

      this.logger.info(
        `successfully created transaction bill with id : ${result.bill.id} : payload : ${JSON.stringify(data)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Post('/cc')
  public async createCc(
    @Body() data: CreateBillTemplateDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user?.id

      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('bills - missing body data')
      if (!data.creditCardId) {
        this.logger.error(
          `error creating credit card bill : missing creditCardId : payload : ${JSON.stringify(data)}`,
          this.logDirectory
        )
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('bills - missing creditCardId')
      }

      const result = await this.createBillService.createCreditCardBill({
        ...data,
        userId
      })

      this.cacheService.deleteCacheBySectionAndKey('bills', userId)
      if (data.settled)
        this.cacheService.deleteCacheBySectionAndKey('creditCards', userId)

      this.logger.info(
        `successfully created credit card bill with groupId : ${result.bill.groupId} : payload : ${JSON.stringify(data)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Post('/company')
  public async createCompany(
    @Body() data: CreateBillTemplateDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user?.id

      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('bills - missing body data')
      if (!data.companyId) {
        this.logger.error(
          `error creating credit card bill : missing companyId : payload : ${JSON.stringify(data)}`,
          this.logDirectory
        )
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('bills - missing companyId')
      }
      if (data.creditCardId && data.bank1Id) {
        this.logger.error(
          `bank and credit card can't be present together : payload : ${objectToString(data)}`,
          this.logDirectory
        )
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE(
          "bills - bank and credit card can't be present together"
        )
      }

      const result = await this.createBillService.createCompanyCreditBill({
        ...data,
        userId
      })

      if (data.settled) {
        if (data.creditCardId)
          this.cacheService.deleteCacheBySectionAndKey('creditCards', userId)
        if (data.bank1Id) this.cacheService.deleteCacheBySectionAndKey('banks', userId)
      }

      this.logger.info(
        `successfully created company bill with groupId : ${result.bill.groupId} :` +
          ` payload : ${JSON.stringify(data)}`,
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
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user?.id
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('bills - missing body data')
      if (!data.id)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('bills - missing required field : id')

      const result = await this.updateBillService.updateTransactionBill({
        ...data,
        userId
      })

      this.cacheService.deleteCacheBySectionAndKey('bills', userId)
      if (result.bill.settled && (data.total || data.totalParcel))
        this.cacheService.deleteCacheBySectionAndKey('banks', userId)

      this.logger.info(
        `successfully updated transaction bill with id : ${data.id} : payload : ${JSON.stringify(data)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch('/cc')
  public async updateCc(
    @Body() data: UpdateBillTemplateDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user?.id
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('bills - missing body data')
      if (!data.id)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('bills - missing required field : id')

      const result = await this.updateBillService.updateCreditCardBill({
        ...data,
        userId
      })

      this.cacheService.deleteCacheBySectionAndKey('bills', userId)
      if (result.bill.settled && (data.total || data.totalParcel))
        this.cacheService.deleteCacheBySectionAndKey('creditCards', userId)

      this.logger.info(
        `successfully updated transaction bill with id : ${data.id} : payload : ${JSON.stringify(data)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch('/company')
  public async updateCompany(
    @Body() data: UpdateBillTemplateDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user?.id
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('bills - missing body data')
      const result = await this.updateBillService.updateCompanyBill({ ...data, userId })
      if (result.bill.settled && (data.total || data.totalParcel)) {
        if (result.bill.creditCardId)
          this.cacheService.deleteCacheBySectionAndKey('creditCards', userId)
        if (result.bill.bank1Id)
          this.cacheService.deleteCacheBySectionAndKey('banks', userId)
      }
      this.logger.info(
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
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      const userId = req.user.id
      const result = await this.quickSettleBillService.quickSettle(id, data)

      const payload = Object.keys(data).length > 0 ? JSON.stringify(data) : 'none'

      this.cacheService.deleteCacheBySectionAndKey('bills', userId)
      if (result.creditCardId)
        this.cacheService.deleteCacheBySectionAndKey('creditCards', userId)
      if (result.bank1Id) this.cacheService.deleteCacheBySectionAndKey('banks', userId)

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
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user.id
      const result = await this.quickSettleBillService.reversingQuickSettle(id, data)

      const payload = Object.keys(data).length > 0 ? JSON.stringify(data) : 'none'

      this.cacheService.deleteCacheBySectionAndKey('bills', userId)
      if ((data.settled || data.total) && data.creditCardId)
        this.cacheService.deleteCacheBySectionAndKey('creditCards', userId)
      if ((data.settled || data.total) && data.bank1Id)
        this.cacheService.deleteCacheBySectionAndKey('banks', userId)

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
    @Req() req: Request,
    @Query() filters: GetBillsTemplateDto
  ) {
    try {
      const userId = req.user?.id
      const { page, limit, data } = filters
      // let result

      if (!Boolean(filters.page) || !Boolean(filters.limit))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE(
          'bills - missing required fields : page and/or limit'
        )

      // const resultCache: CachedBillsObjectType = this.cacheService.cacheResponse(
      //   'bills',
      //   userId
      // ) as CachedBillsObjectType

      // if (
      //   !resultCache ||
      //   (resultCache.page !== page && resultCache.pagination !== limit)
      // ) {
      //   result = await this.billService.getBills(userId, page, limit, data)
      //   this.cacheService.setCachedBills(userId, {
      //     page,
      //     pagination: limit,
      //     ...result
      //   })
      // } else result = resultCache
      const result = await this.billService.getBills(userId, page, limit, data)

      this.logger.info(
        `fetching bills : userId : ${userId} : page : ${page} : limit : ${limit} : filters : ${objectToString(filters)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/pinned')
  public async getPinnedBills(
    @Res() res: Response,
    @Req() req: Request,
    @Query() data: any
  ) {
    try {
      const userId = req.user?.id
      const { pinnedBills } = data

      if (!pinnedBills) return ResponseHandler.sendCreatedResponse([], res)

      const result = await this.billService.getPinnedBills(userId, pinnedBills)

      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
