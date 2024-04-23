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
        where: { name: createCreditCard.name, userId: createCreditCard.userId }
      })
      if (cc === null) {
        const res = this.creditCardRepository.save(createCreditCard)
        return res
      } else ErrorHandler.CONFLICT_MESSAGE('This credit card already exists')
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async update(id: string, data: Omit<UpdateCreditCardDto, 'id'>) {
    try {
      const res = await this.creditCardRepository.update({ id }, data)
      return res
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

  async getAllById(
    userId: string,
    page: number,
    take: number,
    filters: Omit<GetCreditCardDto, 'userId' | 'page' | 'limit'>
  ) {
    try {
      const res = await this.creditCardRepository.find({
        where: { ...filters, userId },
        take,
        skip: take * page - take
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async getOneById(id: string) {
    try {
      const res = await this.creditCardRepository.findOne({
        where: { id }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
