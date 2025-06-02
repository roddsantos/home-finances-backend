import { Controller, Get, Query, Res } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { ResponseHandler } from '../utils/ResponseHandler'
import { Response } from 'express'
import { ErrorHandler } from '../utils/ErrorHandler'
import { BillService } from '../bill/bill.service'

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly billService: BillService
  ) {}

  @Get('/months')
  public async billProgression(@Query() query: any, @Res() res: Response) {
    const { userId, span, month, year } = query
    if (!userId) ErrorHandler.BAD_REQUEST('/dashboard/months - No userId found')

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
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/bills')
  public async getMonthBills(@Query() query: any, @Res() res: Response) {
    const { userId, month, year } = query

    if (!userId) ErrorHandler.BAD_REQUEST('/dashboard/bills - No userId found')

    const monthRef = month || new Date().getMonth()
    const yearRef = year || new Date().getFullYear()

    try {
      const result = await this.billService.getBillsByMonth(userId, monthRef, yearRef)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/savings')
  public async getSavingsInfo(@Query() query: any, @Res() res: Response) {
    const { userId, month, year } = query

    if (!userId) ErrorHandler.BAD_REQUEST('/dashboard/savings - No userId found')

    const monthRef = month || new Date().getMonth()
    const yearRef = year || new Date().getFullYear()

    try {
      const result = await this.dashboardService.getSavings(userId, monthRef, yearRef)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/credit-cards')
  public async getCreditCards(@Query() data: any, @Res() res: Response) {
    try {
      const result = await this.dashboardService.getCreditCards(data.userId)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/categories')
  public async getTopCategories(@Query() query: any, @Res() res: Response) {
    const { userId, month, year, categories } = query

    if (!userId) ErrorHandler.BAD_REQUEST('/dashboard/months - No userId found')

    const monthRef = month || new Date().getMonth()
    const yearRef = year || new Date().getFullYear()
    const numberOfCategories = categories || 5

    try {
      const bills = await this.billService.getBillsByMonth(userId, monthRef, yearRef, [
        'category'
      ])

      const { topCategories, otherCategories } =
        this.dashboardService.getSummaryOfCategories(bills, numberOfCategories)

      return ResponseHandler.sendResponse({ topCategories, otherCategories }, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
