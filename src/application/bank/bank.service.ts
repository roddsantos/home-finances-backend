import { Injectable } from '@nestjs/common'
import { Bank } from './bank.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { CreateBankDto } from './dto/create-bank.dto'
import { UpdateBankDto } from './dto/update-bank.dto'

@Injectable()
export class BankService {
  constructor(private readonly bankRepository: typeof Bank) {}

  async create(createBankDto: CreateBankDto) {
    try {
      const res = await this.bankRepository.create(createBankDto)
      return res.id
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async update(updateBankDto: UpdateBankDto) {
    try {
      const res = await this.bankRepository.update(updateBankDto, {
        where: { id: updateBankDto.id }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async delete(id: number) {
    try {
      const res = await this.bankRepository.destroy({ where: { id } })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getAllById(user: number) {
    try {
      const res = await this.bankRepository.findAll<Bank>({
        where: { user }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
