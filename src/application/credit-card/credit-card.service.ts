import { Injectable } from '@nestjs/common'
import { CreditCard } from './credit-card.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import * as path from 'path'
import { CREDIT_CARD_MODULE } from '../core/consts/filename.consts'
import { GeneralService } from '../app/general/service.general'
import {
  CreateCreditCardTemplateDto,
  UpdateCreditCardTemplateDto
} from '../core/types/credit-card'

@Injectable()
export class CreditCardService extends GeneralService {
  constructor(
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>
  ) {
    super(path.join(__dirname, CREDIT_CARD_MODULE.service))
  }

  async create(createCreditCard: CreateCreditCardTemplateDto) {
    try {
      const cc = await this.creditCardRepository.findOne({
        where: {
          name: createCreditCard.name,
          userId: createCreditCard.userId,
          month: createCreditCard.month,
          year: createCreditCard.year
        }
      })
      if (cc) {
        this.logger.error(
          'Credit Card - This credit card already exists',
          this.logDirectory
        )
        ErrorHandler.CONFLICT_MESSAGE('Credit Card - This credit card already exists')
      }
      const res = this.creditCardRepository.save({
        ...createCreditCard,
        limitLeft: createCreditCard.limit
      })
      return res
    } catch (error) {
      this.logger.error('Credit Card - error creating credit card', this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('Credit Card - error creating credit card')
    }
  }

  async update(id: string, data: Partial<Omit<UpdateCreditCardTemplateDto, 'id'>>) {
    try {
      const res = await this.creditCardRepository.update({ id }, data)
      return { ...res, id }
    } catch (error) {
      this.logger.error('Credit Card - error updating credit card', this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('Credit Card - error uppdating credit card')
    }
  }

  async delete(id: string) {
    try {
      const res = await this.creditCardRepository.delete(id)
      return res
    } catch (error) {
      this.logger.error('Credit Card - error deleting credit card', this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('Credit Card - error deleting credit card')
    }
  }

  async getAllById(userId: string) {
    try {
      const res = await this.creditCardRepository.find({
        where: { userId },
        order: { updatedAt: 'DESC' }
      })
      return res
    } catch (error) {
      this.logger.error(
        'Credit Card - error retrieving all credit cards by id',
        this.logDirectory
      )
      ErrorHandler.INTERNAL_SERVER_ERROR(
        'Credit Card - error retrieving all credit cards by id'
      )
    }
  }

  async getOneById(id: string) {
    try {
      const res = await this.creditCardRepository.findOne({
        where: { id }
      })
      return res
    } catch (error) {
      this.logger.error('Credit Card - error retrieving credit card', this.logDirectory)
      ErrorHandler.INTERNAL_SERVER_ERROR('Credit Card - error retrieving credit card')
    }
  }
}
