import { Injectable } from '@nestjs/common'
import { Company } from './company.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    try {
      const res = await this.companyRepository.create(createCompanyDto)
      return res.id
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async update(id: string, data: Omit<UpdateCompanyDto, 'id'>) {
    try {
      const res = await this.companyRepository.update(data, {
        id
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async delete(id: string) {
    try {
      const res = await this.companyRepository.delete(id)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getAllById(userId: string) {
    try {
      const res = await this.companyRepository.find({
        where: { userId }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
