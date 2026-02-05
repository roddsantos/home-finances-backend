import { Injectable } from '@nestjs/common'
import { Bank } from './bank.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { ILike, Like, Or, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { GeneralService } from '../app/general/service.general'
import * as path from 'path'
import { BANK_MODULE } from '../core/consts/filename.consts'
import { CreateBankTemplateDto, UpdateBankTemplateDto } from '../core/types/bank'
import { objectToString } from '../utils/conversions'

@Injectable()
export class BankService extends GeneralService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>
  ) {
    super(path.join(__dirname, BANK_MODULE.service))
  }

  async create(userId: string, createBankDto: CreateBankTemplateDto) {
    try {
      const { name } = createBankDto
      const bank = await this.getOneByNameAndUserId(name, userId)

      if (bank) {
        this.logger.error(
          `bank already exists with this name : ${name}`,
          this.logDirectory
        )
        ErrorHandler.CONFLICT_MESSAGE(`bank already exists with this name : ${name}`)
      }

      const res = await this.bankRepository.save({ ...createBankDto, userId })
      return res
    } catch (error) {
      this.logger.error(
        `error creating bank : ${objectToString(error)}`,
        this.logDirectory
      )
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
      this.logger.error(
        `error updating bank : ${objectToString(error)}`,
        this.logDirectory
      )
      ErrorHandler.handle(error)
    }
  }

  async delete(id: string) {
    try {
      const res = await this.bankRepository.delete(id)
      return res
    } catch (error) {
      this.logger.error(
        `error deleting bank : ${objectToString(error)}`,
        this.logDirectory
      )
      ErrorHandler.handle(error)
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
        `error fetching bank : userId : ${userId} : name : ${name} : error : ${objectToString(error)}`,
        this.logDirectory
      )
      ErrorHandler.handle(error)
    }
  }

  async getAllById(userId: string, isPiggyBank?: boolean) {
    try {
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

  async getBySearchTerm(searchTerm: string, userId: string) {
    if (!userId) {
      this.logger.error(`userId not found : userId : ${userId}`, this.logDirectory)
      ErrorHandler.BAD_REQUEST('banks - userId not found')
    }
    if (!searchTerm) {
      return []
    }

    try {
      const searchResult = await this.bankRepository.find({
        select: { id: true, name: true, description: true, savings: true },
        where: { name: ILike(`%${searchTerm}%`), userId }
      })
      return searchResult.map((bank) => ({
        id: bank.id,
        description: bank.description,
        title: bank.name,
        type: 'bank',
        date: null,
        value: bank.savings
      }))
    } catch (error) {
      this.logger.error(
        `error retrieving bank by search term : searchTerm : ${searchTerm} : error : ${error}`,
        this.logDirectory
      )
      ErrorHandler.NOT_FOUND_MESSAGE('banks - error retrieving bank by search term')
    }
  }
}
