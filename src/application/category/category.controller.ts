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
  CategoryObjectType,
  CreateCategoryTemplateDto,
  UpdateCategoryTemplateDto
} from '../core/types/category'
import * as path from 'path'
import { CATEGORY_MODULE } from '../core/consts/filename.consts'
import { GeneralController } from '../app/general/controller.general'
import { CacheService } from '../cache/cache.service'

@Controller('/category')
export class CategoryController extends GeneralController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly cacheService: CacheService
  ) {
    super(path.join(__dirname, CATEGORY_MODULE.controller))
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
      this.cacheService.deleteCacheBySectionAndKey('categories', userId)

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
    @Res() res: Response,
    @Req() req: Request
  ): Promise<Response<number>> {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('category - missing data to update')

      const userId = req.user.id
      const result = await this.categoryService.update(data)
      this.cacheService.deleteCacheBySectionAndKey('categories', userId)

      this.logger.info(
        `category updated succesfully with payload : ${data ? JSON.stringify(data) : 'none'}`,
        this.logDirectory
      )
      return ResponseHandler.sendAcceptedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Delete('/:id')
  public async deleteCategory(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<Response<boolean>> {
    try {
      const userId = req.user.id
      await this.categoryService.delete(id)
      this.cacheService.deleteCacheBySectionAndKey('categories', userId)

      this.logger.info(
        `category deleted succesfully : categoryId : ${id}`,
        this.logDirectory
      )
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

      let result = this.cacheService.cacheResponse('categories', userId)

      if (!result) {
        result = await this.categoryService.getAllById(userId)
        this.cacheService.setCachedCategories(
          userId,
          result as unknown as CategoryObjectType[]
        )
        this.logger.info(`fetch categories by id : ${userId}`, this.logDirectory)
      }

      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
