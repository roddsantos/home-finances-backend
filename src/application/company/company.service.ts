import { Injectable } from '@nestjs/common'
import { Company } from './company.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepository: typeof Company) {}

  async create(createCompanyDto: CreateCompanyDto) {
    try {
      const res = await this.companyRepository.create(createCompanyDto)
      return res.id
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async update(updateCompanyDto: UpdateCompanyDto) {
    try {
      const res = await this.companyRepository.update(updateCompanyDto, {
        where: { id: updateCompanyDto.id }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async delete(id: number) {
    try {
      const res = await this.companyRepository.destroy({ where: { id } })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getAllById(userId: number) {
    try {
      const res = await this.companyRepository.findAll<Company>({
        where: { userId }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
