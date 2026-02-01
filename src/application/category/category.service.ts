import { Injectable } from '@nestjs/common'
import { Category } from './category.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { ILike, Repository } from 'typeorm'
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

  async create(userId: string, createCategoryDto: CreateCategoryTemplateDto) {
    try {
      const { name } = createCategoryDto
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

      const res = await this.categoryRepository.save({ ...createCategoryDto, userId })
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

  async getBySearchTerm(searchTerm: string, userId: string) {
    if (!userId) {
      this.logger.error(`userId not found : userId : ${userId}`, this.logDirectory)
      ErrorHandler.BAD_REQUEST('banks - userId not found')
    }
    if (!searchTerm) {
      return []
    }

    try {
      const searchResult = await this.categoryRepository.find({
        select: { id: true, name: true, description: true },
        where: { name: ILike(`%${searchTerm}%`), userId }
      })
      return searchResult.map((category) => ({
        id: category.id,
        description: category.description,
        title: category.name,
        type: 'category',
        date: null,
        value: null
      }))
    } catch (error) {
      this.logger.error(
        `error retrieving categories by search term : searchTerm : ${searchTerm} : error : ${error}`,
        this.logDirectory
      )
      ErrorHandler.NOT_FOUND_MESSAGE(
        'categories - error retrieving categories by search term'
      )
    }
  }
}
