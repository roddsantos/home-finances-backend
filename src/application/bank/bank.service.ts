import { Injectable } from '@nestjs/common'
import { Bank } from './bank.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { CreateBankDto } from './dto/create-bank.dto'
import { UpdateBankDto } from './dto/update-bank.dto'
import { Repository } from 'typeorm'

@Injectable()
export class BankService {
  constructor(private readonly bankRepository: Repository<Bank>) {}

  async create(createBankDto: CreateBankDto) {
    try {
      const res = await this.bankRepository.create(createBankDto)
      return res.id
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

  async getAllById(id: string) {
    try {
      const res = await this.bankRepository.find({
        where: { user: { id } }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
