import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res
} from '@nestjs/common'
import { SavingsService } from './savings.service'
import { BulkSavingDto, NewSavingDto, UpdateSavingDto } from './savings.dto'
import { Response, Request } from 'express'
import { ErrorHandler } from '../utils/ErrorHandler'
import { ResponseHandler } from '../utils/ResponseHandler'
import { Savings } from './savings.entity'
import { SAVING_MODULE } from '../core/consts/filename.consts'
import * as path from 'path'
import { GeneralController } from '../app/general/controller.general'
import { objectToString } from '../utils/conversions'

@Controller('savings')
export class SavingsController extends GeneralController {
  constructor(private readonly savingsService: SavingsService) {
    super(path.join(__dirname, SAVING_MODULE.controller))
  }

  private verifyBody(data: NewSavingDto) {
    return !data.bankId || !data.month || !data.year || !data.type || data.total < 0
  }

  @Post()
  public async createSaving(@Body() payload: NewSavingDto, @Res() res: Response) {
    try {
      const result = await this.savingsService.create(payload)

      this.logger.info(
        `saving successfully created : payload : ${objectToString(payload)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Post('/bulk')
  public async bulkSaving(
    @Body() payload: BulkSavingDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      const userId = req.user?.id
      const { month, year } = payload
      const result = await this.savingsService.bulkSaving(userId, month, year)

      this.logger.info(
        `created month savings successfully : payload : ${objectToString(payload)}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch()
  public async updateSaving(@Body() payload: UpdateSavingDto, @Res() res: Response) {
    try {
      if (!payload.id) ErrorHandler.BAD_REQUEST('Id not found')
      if (this.verifyBody(payload)) ErrorHandler.BAD_REQUEST('Data not found')

      const { id, ...rest } = payload
      const result = await this.savingsService.update(id, rest)

      this.logger.info(
        `saving successfully updated : payload : ${objectToString(payload)}`,
        this.logDirectory
      )
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

      this.logger.info(`saving successfully deleted : id : ${id}`, this.logDirectory)
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

      this.logger.info(
        `successfully retrieved savings by bank : bankId : ${bankId}`,
        this.logDirectory
      )
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/:id')
  public async getSavingById(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response<Savings>> {
    try {
      const result = await this.savingsService.getOneByBankId(id)

      this.logger.info(
        `successfully retrieved saving by id : id : ${id}`,
        this.logDirectory
      )
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
