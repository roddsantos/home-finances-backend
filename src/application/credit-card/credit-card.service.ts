import { Injectable } from '@nestjs/common'
import { CreateCreditCardDto } from './dto/create-credit-card.dto'
import { CreditCard } from './credit-card.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { UpdateCreditCardDto } from './dto/update-credit-card.dto'
import { GetCreditCardDto } from './dto/get-credit-cards.dto'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class CreditCardService {
  constructor(
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>
  ) {}

  async create(createCreditCard: CreateCreditCardDto) {
    try {
      const cc = await this.creditCardRepository.findOne({
        where: {
          name: createCreditCard.name,
          userId: createCreditCard.userId,
          month: createCreditCard.month,
          year: createCreditCard.year
        }
      })
      if (cc) ErrorHandler.CONFLICT_MESSAGE('This credit card already exists')
      const res = this.creditCardRepository.save(createCreditCard)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async update(id: string, data: Partial<Omit<UpdateCreditCardDto, 'id'>>) {
    try {
      const res = await this.creditCardRepository.update({ id }, data)
      return { ...res, id }
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async delete(id: string) {
    try {
      const res = await this.creditCardRepository.delete(id)
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getAllById(userId: string, filters: Omit<GetCreditCardDto, 'userId'>) {
    try {
      const res = await this.creditCardRepository.find({
        where: { ...filters, userId },
        order: { updatedAt: 'DESC' }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getOneById(id: string, options?: any) {
    try {
      const res = await this.creditCardRepository.findOne({
        where: { id, ...options }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getCreditCardValues(userId: string) {
    try {
      const filterObject = {
        months: [new Date().getMonth()],
        years: [new Date().getFullYear()]
      }
      const dates: Array<Date[]> = []
      filterObject.years.forEach((y) =>
        filterObject.months.forEach((m) => {
          dates.push([new Date(y, m, 1), new Date(y, m + 1, 0)])
        })
      )
      const total = await this.creditCardRepository.sum('invoice', {
        userId,
        month: new Date().getMonth(),
        year: new Date().getFullYear()
      })
      const count = await this.creditCardRepository.count({
        where: {
          userId,
          month: new Date().getMonth(),
          year: new Date().getFullYear()
        }
      })
      return {
        total: total || 0,
        count
      }
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
