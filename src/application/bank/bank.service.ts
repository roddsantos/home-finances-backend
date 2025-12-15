import { Injectable } from '@nestjs/common'
import { Bank } from './bank.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { CreateBankDto } from './dto/create-bank.dto'
import { UpdateBankDto } from './dto/update-bank.dto'
import { Like, Or, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { GeneralService } from '../app/general/service.general'
import * as path from 'path'

@Injectable()
export class BankService extends GeneralService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>
  ) {
    super(path.join(__dirname, '../../logs'))
  }

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
      const res = await this.bankRepository.update({ id }, data)
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

  async getAllById(userId: string, isPiggyBank?: boolean) {
    try {
      const res = await this.bankRepository.find({
        where: {
          userId,
          isPiggyBank:
            isPiggyBank === undefined ? Or(Like(true), Like(false)) : isPiggyBank
        }
      })
      return res
    } catch (error) {
      ErrorHandler.handle(error)
    }
  }

  async getOneById(id: string) {
    try {
      return await this.bankRepository.findOne({
        where: { id },
        order: { updatedAt: 'DESC' }
      })
    } catch (error) {
      this.logger.error(this.logDirectory + ' Bills - Bank 1 not found')
      ErrorHandler.NOT_FOUND_MESSAGE('Banks - Bank not found')
    }
  }
}
