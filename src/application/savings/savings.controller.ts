import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res
} from '@nestjs/common'
import { SavingsService } from './savings.service'
import { NewSavingDto, UpdateSavingDto } from './savings.dto'
import { Response } from 'express'
import { ErrorHandler } from '../utils/ErrorHandler'
import { ResponseHandler } from '../utils/ResponseHandler'
import { Savings } from './savings.entity'

@Controller('savings')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  private verifyBody(data: NewSavingDto) {
    return !data.bankId || !data.month || !data.year || !data.type || data.total < 0
  }

  @Post()
  public async createSaving(@Body() newSavingDto: NewSavingDto, @Res() res: Response) {
    try {
      if (!newSavingDto) ErrorHandler.BAD_REQUEST('Data not found')

      if (this.verifyBody(newSavingDto))
        ErrorHandler.BAD_REQUEST('Missing required fields')

      const result = await this.savingsService.create(newSavingDto)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch()
  public async updateSaving(
    @Body() updateSavingDto: UpdateSavingDto,
    @Res() res: Response
  ) {
    try {
      if (!updateSavingDto.id) ErrorHandler.BAD_REQUEST('Id not found')
      if (this.verifyBody(updateSavingDto)) ErrorHandler.BAD_REQUEST('Data not found')

      const { id, ...rest } = updateSavingDto
      const result = await this.savingsService.update(id, rest)
      return ResponseHandler.sendAcceptedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Delete('/:id')
  public async deleteSaving(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response<boolean>> {
    try {
      await this.savingsService.delete(id)
      return ResponseHandler.sendNoContentResponse(res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/all')
  public async getSavingsByBank(
    @Res() res: Response,
    @Query() query: any
  ): Promise<Response<Savings[]>> {
    try {
      const { bankId, page } = query
      const result = await this.savingsService.getAllByBankId(bankId, page)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/:id')
  public async getSavingByBank(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response<Savings>> {
    try {
      const result = await this.savingsService.getOneByBankId(id)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
