import { Injectable } from '@nestjs/common'
import { Category } from './category.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import {
  CreateCategoryTemplateDto,
  UpdateCategoryTemplateDto
} from '../core/types/category'
import * as path from 'path'
import { GeneralService } from '../app/general/service.general'
import { CATEGORY_MODULE } from '../core/consts/filename.consts'

@Injectable()
export class CategoryService extends GeneralService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {
    super(path.join(__dirname, CATEGORY_MODULE.service))
  }

  async create(createCategoryDto: CreateCategoryTemplateDto) {
    try {
      const { name, userId } = createCategoryDto
      const category = await this.getOneByNameAndUserId(name, userId)

      if (category) {
        this.logger.error(
          `category already exists with this name : ${name}`,
          this.logDirectory
        )
        ErrorHandler.CONFLICT_MESSAGE(
          `categories - category already exists with this name : ${name}`
        )
      }

      const res = await this.categoryRepository.save(createCategoryDto)
      return res
    } catch (error) {
      ErrorHandler.handle(error)
    }
  }

  async update(data: UpdateCategoryTemplateDto) {
    try {
      const { id, ...rest } = data
      const category = await this.getOneById(id)

      await this.categoryRepository.update({ id }, rest)

      return { ...category, ...rest }
    } catch (error) {
      ErrorHandler.handle(error)
    }
  }

  async delete(id: string) {
    try {
      const res = await this.categoryRepository.delete(id)
      return res
    } catch (error) {
      ErrorHandler.handle(error)
    }
  }

  async getOneByNameAndUserId(name: string, userId: string) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { name, userId }
      })
      return category
    } catch (error) {
      this.logger.error(
        `error fetching category : userId : ${userId} : name : ${name}`,
        this.logDirectory
      )
      ErrorHandler.handle(error)
    }
  }

  async getOneById(id: string) {
    try {
      this.logger.info(`retrieving category data : id : ${id}`, this.logDirectory)
      const category = await this.categoryRepository.findOneBy({ id })

      if (!category) {
        this.logger.error(`category not found : id : ${id}`, this.logDirectory)
        ErrorHandler.NOT_FOUND_MESSAGE('categories - category not found')
      }
      return category
    } catch (error) {
      this.logger.error(`error retrieving category : id : ${id}`, this.logDirectory)
      ErrorHandler.NOT_FOUND_MESSAGE('categories - error retrieving category')
    }
  }

  async getAllById(userId: string) {
    try {
      const res = await this.categoryRepository.find({
        where: { userId },
        order: { name: 'ASC' }
      })
      return res
    } catch (error) {
      ErrorHandler.handle(error)
    }
  }
}
