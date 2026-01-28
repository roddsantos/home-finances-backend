import { Injectable } from '@nestjs/common'
import { Company } from './company.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateCompanyTemplateDto, UpdateCompanyTemplateDto } from '../core/types/company'
import * as path from 'path'
import { GeneralService } from '../app/general/service.general'
import { COMPANY_MODULE } from '../core/consts/filename.consts'

@Injectable()
export class CompanyService extends GeneralService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>
  ) {
    super(path.join(__dirname, COMPANY_MODULE.service))
  }

  async create(userId: string, createCompanyDto: CreateCompanyTemplateDto) {
    try {
      const { name } = createCompanyDto
      const company = await this.getOneByNameAndUserId(name, userId)

      if (company) {
        this.logger.error(
          `company already exists with this name : ${name}`,
          this.logDirectory
        )
        ErrorHandler.CONFLICT_MESSAGE(
          `companies - company already exists with this name : ${name}`
        )
      }

      const res = this.companyRepository.save({ ...createCompanyDto, userId })
      return res
    } catch (error) {
      ErrorHandler.handle(error)
    }
  }

  async update(data: UpdateCompanyTemplateDto) {
    try {
      const { id, ...rest } = data
      const company = await this.getOneById(id)

      await this.companyRepository.update({ id }, rest)

      return { ...company, ...rest }
    } catch (error) {
      ErrorHandler.handle(error)
    }
  }

  async delete(id: string) {
    try {
      const res = await this.companyRepository.delete(id)
      return res
    } catch (error) {
      ErrorHandler.handle(error)
    }
  }

  async getOneByNameAndUserId(name: string, userId: string) {
    try {
      const company = await this.companyRepository.findOne({
        where: { name, userId }
      })
      return company
    } catch (error) {
      this.logger.error(
        `error fetching company : userId : ${userId} : name : ${name}`,
        this.logDirectory
      )
      ErrorHandler.handle(error)
    }
  }

  async getAllById(userId: string) {
    try {
      const res = await this.companyRepository.find({
        where: { userId },
        order: { name: 'ASC' }
      })
      return res
    } catch (error) {
      ErrorHandler.handle(error)
    }
  }

  async getOneById(id: string) {
    try {
      this.logger.info(`retrieving company data : id : ${id}`, this.logDirectory)
      const company = await this.companyRepository.findOneBy({ id })

      if (!company) {
        this.logger.error(`company not found : id : ${id}`, this.logDirectory)
        ErrorHandler.NOT_FOUND_MESSAGE('companies - company not found')
      }
      return company
    } catch (error) {
      ErrorHandler.handle(error)
    }
  }
}
