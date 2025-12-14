import { Controller, Get, Param, Query, Res } from '@nestjs/common'
import { ErrorHandler } from '../utils/ErrorHandler'
import { BillService } from '../bill/bill.service'
import { ResponseHandler } from '../utils/ResponseHandler'
import { Response } from 'express'
import { SumAndCountType } from 'src/application/core/types/general'
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
    if (!id) return ErrorHandler.NOT_FOUND_MESSAGE('home/expenses - no id found')

    const { month, year } = query
    const monthRef = parseInt(month) || new Date().getMonth()
    const yearRef = parseInt(year) || new Date().getFullYear()

    try {
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
    const monthRef = parseInt(month) || new Date().getMonth()
    const yearRef = parseInt(year) || new Date().getFullYear()

    try {
      const result = await this.homeService.getSavingsTotal(id, monthRef, yearRef)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/invoices/:id')
  public async getInvoicesInfo(
    @Param('id') id: string,
    @Query() query: any,
    @Res() res: Response
  ): Promise<Response<SumAndCountType> | void> {
    if (!id) return ErrorHandler.NOT_FOUND_MESSAGE('No id found')

    const { month, year } = query
    const monthRef = parseInt(month) || new Date().getMonth()
    const yearRef = parseInt(year) || new Date().getFullYear()

    try {
      const result = await this.homeService.getCreditCardValues(id, monthRef, yearRef)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/recents/:id')
  public async getRecentBills(
    @Param('id') id: string,
    @Query() query: any,
    @Res() res: Response
  ) {
    if (!id) return ErrorHandler.NOT_FOUND_MESSAGE('No id found')

    const { month, year } = query
    const monthRef = parseInt(month) || new Date().getMonth()
    const yearRef = parseInt(year) || new Date().getFullYear()

    try {
      const result = await this.homeService.getLastFiveBills(id, monthRef, yearRef)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
