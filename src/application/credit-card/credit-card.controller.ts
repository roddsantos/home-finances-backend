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
import { CreditCardService } from './credit-card.service'
import { CreateCreditCardDto } from './dto/create-credit-card.dto'
import { Response } from 'express'
import { ErrorHandler } from '../utils/ErrorHandler'
import { ResponseHandler } from '../utils/ResponseHandler'
import { UpdateCreditCardDto } from './dto/update-credit-card.dto'
import { GetCreditCardDto } from './dto/get-credit-cards.dto'
import { CreditCard } from './credit-card.entity'

@Controller('credit-card')
export class CreditCardController {
  constructor(private readonly creditCardService: CreditCardService) {}

  hasMissingCreditCardData(data: Partial<CreateCreditCardDto>) {
    let flag = false
    if (data.year) flag = flag || data.year < new Date().getFullYear()
    if (data.month) flag = flag || data.month > 11 || data.month < 0
    if (data.name) flag = flag || data.name === ''
    if (data.limit) flag = flag || data.limit <= 0
    if (data.day) flag = flag || data.day <= 0 || data.day >= 29
    if (data.due) flag = flag || data.due <= 0 || data.due >= 29
    if (data.flag) flag = flag || data.flag === ''
    return flag
  }

  @Post()
  public async createCreditCard(
    @Body() data: CreateCreditCardDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (this.hasMissingCreditCardData(data)) {
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      }
      const result = await this.creditCardService.create(data)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch()
  public async updateCreditCard(
    @Body() data: Partial<UpdateCreditCardDto>,
    @Res() res: Response
  ): Promise<Response<number>> {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (this.hasMissingCreditCardData(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')

      const { id, ...rest } = data
      const result = await this.creditCardService.update(id, rest)
      return ResponseHandler.sendAcceptedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Delete('/:id')
  public async deleteCreditCard(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response<boolean>> {
    try {
      await this.creditCardService.delete(id)
      return ResponseHandler.sendNoContentResponse(res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get()
  public async getCreditCard(
    @Query() data: GetCreditCardDto,
    @Res() res: Response
  ): Promise<Response<CreditCard>> {
    try {
      const { userId, ...rest } = data
      const result = await this.creditCardService.getAllById(userId, rest)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
