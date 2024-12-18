import { Controller, Get, Query, Res } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { ResponseHandler } from '../utils/ResponseHandler'
import { Response } from 'express'
import { ErrorHandler } from '../utils/ErrorHandler'

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/months')
  public async getMonthSpan(@Query() data: any, @Res() res: Response) {
    try {
      const monthSpan = data.monthSpan || 5
      const result = await this.dashboardService.getMonthSpan(monthSpan, data.userId)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
