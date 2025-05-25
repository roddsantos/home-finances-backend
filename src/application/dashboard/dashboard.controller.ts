import { Controller, Get, Query, Res } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { ResponseHandler } from '../utils/ResponseHandler'
import { Response } from 'express'
import { ErrorHandler } from '../utils/ErrorHandler'

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/months')
  public async billProgression(@Query() query: any, @Res() res: Response) {
    const { span, userId, month, year } = query
    if (!userId) ErrorHandler.BAD_REQUEST('dashboard/months - No userId found')
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
  public async getMonthBills(@Query() data: any, @Res() res: Response) {
    try {
      const result = await this.dashboardService.getBills(data.userId)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/savings')
  public async getSavingsInfo(@Query() data: any, @Res() res: Response) {
    try {
      const result = await this.dashboardService.getSavings(data.userId)
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
}
