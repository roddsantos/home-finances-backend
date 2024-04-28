import { Body, Controller, Delete, Get, Param, Patch, Post, Res } from '@nestjs/common'
import { CategoryService } from './category.service'
import { Response } from 'express'
import { Category } from './category.entity'
import { ResponseHandler } from '../utils/ResponseHandler'
import { ErrorHandler } from '../utils/ErrorHandler'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Controller('/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  verifyData(data: CreateCategoryDto | UpdateCategoryDto) {
    const isCreate = data instanceof CreateCategoryDto
    return (
      data.name == '' ||
      data.description === '' ||
      data.color === '' ||
      (isCreate ? data.userId === '' : data.id === '') ||
      data.icon == ''
    )
  }

  @Post()
  public async createCompany(@Body() data: CreateCategoryDto, @Res() res: Response) {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (this.verifyData(data)) {
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      }
      const result = await this.categoryService.create(data)
      return ResponseHandler.sendCreatedResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }

  @Patch()
  public async updateCreditCard(
    @Body() data: UpdateCategoryDto,
    @Res() res: Response
  ): Promise<Response<number>> {
    try {
      if (!Boolean(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      if (this.verifyData(data))
        ErrorHandler.UNPROCESSABLE_ENTITY_MESSAGE('Missing Required Fields')
      const { id, ...rest } = data
      const result = await this.categoryService.update(id, rest)
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

  @Get('/:id')
  public async getAll(
    @Res() res: Response,
    @Param('id') id: string
  ): Promise<Response<Category>> {
    try {
      const result = await this.categoryService.getAllById(id)
      return ResponseHandler.sendResponse(result, res)
    } catch (error) {
      return ErrorHandler.errorResponse(res, error)
    }
  }
}
