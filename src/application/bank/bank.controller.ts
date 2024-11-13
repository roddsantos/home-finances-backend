import { Body, Controller, Delete, Get, Param, Patch, Post, Res } from '@nestjs/common'
import { ErrorHandler } from '../utils/ErrorHandler'
import { BankService } from './bank.service'
import { CreateBankDto } from './dto/create-bank.dto'
import { Response } from 'express'
import { ResponseHandler } from '../utils/ResponseHandler'
import { UpdateBankDto } from './dto/update-bank.dto'
import { Bank } from './bank.entity'
import { SumAndCountType } from '../types/general'

@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  public async createBank(@Body() data: CreateBankDto, @Res() res: Response) {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (
        data.name == '' ||
        data.description === '' ||
        data.color === '' ||
        data.userId === ''
      ) {
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      }
      const result = await this.bankService.create(data)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch()
  public async updateBank(
    @Body() data: UpdateBankDto,
    @Res() res: Response
  ): Promise<Response<number>> {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (
        data.name === '' ||
        data.description === '' ||
        data.color === '' ||
        !data.id ||
        data.savings < 0
      )
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      const { id, ...rest } = data
      const result = await this.bankService.update(id, rest)
      return ResponseHandler.sendAcceptedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Delete('/:id')
  public async deleteBank(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response<boolean>> {
    try {
      await this.bankService.delete(id)
      return ResponseHandler.sendNoContentResponse(res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/:id')
  public async getBank(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response<Bank>> {
    try {
      const result = await this.bankService.getAllById(id)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/savings/:id')
  public async getSavings(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response<SumAndCountType> | void> {
    try {
      if (!id) return ErrorHandler.NOT_FOUND_MESSAGE('No id found')
      const result = await this.bankService.getSavingsTotal(id)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
