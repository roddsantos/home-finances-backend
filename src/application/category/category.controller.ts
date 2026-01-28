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
import { CategoryService } from './category.service'
import { Response, Request } from 'express'
import { Category } from './category.entity'
import { ResponseHandler } from '../utils/ResponseHandler'
import { ErrorHandler } from '../utils/ErrorHandler'
import {
  CreateCategoryTemplateDto,
  UpdateCategoryTemplateDto
} from '../core/types/category'
import * as path from 'path'
import { CATEGORY_MODULE } from '../core/consts/filename.consts'
import { GeneralController } from '../app/general/controller.general'

@Controller('/category')
export class CategoryController extends GeneralController {
  constructor(private readonly categoryService: CategoryService) {
    super(path.join(__dirname, CATEGORY_MODULE.controller))
  }

  verifyData(data: any) {
    const isCreate = Boolean(data.id)
    return (
      data.name == '' ||
      data.description === '' ||
      data.color === '' ||
      (isCreate ? data.userId === '' : data.id === '') ||
      data.icon == ''
    )
  }

  @Post()
  public async createCategory(
    @Body() data: CreateCategoryTemplateDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req.user.id
      const result = await this.categoryService.create(userId, data)

      this.logger.info(
        `category created succesfully with name : ${data.name}  : id : ${result.id}`,
        this.logDirectory
      )
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch()
  public async updateCategory(
    @Body() data: UpdateCategoryTemplateDto,
    @Res() res: Response
  ): Promise<Response<number>> {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (this.verifyData(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      const result = await this.categoryService.update(data)

      this.logger.info(
        // eslint-disable-next-line max-len
        `category updated succesfully with payload : ${data ? JSON.stringify(data) : 'none'}`,
        this.logDirectory
      )

      return ResponseHandler.sendAcceptedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Delete('/:id')
  public async deleteUser(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response<boolean>> {
    try {
      await this.categoryService.delete(id)
      return ResponseHandler.sendNoContentResponse(res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Get('/')
  public async getAll(
    @Res() res: Response,
    @Req() req: Request
  ): Promise<Response<Category>> {
    try {
      const userId = req.user.id
      const result = await this.categoryService.getAllById(userId)

      this.logger.info(`fetch categories by id : ${userId}`, this.logDirectory)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
