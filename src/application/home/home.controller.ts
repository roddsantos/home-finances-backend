import { Controller, Get, Param, Query, Res } from '@nestjs/common'
import { ErrorHandler } from '../utils/ErrorHandler'
import { BillService } from '../bill/bill.service'
import { ResponseHandler } from '../utils/ResponseHandler'
import { Response } from 'express'
import { SumAndCountType } from '../types/general'
import { HomeService } from './home.service'

@Controller('home')
export class HomeController {
  constructor(
    private readonly billService: BillService,
    private readonly homeService: HomeService
  ) {}

  @Get('/expenses/:id')
  public async getExpensesInfo(
    @Param('id') id: string,
    @Query() query: any,
    @Res() res: Response
  ) {
    const { month, year } = query
    const monthRef = month || new Date().getMonth()
    const yearRef = year || new Date().getFullYear()

    try {
      if (!id) return ErrorHandler.NOT_FOUND_MESSAGE('home/expenses - no id found')
      const result = await this.homeService.getBillsDetails(id, monthRef, yearRef)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/savings/:id')
  public async getSavingsInfo(
    @Param('id') id: string,
    @Query() query: any,
    @Res() res: Response
  ): Promise<Response<SumAndCountType> | void> {
    if (!id) return ErrorHandler.NOT_FOUND_MESSAGE('home/savings - no id found')
    const { month, year } = query

    try {
      const result = await this.homeService.getSavingsTotal(id, month, year)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/invoices/:id')
  public async getInvoicesInfo(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response<SumAndCountType> | void> {
    try {
      if (!id) return ErrorHandler.NOT_FOUND_MESSAGE('No id found')
      const result = await this.homeService.getCreditCardValues(id)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/recents/:id')
  public async getRecentBills(@Param('id') id: string, @Res() res: Response) {
    try {
      if (!id) return ErrorHandler.NOT_FOUND_MESSAGE('No id found')
      const result = await this.homeService.getLastFiveBills(id)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
