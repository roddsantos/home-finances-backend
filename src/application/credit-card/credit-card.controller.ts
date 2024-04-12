import { Body, Controller, Delete, Get, Param, Patch, Post, Res } from '@nestjs/common'
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
  public async createCreditCard(@Body() data: CreateCreditCardDto, @Res() res: Response) {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (!data.year || data.month === '' || data.name === '') {
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
    @Body() data: UpdateCreditCardDto,
    @Res() res: Response
  ): Promise<Response<number>> {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (!data.year || data.month === '' || data.name === '' || data.id < 0)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      const result = await this.creditCardService.update(data)
      return ResponseHandler.sendAcceptedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Delete('/:id')
  public async deleteUser(
    @Param('id') id: number,
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
  public async getUser(
    @Body() data: GetCreditCardDto,
    @Res() res: Response
  ): Promise<Response<CreditCard>> {
    try {
      const result = await this.creditCardService.getAllById(data)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
