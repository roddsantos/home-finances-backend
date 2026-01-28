import { Controller, Get, Query, Req, Res } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { ResponseHandler } from '../utils/ResponseHandler'
import { Response, Request } from 'express'
import { ErrorHandler } from '../utils/ErrorHandler'
import { BillService } from '../bill/bill.service'
import * as path from 'path'
import { DASHBOARD_MODULE } from '../core/consts/filename.consts'
import { GeneralController } from '../app/general/controller.general'

@Controller('dashboard')
export class DashboardController extends GeneralController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly billService: BillService
  ) {
    super(path.join(__dirname, DASHBOARD_MODULE.controller))
  }

  @Get('/months')
  public async billProgression(
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const userId = req.user.id
    const { span, month, year } = query

    const monthSpan = span || 5
    const monthRef = month || new Date().getMonth()
    const yearRef = year || new Date().getFullYear()

    try {
      const result = await this.dashboardService.getBillProgression(
        userId,
        monthSpan,
        monthRef,
        yearRef
      )

      this.logger.info(
        `successfully retrieved bills progression : userId : ${userId} : month ${month} : year : ${year}`,
        this.logDirectory
      )
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/bills')
  public async getMonthBills(
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const userId = req.user.id
    const { month, year } = query

    const monthRef = month || new Date().getMonth()
    const yearRef = year || new Date().getFullYear()

    try {
      const result = await this.billService.getDailyBillsCount(userId, monthRef, yearRef)

      this.logger.info(
        `successfully retrieved daily month bills : userId : ${userId} : month ${month} : year : ${year}`,
        this.logDirectory
      )
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/savings')
  public async getSavingsInfo(
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const userId = req.user.id
    const { month, year } = query

    const monthRef = month || new Date().getMonth()
    const yearRef = year || new Date().getFullYear()

    try {
      const result = await this.dashboardService.getSavings(userId, monthRef, yearRef)

      this.logger.info(
        `successfully retrieved savings : userId : ${userId} : month ${month} : year : ${year}`,
        this.logDirectory
      )
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/credit-cards')
  public async getCreditCards(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id
    try {
      const result = await this.dashboardService.getCreditCards(userId)

      this.logger.info(
        `successfully retrieved credit cards resume : userId : ${userId}`,
        this.logDirectory
      )
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/categories')
  public async getTopCategories(
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const userId = req.user.id
    const { month, year, categories } = query

    const monthRef = month || new Date().getMonth()
    const yearRef = year || new Date().getFullYear()
    const numberOfCategories = categories || 5

    try {
      const bills = await this.billService.getBillsByMonth(userId, monthRef, yearRef, [
        'category'
      ])
      const { topCategories, otherCategories } =
        this.dashboardService.getSummaryOfCategories(bills, numberOfCategories)

      this.logger.info(
        `successfully retrieved top categories : userId : ${userId} : month ${month} : year : ${year}`,
        this.logDirectory
      )
      return ResponseHandler.sendResponse({ topCategories, otherCategories }, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
