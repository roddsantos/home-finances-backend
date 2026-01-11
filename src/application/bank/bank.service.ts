import { Injectable } from '@nestjs/common'
import { Bank } from './bank.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Like, Or, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { GeneralService } from '../app/general/service.general'
import * as path from 'path'
import { BANK_MODULE } from '../core/consts/filename.consts'
import { CreateBankTemplateDto, UpdateBankTemplateDto } from '../core/types/bank'

@Injectable()
export class BankService extends GeneralService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>
  ) {
    super(path.join(__dirname, BANK_MODULE.service))
  }

  async create(createBankDto: CreateBankTemplateDto) {
    try {
      const { name, userId } = createBankDto
      const bank = await this.getOneByNameAndUserId(name, userId)

      if (!bank) {
        this.logger.error(
          `bank already exists with this name : ${name}`,
          this.logDirectory
        )
        ErrorHandler.CONFLICT_MESSAGE(`bank already exists with this name : ${name}`)
      }

      const res = await this.bankRepository.save(createBankDto)
      return res
    } catch (error) {
      ErrorHandler.handle(error)
    }
  }

  async update(data: UpdateBankTemplateDto) {
    try {
      const { id, ...rest } = data
      const bank = await this.getOneById(id)

      await this.bankRepository.update({ id }, rest)

      return { ...bank, ...rest }
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

  async getOneByNameAndUserId(name: string, userId: string) {
    try {
      const bank = await this.bankRepository.findOne({
        where: { name, userId }
      })
      return bank
    } catch (error) {
      this.logger.error(
        `error fetching bank : userId : ${userId} : name : ${name}`,
        this.logDirectory
      )
      ErrorHandler.handle(error)
    }
  }

  async getAllById(userId: string, isPiggyBank?: boolean) {
    try {
      this.logger.info(
        `retrieving all banks by userId : userId : ${userId}`,
        this.logDirectory
      )
      const res = await this.bankRepository.find({
        where: {
          userId,
          isPiggyBank:
            isPiggyBank === undefined ? Or(Like(true), Like(false)) : isPiggyBank
        },
        order: { name: 'ASC' }
      })
      return res
    } catch (error) {
      this.logger.error(
        `error retrieving bank data : userId : ${userId}`,
        this.logDirectory
      )
      ErrorHandler.handle(error)
    }
  }

  async getOneById(id: string) {
    try {
      this.logger.info(`retrieving bank data : id : ${id}`, this.logDirectory)
      const bank = await this.bankRepository.findOneBy({ id })

      if (!bank) {
        this.logger.error(`bank not found : id : ${id}`, this.logDirectory)
        ErrorHandler.NOT_FOUND_MESSAGE('banks - bank not found')
      }
      return bank
    } catch (error) {
      this.logger.error(`error retrieving bank : id : ${id}`, this.logDirectory)
      ErrorHandler.NOT_FOUND_MESSAGE('banks - error retrieving bank')
    }
  }
}
