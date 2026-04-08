import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Req,
  Res
} from '@nestjs/common'
import { CreditCardService } from './credit-card.service'
import { Response, Request } from 'express'
import { ErrorHandler } from '../utils/ErrorHandler'
import { ResponseHandler } from '../utils/ResponseHandler'
import { CreditCard } from './credit-card.entity'
import {
  CreateCreditCardTemplateDto,
  UpdateCreditCardTemplateDto
} from '../core/types/credit-card'
import * as path from 'path'
import { CREDIT_CARD_MODULE } from '../core/consts/filename.consts'
import { GeneralController } from '../app/general/controller.general'
import { objectToString } from '../utils/conversions'

@Controller('credit-card')
export class CreditCardController extends GeneralController {
  constructor(private readonly creditCardService: CreditCardService) {
    super(path.join(__dirname, CREDIT_CARD_MODULE.controller))
  }

  @Post()
  public async createCreditCard(
    @Body() data: CreateCreditCardTemplateDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const userId = req.user.id
      const result = await this.creditCardService.createNewCreditCard(userId, data)

      this.logger.info(
        `successfully created credit card : payload : ${objectToString(data)}` +
          ` : credit card id: ${result.id}`,
        this.logDirectory
      )
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error as HttpException)
    }
  }

  @Patch()
  public async updateCreditCard(
    @Body() data: Partial<UpdateCreditCardTemplateDto>,
    @Res() res: Response
  ): Promise<Response<number>> {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')

      const { id, ...rest } = data
      const result = await this.creditCardService.update(id, rest)

      this.logger.info(
        `successfully updated credit card : payload : ${objectToString(data)}`,
        this.logDirectory
      )
      return ResponseHandler.sendAcceptedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error as HttpException)
    }
  }

  @Delete('/:id')
  public async deleteCreditCard(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response<boolean>> {
    try {
      await this.creditCardService.delete(id)

      this.logger.info(
        `successfully deleted credit card : credit card id : ${id}`,
        this.logDirectory
      )
      return ResponseHandler.sendNoContentResponse(res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error as HttpException)
    }
  }

  @Get('/')
  public async getCreditCards(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response<CreditCard>> {
    try {
      const id = req.user.id
      const result = await this.creditCardService.getAllByUserId(id)

      this.logger.info(
        `fetching credit cards from user : userId : ${id}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error as HttpException)
    }
  }

  @Patch('/close/:id')
  public async closeCreditCard(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response<CreditCard | null>> {
    try {
      const result = await this.creditCardService.closeCreditCard(id)
      this.logger.info(
        `successfully closed credit card invoice : credit card id : ${id}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error as HttpException)
    }
  }
}
