import { Injectable } from '@nestjs/common'
import { Category } from './category.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const comp = await this.categoryRepository.findOne({
        where: { name: createCategoryDto.name, userId: createCategoryDto.userId }
      })
      if (comp === null) {
        const res = this.categoryRepository.save(createCategoryDto)
        return res
      } else ErrorHandler.CONFLICT_MESSAGE('This category already exists')
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async update(id: string, data: Omit<UpdateCategoryDto, 'id'>) {
    try {
      const res = await this.categoryRepository.update(data, {
        id
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async delete(id: string) {
    try {
      const res = await this.categoryRepository.delete(id)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getAllById(userId: string) {
    try {
      const res = await this.categoryRepository.find({
        where: { userId },
        order: { updatedAt: 'DESC' }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
