import { Injectable } from '@nestjs/common'
import { CreateCreditCardDto } from './dto/create-credit-card.dto'
import { CreditCard } from './credit-card.entity'
import { ErrorHandler } from '../utils/ErrorHandler'
import { UpdateCreditCardDto } from './dto/update-credit-card.dto'
import { GetCreditCardDto } from './dto/get-credit-cards.dto'
import { Repository } from 'typeorm'

@Injectable()
export class CreditCardService {
  constructor(private readonly creditCardRepository: Repository<CreditCard>) {}

  async create(createCreditCard: CreateCreditCardDto) {
    try {
      const res = await this.creditCardRepository.create(createCreditCard)
      return res.id
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  async update(id: string, data: Omit<UpdateCreditCardDto, 'id'>) {
    try {
      const res = await this.creditCardRepository.update(data, {
        id
      })
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

  async getAllById(id: string, filters: Omit<GetCreditCardDto, 'user'>) {
    try {
      const res = await this.creditCardRepository.find({
        where: { ...filters, user: { id } }
      })
      return res
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }
}
