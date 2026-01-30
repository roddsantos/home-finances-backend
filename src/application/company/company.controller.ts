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
import { CompanyService } from './company.service'
import { ErrorHandler } from '../utils/ErrorHandler'
import { ResponseHandler } from '../utils/ResponseHandler'
import { Response, Request } from 'express'
import { Company } from './company.entity'
import { CreateCompanyTemplateDto, UpdateCompanyTemplateDto } from '../core/types/company'
import { GeneralController } from '../app/general/controller.general'
import * as path from 'path'
import { COMPANY_MODULE } from '../core/consts/filename.consts'

@Controller('company')
export class CompanyController extends GeneralController {
  constructor(private readonly companyService: CompanyService) {
    super(path.join(__dirname, COMPANY_MODULE.controller))
  }

  @Post()
  public async createCompany(
    @Body() data: CreateCompanyTemplateDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user.id
      const result = await this.companyService.create(userId, data)

      this.logger.info(
        `company created succesfully with name : ${data.name}  : id : ${result.id}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch()
  public async updateCompany(
    @Body() data: UpdateCompanyTemplateDto,
    @Res() res: Response
  ): Promise<Response<number>> {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (data.name === '' || data.description === '' || data.color === '' || !data.id)
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      const result = await this.companyService.update(data)

      this.logger.info(
        // eslint-disable-next-line max-len
        `company updated succesfully with payload : ${data ? JSON.stringify(data) : 'none'}`,
        this.logDirectory
      )
      return ResponseHandler.sendAcceptedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Delete('/:id')
  public async deleteCompany(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response<boolean>> {
    try {
      await this.companyService.delete(id)

      this.logger.info(`company deleted succesfully with id : ${id}`, this.logDirectory)
      return ResponseHandler.sendNoContentResponse(res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/')
  public async getCompanies(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response<Company>> {
    try {
      const userId = req.user?.id
      const result = await this.companyService.getAllById(userId)

      this.logger.info(`fetch companies for id : ${userId}`, this.logDirectory)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
