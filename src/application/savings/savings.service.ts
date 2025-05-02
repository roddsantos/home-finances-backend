import { Injectable } from '@nestjs/common'
import { NewSavingDto, UpdateSavingDto } from './savings.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Savings } from './savings.entity'
import { Repository } from 'typeorm'
import { ErrorHandler } from '../utils/ErrorHandler'

@Injectable()
export class SavingsService {
  constructor(
    @InjectRepository(Savings)
    private readonly savingRepository: Repository<Savings>
  ) {}

  async create(newMonthlySavingDto: NewSavingDto) {
    const { type, bankId, month, year } = newMonthlySavingDto

    try {
      const saving = await this.savingRepository.findOne({
        where: {
          type,
          bankId,
          month,
          year
        }
      })
      if (saving)
        ErrorHandler.CONFLICT_MESSAGE('A saving with these parameters already exists')

      const res = await this.savingRepository.save(newMonthlySavingDto)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async update(id: string, data: Omit<UpdateSavingDto, 'id'>) {
    try {
      const res = await this.savingRepository.update({ id }, data)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async delete(id: string) {
    try {
      const res = await this.savingRepository.delete(id)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getAllByBankId(bankId: string) {
    try {
      const res = await this.savingRepository.find({
        where: { bankId }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getOneById(id: string) {
    try {
      const res = await this.savingRepository.findOne({
        where: { id },
        order: { updatedAt: 'DESC' }
      })
      return res
    } catch (error) {
      throw error
    }
  }

  async getOneByBankId(bankId: string) {
    try {
      const res = await this.savingRepository.findOne({
        where: { bankId, month: new Date().getMonth(), year: new Date().getFullYear() },
        order: { updatedAt: 'DESC' }
      })
      return res
    } catch (error) {
      throw error
    }
  }
}
