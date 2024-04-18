import { Injectable } from '@nestjs/common'
import { Bank } from './bank.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { CreateBankDto } from './dto/create-bank.dto'
import { UpdateBankDto } from './dto/update-bank.dto'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>
  ) {}

  async create(createBankDto: CreateBankDto) {
    try {
      const bank = await this.bankRepository.findOne({
        where: { name: createBankDto.name, userId: createBankDto.userId }
      })
      if (bank === null) {
        const res = await this.bankRepository.save(createBankDto)
        return res
      } else ErrorHandler.CONFLICT_MESSAGE('This bank already exists')
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async update(id: string, data: Omit<UpdateBankDto, 'id'>) {
    try {
      const res = await this.bankRepository.update(data, {
        id
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async delete(id: string) {
    try {
      const res = await this.bankRepository.delete(id)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getAllById(userId: string) {
    try {
      const res = await this.bankRepository.find({
        where: { userId }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
