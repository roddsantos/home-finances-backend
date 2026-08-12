import {
  Body,
  Controller,
  Delete,
  Get,
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
  CreditCardObjectType,
  UpdateCreditCardTemplateDto
} from '../core/types/credit-card'
import * as path from 'path'
import { CREDIT_CARD_MODULE } from '../core/consts/filename.consts'
import { GeneralController } from '../app/general/controller.general'
import { objectToString } from '../utils/conversions'
import { CacheService } from '../cache/cache.service'

@Controller('credit-card')
export class CreditCardController extends GeneralController {
  constructor(
    private readonly creditCardService: CreditCardService,
    private readonly cacheService: CacheService
  ) {
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
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('credit cards - missing body data')

      const result = await this.creditCardService.createNewCreditCard(userId, data)
      this.cacheService.deleteCacheBySectionAndKey('creditCards', userId)

      this.logger.info(
        `successfully created credit card : payload : ${objectToString(data)}` +
          ` : credit card id: ${result.id}`,
        this.logDirectory
      )
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch()
  public async updateCreditCard(
    @Body() data: Partial<UpdateCreditCardTemplateDto>,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<Response<number>> {
    try {
      const userId = req.user.id
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('credit cards - missing body data')

      const { id, ...rest } = data
      const result = await this.creditCardService.update(id, rest)
      this.cacheService.deleteCacheBySectionAndKey('creditCards', userId)

      this.logger.info(
        `successfully updated credit card : payload : ${objectToString(data)}`,
        this.logDirectory
      )
      return ResponseHandler.sendAcceptedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Delete('/:id')
  public async deleteCreditCard(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<Response<boolean>> {
    try {
      const userId = req.user.id

      await this.creditCardService.delete(id)
      this.cacheService.deleteCacheBySectionAndKey('creditCards', userId)

      this.logger.info(
        `successfully deleted credit card : credit card id : ${id}`,
        this.logDirectory
      )
      return ResponseHandler.sendNoContentResponse(res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/')
  public async getCreditCards(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response<CreditCard>> {
    try {
      const userId = req.user.id

      let result = this.cacheService.cacheResponse('creditCards', userId)

      if (!result) {
        result = await this.creditCardService.getAllByUserId(userId)
        this.cacheService.setCachedCreditCards(
          userId,
          result as unknown as CreditCardObjectType[]
        )
        this.logger.info(
          `fetching credit cards from user : userId : ${userId}`,
          this.logDirectory
        )
      }

      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch('/close/:id')
  public async closeCreditCard(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string
  ): Promise<Response<CreditCard | null>> {
    try {
      const userId = req.user.id

      const result = await this.creditCardService.closeCreditCard(id)
      this.cacheService.deleteCacheBySectionAndKey('creditCards', userId)

      this.logger.info(
        `successfully closed credit card invoice : credit card id : ${userId}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
