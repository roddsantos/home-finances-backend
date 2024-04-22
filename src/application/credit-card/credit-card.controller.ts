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

  @Post()
  public async createCC(@Body() data: CreateCreditCardDto, @Res() res: Response) {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (!data.year || data.month < 0 || data.month > 11 || data.name === '') {
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      }
      const result = await this.creditCardService.create(data)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch()
  public async updateCC(
    @Body() data: UpdateCreditCardDto,
    @Res() res: Response
  ): Promise<Response<number>> {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (
        !data.year ||
        data.month < 0 ||
        data.month > 11 ||
        data.name === '' ||
        data.id === ''
      )
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')

      const { id, ...rest } = data
      const result = await this.creditCardService.update(id, rest)
      return ResponseHandler.sendAcceptedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Delete('/:id')
  public async deleteCC(
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
  public async getCC(
    @Query() data: GetCreditCardDto,
    @Res() res: Response
  ): Promise<Response<CreditCard>> {
    try {
      const { page, limit, userId, ...rest } = data
      const result = await this.creditCardService.getAllById(userId, page, limit, rest)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
