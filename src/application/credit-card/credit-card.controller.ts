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

@Controller('credit-card')
export class CreditCardController extends GeneralController {
  constructor(private readonly creditCardService: CreditCardService) {
    super(path.join(__dirname, CREDIT_CARD_MODULE.controller))
  }

  hasMissingCreditCardData(data: Partial<CreateCreditCardTemplateDto>) {
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
    @Body() data: CreateCreditCardTemplateDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const userId = req.user.id
      const result = await this.creditCardService.createNewCreditCard(userId, data)

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
      if (this.hasMissingCreditCardData(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')

      const { id, ...rest } = data
      const result = await this.creditCardService.update(id, rest)
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
      const result = await this.creditCardService.getAllById(id)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error as HttpException)
    }
  }

  @Post('/close/:id')
  public async closeCreditCard(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response<CreditCard | null>> {
    try {
      const result = await this.creditCardService.closeCreditCard(id)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error as HttpException)
    }
  }
}
