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
import { ErrorHandler } from '../utils/ErrorHandler'
import { BankService } from './bank.service'
import { Response, Request } from 'express'
import { ResponseHandler } from '../utils/ResponseHandler'
import { Bank } from './bank.entity'
import {
  BankObjectType,
  CreateBankTemplateDto,
  UpdateBankTemplateDto
} from '../core/types/bank'
import * as path from 'path'
import { BANK_MODULE } from '../core/consts/filename.consts'
import { GeneralController } from '../app/general/controller.general'
import { objectToString } from '../utils/conversions'
import { CacheService } from '../cache/cache.service'

@Controller('bank')
export class BankController extends GeneralController {
  constructor(
    private readonly bankService: BankService,
    private readonly cacheService: CacheService
  ) {
    super(path.join(__dirname, BANK_MODULE.controller))
  }

  @Post()
  public async createBank(
    @Body() payload: CreateBankTemplateDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user.id
      const result = await this.bankService.create(userId, payload)
      this.cacheService.deleteCacheBySectionAndKey('banks', userId)

      this.logger.info(
        `bank successfully created : payload : ${objectToString(payload)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch()
  public async updateBank(
    @Body() payload: UpdateBankTemplateDto,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<Response<number>> {
    try {
      const userId = req.user?.id
      const result = await this.bankService.update(payload)
      this.cacheService.deleteCacheBySectionAndKey('banks', userId)

      this.logger.info(
        `bank successfully updated : payload : ${objectToString(payload)}`,
        this.logDirectory
      )
      return ResponseHandler.sendAcceptedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Delete('/:id')
  public async deleteBank(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<Response<boolean>> {
    try {
      const userId = req.user?.id
      await this.bankService.delete(id)
      this.cacheService.deleteCacheBySectionAndKey('banks', userId)

      this.logger.info(`bank successfully updated : id : ${id}`, this.logDirectory)
      return ResponseHandler.sendNoContentResponse(res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/')
  public async getBank(
    @Res() res: Response,
    @Req() req: Request
  ): Promise<Response<Bank>> {
    try {
      const userId = req.user?.id

      let result = this.cacheService.cacheResponse('banks', userId)

      if (!result) {
        result = await this.bankService.getAllById(userId)
        this.cacheService.setCachedBanks(userId, result as unknown as BankObjectType[])
        this.logger.info(`fetching banks : userId : ${userId}`, this.logDirectory)
      }

      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
