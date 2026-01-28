import { Controller, Get, Query, Req, Res } from '@nestjs/common'
import { ErrorHandler } from '../utils/ErrorHandler'
import { ResponseHandler } from '../utils/ResponseHandler'
import { Response, Request } from 'express'
import { SumAndCountType } from 'src/application/core/types/general'
import { HomeService } from './home.service'
import * as path from 'path'
import { GeneralController } from '../app/general/controller.general'
import { HOME_MODULE } from '../core/consts/filename.consts'

@Controller('home')
export class HomeController extends GeneralController {
  constructor(private readonly homeService: HomeService) {
    super(path.join(__dirname, HOME_MODULE.controller))
  }

  @Get('/expenses')
  public async getExpensesInfo(
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const userId = req.user.id

    const { month, year } = query
    const monthRef = parseInt(month) || new Date().getMonth()
    const yearRef = parseInt(year) || new Date().getFullYear()

    try {
      const result = await this.homeService.getBillsDetails(userId, monthRef, yearRef)

      this.logger.info(
        `successfully retrieved bills expenses info : userId : ${userId} : month ${month} : year : ${year}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/savings')
  public async getSavingsInfo(
    @Req() req: Request,
    @Query() query: any,
    @Res() res: Response
  ): Promise<Response<SumAndCountType> | void> {
    const userId = req.user.id

    const { month, year } = query
    const monthRef = parseInt(month) || new Date().getMonth()
    const yearRef = parseInt(year) || new Date().getFullYear()

    try {
      const result = await this.homeService.getSavingsTotal(userId, monthRef, yearRef)

      this.logger.info(
        `successfully retrieved savings info : userId : ${userId} : month ${month} : year : ${year}`,
        this.logDirectory
      )
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/invoices')
  public async getInvoicesInfo(
    @Req() req: Request,
    @Query() query: any,
    @Res() res: Response
  ): Promise<Response<SumAndCountType> | void> {
    const userId = req.user.id

    const { month, year } = query
    const monthRef = parseInt(month) || new Date().getMonth()
    const yearRef = parseInt(year) || new Date().getFullYear()

    try {
      const result = await this.homeService.getCreditCardValues(userId, monthRef, yearRef)

      this.logger.info(
        `successfully retrieved invoices info : userId : ${userId} : month ${month} : year : ${year}`,
        this.logDirectory
      )
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/recents')
  public async getRecentBills(
    @Req() req: Request,
    @Query() query: any,
    @Res() res: Response
  ) {
    const userId = req.user.id

    const { month, year } = query
    const monthRef = parseInt(month) || new Date().getMonth()
    const yearRef = parseInt(year) || new Date().getFullYear()

    try {
      const result = await this.homeService.getLastFiveBills(userId, monthRef, yearRef)

      this.logger.info(
        `successfully retrieved recent bills : userId : ${userId} : month ${month} : year : ${year}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
