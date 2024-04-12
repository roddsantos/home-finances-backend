import { Controller, Get, Res } from '@nestjs/common'
import { TypeBillService } from './type-bill.service'
import { Response } from 'express'
import { TypeBill } from './type-bill.entity'
import { ResponseHandler } from '../utils/ResponseHandler'
import { ErrorHandler } from '../utils/ErrorHandler'

@Controller('type-bill')
export class TypeBillController {
  constructor(private readonly typebillService: TypeBillService) {}

  @Get()
  public async getAll(@Res() res: Response): Promise<Response<TypeBill>> {
    try {
      const result = await this.typebillService.getAll()
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
